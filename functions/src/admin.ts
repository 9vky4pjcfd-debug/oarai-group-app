import { Timestamp } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';
import { defineString } from 'firebase-functions/params';
import { daysBetween } from '@/services/booking/booking-rules';
import type { AdminNotice, BookingContacts, InventoryRow, ReservationDocument, StaffMember } from '@/types';
import { auth, audit, callable, canManageHotel, db, refuse, requireStaff, requireVerifiedUser, toPlain } from './app';
import { noticeId as newNoticeId } from './core/codes';
import { id, object, parseBookingContacts, parseInventoryQuery, parseInventoryUpdate, parseNotice, parseStaffUpdate } from './core/input';
import { dateRange, inventoryDocId, readInventoryNight } from './core/inventory';
import { seedDocuments } from './seed';

/** Comma-separated emails that may make themselves admin; set at deploy time to the owner's Google account. */
const ownerEmails = defineString('OWNER_EMAILS', { description: 'Comma-separated owner emails that may claim the admin role' });
const MAX_RANGE_NIGHTS = 62;

function checkRange(from: string, to: string) {
  const length = daysBetween(from, to);
  if (length < 0) refuse('invalid-range', 'The start date is after the end date.', 'invalid-argument');
  if (length >= MAX_RANGE_NIGHTS) refuse('invalid-range', `Choose at most ${MAX_RANGE_NIGHTS} days.`, 'invalid-argument');
}

async function hotelRoomIds(hotelId: string): Promise<string[]> {
  const snapshot = await db.collection('rooms').where('hotelId', '==', hotelId).get();
  return snapshot.docs.map((item) => String(item.data().roomId));
}

export const adminClaimOwner = callable('adminClaimOwner', async (request) => {
  const caller = requireVerifiedUser(request);
  const owners = ownerEmails.value().split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);
  if (!caller.email || !owners.includes(caller.email)) refuse('not-owner', 'This account is not an owner.', 'permission-denied');
  await auth.setCustomUserClaims(caller.uid, { role: 'admin', hotels: [] });
  const now = Timestamp.now();
  await db.collection('staffMembers').doc(caller.uid).set({ uid: caller.uid, email: caller.email, role: 'admin', hotelIds: [], updatedAt: now });
  await db.collection('auditLogs').add(audit(caller.uid, 'staff.claimOwner', 'user', caller.uid, null));
  return { role: 'admin' };
});

export const adminSetStaff = callable('adminSetStaff', async (request) => {
  const caller = requireStaff(request, 'admin');
  const update = parseStaffUpdate(request.data);
  let user;
  try { user = await auth.getUserByEmail(update.email); } catch { refuse('user-not-found', 'No app account uses this email yet.', 'not-found'); }
  if (user.uid === caller.uid && update.role !== 'admin') refuse('self-demotion', 'You cannot remove your own admin role.', 'failed-precondition');
  const hotelIds = update.role === 'admin' ? [] : update.hotelIds;
  const ref = db.collection('staffMembers').doc(user.uid);
  if (update.role === 'none') {
    await auth.setCustomUserClaims(user.uid, null);
    await ref.delete();
  } else {
    await auth.setCustomUserClaims(user.uid, { role: update.role, hotels: hotelIds });
    await ref.set({ uid: user.uid, email: update.email, role: update.role, hotelIds, updatedAt: Timestamp.now() });
  }
  await db.collection('auditLogs').add(audit(caller.uid, `staff.set.${update.role}`, 'user', user.uid, null));
  return { ok: true };
});

export const adminListStaff = callable('adminListStaff', async (request) => {
  requireStaff(request, 'admin');
  const snapshot = await db.collection('staffMembers').orderBy('email').get();
  return { staff: snapshot.docs.map((item) => toPlain<StaffMember>(item.data())) };
});

