import { FieldValue, Timestamp, type DocumentReference, type Transaction } from 'firebase-admin/firestore';
import { canCancelInApp, defaultBookingPolicy, roomFitsParty, stayNights, todayAtHotel, validateBookingRequest, validateStaySearch } from '@/services/booking/booking-rules';
import { buildScopedDocumentId } from '@/repositories/scoped-id';
import type { ContentLanguage, HotelPublicProfile, ReservationDocument, Room, RoomAvailability, StaySearch } from '@/types';
import { audit, callable, db, refuse, requireUser, requireVerifiedUser, toPlain } from './app';
import { confirmationCode } from './core/codes';
import { parseBookingRequest, parseStaySearch } from './core/input';
import { inventoryDocId, quoteRoom, readInventoryNight } from './core/inventory';
import { guestCancellationMail, guestConfirmationMail, hotelNoticeMail, type MailContext } from './core/mail';

const policy = defaultBookingPolicy;
/** Upcoming reservations one member may hold at once, so one account cannot sit on the allotment. */
const MAX_ACTIVE_RESERVATIONS = 10;

async function publishedRooms(hotelId: string): Promise<Room[]> {
  const snapshot = await db.collection('rooms').where('hotelId', '==', hotelId).where('published', '==', true).get();
  return snapshot.docs.map((item) => item.data() as Room).sort((a, b) => a.sortOrder - b.sortOrder);
}

function inventoryRefs(hotelId: string, roomId: string, search: StaySearch): DocumentReference[] {
  return stayNights(search.checkIn, search.checkOut).map((date) => db.collection('bookingInventory').doc(inventoryDocId(hotelId, roomId, date)));
}

async function quote(read: (refs: DocumentReference[]) => Promise<{ data(): Record<string, unknown> | undefined }[]>, hotelId: string, roomId: string, search: StaySearch): Promise<{ availability: RoomAvailability; refs: DocumentReference[] }> {
  const refs = inventoryRefs(hotelId, roomId, search);
  const snapshots = refs.length > 0 ? await read(refs) : [];
  return { availability: quoteRoom(hotelId, roomId, search, snapshots.map((item) => readInventoryNight(item.data())), policy), refs };
}

async function mailContext(transaction: Transaction, hotelId: string, roomId: string): Promise<MailContext & { notify: string[] }> {
  const [hotel, room, contacts] = await transaction.getAll(
    db.collection('publicHotelContent').doc(hotelId),
    db.collection('rooms').doc(buildScopedDocumentId(hotelId, roomId)),
    db.collection('hotelBookingContacts').doc(hotelId),
  );
  const profile = hotel?.data()?.content as HotelPublicProfile | undefined;
  return {
    hotelName: profile?.name ?? { ja: hotelId },
    hotelPhone: profile?.phone,
    roomName: (room?.data() as Room | undefined)?.name ?? { ja: roomId },
    notify: Array.isArray(contacts?.data()?.emails) ? (contacts!.data()!.emails as string[]) : [],
  };
}

async function guestLanguage(transaction: Transaction, userId: string): Promise<ContentLanguage> {
  const language = (await transaction.get(db.collection('memberProfiles').doc(userId))).data()?.preferredLanguage;
  return language === 'zh-TW' || language === 'en' ? language : 'ja';
}

/** Public: availability and price for every room type of a hotel that the party fits. */
export const bookingGetAvailability = callable('bookingGetAvailability', async (request) => {
  const search = parseStaySearch(request.data);
  validateStaySearch(search, policy, todayAtHotel());
  const rooms = (await publishedRooms(search.hotelId)).filter((room) => roomFitsParty(room, search));
  const quotes = await Promise.all(rooms.map((room) => quote((refs) => db.getAll(...refs), search.hotelId, room.roomId, search)));
  return { rooms: quotes.map((item) => item.availability) };
});