export const adminGetInventory = callable('adminGetInventory', async (request) => {
  const query = parseInventoryQuery(request.data);
  requireStaff(request, 'staff', query.hotelId);
  checkRange(query.from, query.to);
  const roomIds = await hotelRoomIds(query.hotelId);
  const dates = dateRange(query.from, query.to);
  const refs = roomIds.flatMap((roomId) => dates.map((date) => db.collection('bookingInventory').doc(inventoryDocId(query.hotelId, roomId, date))));
  const snapshots = refs.length > 0 ? await db.getAll(...refs) : [];
  const rows: InventoryRow[] = snapshots.map((snapshot, index) => {
    const night = readInventoryNight(snapshot.data()) ?? { allotment: 0, booked: 0, adultRate: 0, closed: false };
    return { hotelId: query.hotelId, roomId: roomIds[Math.floor(index / dates.length)]!, date: dates[index % dates.length]!, ...night };
  });
  return { rows };
});

export const adminSetInventory = callable('adminSetInventory', async (request) => {
  const update = parseInventoryUpdate(request.data);
  const caller = requireStaff(request, 'staff', update.hotelId);
  checkRange(update.from, update.to);
  const known = new Set(await hotelRoomIds(update.hotelId));
  if (update.roomIds.some((roomId) => !known.has(roomId))) refuse('unknown-room', 'A room type does not belong to this hotel.', 'invalid-argument');
  const dates = dateRange(update.from, update.to).filter((date) => !update.weekdays || update.weekdays.includes(new Date(`${date}T00:00:00Z`).getUTCDay()));
  const refs = update.roomIds.flatMap((roomId) => dates.map((date) => ({ roomId, date, ref: db.collection('bookingInventory').doc(inventoryDocId(update.hotelId, roomId, date)) })));
  if (refs.length > 450) refuse('too-many-nights', 'Change fewer nights at once.', 'invalid-argument');

  await db.runTransaction(async (transaction) => {
    const snapshots = refs.length > 0 ? await transaction.getAll(...refs.map((item) => item.ref)) : [];
    // An allotment below what is already sold would oversell, so the whole change is refused.
    const below = snapshots.filter((snapshot) => update.allotment !== undefined && update.allotment < (readInventoryNight(snapshot.data())?.booked ?? 0));
    if (below.length > 0) refuse('below-booked', 'The allotment is below rooms already booked on some nights.');
    const now = Timestamp.now();
    refs.forEach(({ roomId, date, ref }, index) => {
      const fields: Record<string, unknown> = { hotelId: update.hotelId, roomId, date, updatedAt: now, updatedBy: caller.uid };
      if (update.allotment !== undefined) fields.allotment = update.allotment;
      if (update.adultRate !== undefined) fields.adultRate = update.adultRate;
      if (update.closed !== undefined) fields.closed = update.closed;
      if (!snapshots[index]?.exists) Object.assign(fields, { booked: 0, allotment: fields.allotment ?? 0, adultRate: fields.adultRate ?? 0, closed: fields.closed ?? false });
      transaction.set(ref, fields, { merge: true });
    });
    transaction.set(db.collection('auditLogs').doc(), audit(caller.uid, 'inventory.set', 'bookingInventory', `${update.from}..${update.to}`, update.hotelId));
  });
  return { updated: refs.length };
});

export const adminGetBookingContacts = callable('adminGetBookingContacts', async (request) => {
  const hotelId = id(object(request.data), 'hotelId');
  requireStaff(request, 'staff', hotelId);
  const snapshot = await db.collection('hotelBookingContacts').doc(hotelId).get();
  const emails = snapshot.data()?.emails;
  return { hotelId, emails: Array.isArray(emails) ? emails : [] } satisfies BookingContacts;
});

export const adminSetBookingContacts = callable('adminSetBookingContacts', async (request) => {
  const contacts = parseBookingContacts(request.data);
  const caller = requireStaff(request, 'manager', contacts.hotelId);
  await db.collection('hotelBookingContacts').doc(contacts.hotelId).set({ hotelId: contacts.hotelId, emails: contacts.emails, updatedAt: Timestamp.now(), updatedBy: caller.uid });
  await db.collection('auditLogs').add(audit(caller.uid, 'bookingContacts.set', 'hotelBookingContacts', contacts.hotelId, contacts.hotelId));
  return { ok: true };
});

function toAdminNotice(data: Record<string, unknown>): AdminNotice {
  const { createdAt: _created, updatedAt: _updated, updatedBy: _by, ...notice } = toPlain<AdminNotice & Record<string, unknown>>(data);
  return notice as AdminNotice;
}

export const adminListNotices = callable('adminListNotices', async (request) => {
  const caller = requireStaff(request, 'staff');
  const snapshot = caller.role === 'admin' || caller.hotelIds.length === 0
    ? await db.collection('notices').get()
    : await db.collection('notices').where('hotelId', 'in', caller.hotelIds.slice(0, 30)).get();
  const notices = snapshot.docs.map((item) => toAdminNotice(item.data())).filter((notice) => canManageHotel(caller, notice.hotelId));
  return { notices: notices.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)) };
});

export const adminSaveNotice = callable('adminSaveNotice', async (request) => {
  const notice = parseNotice(request.data);
  const caller = requireStaff(request, 'staff', notice.hotelId);
  const now = Timestamp.now();
  const noticeId = notice.noticeId || newNoticeId(now.toDate());
  const ref = db.collection('notices').doc(noticeId);
  await db.runTransaction(async (transaction) => {
    const existing = await transaction.get(ref);
    // Editing must not move another hotel's notice into one the caller manages.
    if (existing.exists && !canManageHotel(caller, (existing.data()!.hotelId as string | null) ?? null)) throw new HttpsError('permission-denied', 'You do not have access to this notice.');
    // A full replace, so fields cleared in the form (expiry, link) disappear.
    transaction.set(ref, { ...notice, noticeId, createdAt: existing.data()?.createdAt ?? now, updatedAt: now, updatedBy: caller.uid });
    transaction.set(db.collection('auditLogs').doc(), audit(caller.uid, 'notice.save', 'notice', noticeId, notice.hotelId));
  });
  return { ...notice, noticeId };
});

export const adminDeleteNotice = callable('adminDeleteNotice', async (request) => {
  const noticeId = id(object(request.data), 'noticeId');
  const caller = requireStaff(request, 'staff');
  const ref = db.collection('notices').doc(noticeId);
  const snapshot = await ref.get();
  if (!snapshot.exists) return { ok: true };
  const hotelId = (snapshot.data()!.hotelId as string | null) ?? null;
  if (!canManageHotel(caller, hotelId)) throw new HttpsError('permission-denied', 'You do not have access to this notice.');
  await ref.delete();
  await db.collection('auditLogs').add(audit(caller.uid, 'notice.delete', 'notice', noticeId, hotelId));
  return { ok: true };
});

export const adminListReservations = callable('adminListReservations', async (request) => {
  const query = parseInventoryQuery(request.data);
  requireStaff(request, 'staff', query.hotelId);
  checkRange(query.from, query.to);
  const snapshot = await db.collection('reservations').where('hotelId', '==', query.hotelId).where('checkIn', '>=', query.from).where('checkIn', '<=', query.to).orderBy('checkIn').get();
  return { reservations: snapshot.docs.map((item) => toPlain<ReservationDocument>(item.data())) };
});

export const adminSeedContent = callable('adminSeedContent', async (request) => {
  const caller = requireStaff(request, 'admin');
  const overwrite = object(request.data).overwrite === true;
  const documents = seedDocuments(Timestamp.now());
  const refs = documents.map((item) => db.collection(item.collection).doc(item.id));
  const existing = overwrite ? [] : await db.getAll(...refs);
  const writer = db.bulkWriter();
  let written = 0;
  documents.forEach((item, index) => {
    if (!overwrite && existing[index]?.exists) return;
    void writer.set(refs[index]!, item.data as Record<string, unknown>);
    written += 1;
  });
  await writer.close();
  await db.collection('auditLogs').add(audit(caller.uid, overwrite ? 'content.seed.overwrite' : 'content.seed', 'content', 'all', null));
  return { written, skipped: documents.length - written };
});