export const bookingCreateReservation = callable('bookingCreateReservation', async (request) => {
  const caller = requireVerifiedUser(request);
  const input = parseBookingRequest(request.data);
  const today = todayAtHotel();
  validateBookingRequest(input, policy, today);

  const roomSnapshot = await db.collection('rooms').doc(buildScopedDocumentId(input.hotelId, input.roomId)).get();
  const room = roomSnapshot.data() as (Room & { published?: boolean }) | undefined;
  if (!room || room.published !== true || room.hotelId !== input.hotelId) refuse('not-found', 'The room does not exist.', 'not-found');
  if (!roomFitsParty(room, input)) refuse('party-does-not-fit', 'The party does not fit this room.', 'invalid-argument');

  const reservationRef = db.collection('reservations').doc();
  const reservation = await db.runTransaction(async (transaction) => {
    const active = await transaction.get(db.collection('reservations').where('userId', '==', caller.uid).where('status', '==', 'confirmed').where('checkOut', '>=', today));
    if (active.size >= MAX_ACTIVE_RESERVATIONS) refuse('too-many-reservations', 'Too many upcoming reservations.', 'resource-exhausted');

    const { availability, refs } = await quote((items) => transaction.getAll(...items), input.hotelId, input.roomId, input);
    if (availability.remaining < input.rooms) refuse('sold-out', 'The room is no longer available.');
    if (availability.totalAmount !== input.quotedTotal) refuse('price-changed', 'The price has changed.');
    const context = await mailContext(transaction, input.hotelId, input.roomId);
    const language = await guestLanguage(transaction, caller.uid);

    const now = Timestamp.now();
    const document: Omit<ReservationDocument, 'createdAt' | 'updatedAt' | 'cancelledAt'> = {
      reservationId: reservationRef.id,
      userId: caller.uid,
      hotelId: input.hotelId,
      roomId: input.roomId,
      confirmationCode: confirmationCode(now.toDate()),
      externalReservationId: null,
      status: 'confirmed',
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      rooms: input.rooms,
      adults: input.adults,
      children: input.children,
      infants: input.infants,
      guestCount: input.adults + input.children + input.infants,
      totalAmount: availability.totalAmount,
      currency: 'JPY',
      paymentMethod: policy.paymentMethod,
      contact: input.contact,
      notes: input.notes,
    };
    const result: ReservationDocument = { ...document, cancelledAt: null, createdAt: now.toDate().toISOString(), updatedAt: now.toDate().toISOString() };

    refs.forEach((ref) => transaction.update(ref, { booked: FieldValue.increment(input.rooms), updatedAt: now }));
    transaction.set(reservationRef, { ...document, cancelledAt: null, createdAt: now, updatedAt: now });
    transaction.set(db.collection('mail').doc(), { ...guestConfirmationMail(result, context, language, policy), reservationId: reservationRef.id, createdAt: now });
    if (context.notify.length > 0) transaction.set(db.collection('mail').doc(), { ...hotelNoticeMail(result, context, context.notify, 'created'), reservationId: reservationRef.id, createdAt: now });
    transaction.set(db.collection('auditLogs').doc(), audit(caller.uid, 'reservation.create', 'reservation', reservationRef.id, input.hotelId));
    return result;
  });
  return reservation;
});

export const bookingCancelReservation = callable('bookingCancelReservation', async (request) => {
  const caller = requireUser(request);
  const reservationId = typeof (request.data as { reservationId?: unknown } | null)?.reservationId === 'string' ? (request.data as { reservationId: string }).reservationId : '';
  if (!reservationId || reservationId.length > 64) refuse('not-found', 'Reservation not found.', 'not-found');
  const reservationRef = db.collection('reservations').doc(reservationId);

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reservationRef);
    if (!snapshot.exists || snapshot.data()?.userId !== caller.uid) refuse('not-found', 'Reservation not found.', 'not-found');
    const current = toPlain<ReservationDocument>(snapshot.data()!);
    if (!canCancelInApp(current, policy, todayAtHotel())) refuse('fee-applies', 'This reservation can no longer be cancelled in the app.', 'permission-denied');
    const context = await mailContext(transaction, current.hotelId, current.roomId);
    const language = await guestLanguage(transaction, caller.uid);
    const refs = inventoryRefs(current.hotelId, current.roomId, current);
    const inventory = refs.length > 0 ? await transaction.getAll(...refs) : [];

    const now = Timestamp.now();
    const cancelled: ReservationDocument = { ...current, status: 'cancelled', cancelledAt: now.toDate().toISOString(), updatedAt: now.toDate().toISOString() };
    inventory.forEach((night) => { if (night.exists) transaction.update(night.ref, { booked: FieldValue.increment(-current.rooms), updatedAt: now }); });
    transaction.update(reservationRef, { status: 'cancelled', cancelledAt: now, updatedAt: now });
    transaction.set(db.collection('mail').doc(), { ...guestCancellationMail(cancelled, context, language), reservationId, createdAt: now });
    if (context.notify.length > 0) transaction.set(db.collection('mail').doc(), { ...hotelNoticeMail(cancelled, context, context.notify, 'cancelled'), reservationId, createdAt: now });
    transaction.set(db.collection('auditLogs').doc(), audit(caller.uid, 'reservation.cancel', 'reservation', reservationId, current.hotelId));
    return cancelled;
  });
});
