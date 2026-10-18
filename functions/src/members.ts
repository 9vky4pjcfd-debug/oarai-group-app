import { Timestamp } from 'firebase-admin/firestore';
import type { MembershipTier, MemberProfileDocument, PointAccountDocument } from '@/types';
import { auth, audit, callable, db, requireUser, toPlain } from './app';
import { membershipNumber } from './core/codes';
import { object, text } from './core/input';
import { resolveTier } from '@/features/member/membership-rules';

async function publishedTiers(): Promise<MembershipTier[]> {
  const snapshot = await db.collection('membershipTiers').where('published', '==', true).get();
  return snapshot.docs.map((item) => item.data() as MembershipTier);
}

/** Creates the caller's group membership (profile + point account) once; later calls return the existing profile. */
export const memberEnsureProfile = callable('memberEnsureProfile', async (request) => {
  const caller = requireUser(request);
  const data = object(request.data);
  const displayName = text(data, 'displayName', 80) || 'Guest';
  const preferredLanguage = data.preferredLanguage === 'zh-TW' || data.preferredLanguage === 'en' ? data.preferredLanguage : 'ja';
  const tiers = await publishedTiers();
  const startTier = tiers.length > 0 ? resolveTier(0, tiers).tierId : 'blue';

  const profileRef = db.collection('memberProfiles').doc(caller.uid);
  const profile = await db.runTransaction(async (transaction) => {
    const existing = await transaction.get(profileRef);
    if (existing.exists) return existing.data()!;
    const counterRef = db.collection('counters').doc('membership');
    const sequence = ((await transaction.get(counterRef)).data()?.next as number | undefined) ?? 1;
    const now = Timestamp.now();
    const created: Omit<MemberProfileDocument, 'createdAt' | 'updatedAt'> & { createdAt: Timestamp; updatedAt: Timestamp } = {
      userId: caller.uid, membershipNumber: membershipNumber(sequence, now.toDate()), displayName, preferredLanguage, homeHotelId: null, createdAt: now, updatedAt: now,
    };
    const account: Omit<PointAccountDocument, 'createdAt' | 'updatedAt' | 'tierEvaluatedAt'> & Record<'createdAt' | 'updatedAt' | 'tierEvaluatedAt', Timestamp> = {
      userId: caller.uid, balance: 0, qualifyingPoints: 0, tierId: startTier, tierEvaluatedAt: now, nextExpiry: null, version: 0, createdAt: now, updatedAt: now,
    };
    transaction.set(counterRef, { next: sequence + 1 }, { merge: true });
    transaction.set(profileRef, created);
    transaction.set(db.collection('pointAccounts').doc(caller.uid), account);
    transaction.set(db.collection('users').doc(caller.uid), { userId: caller.uid, email: caller.email, role: caller.role ?? 'member', roleSource: 'custom-claims', createdAt: now, updatedAt: now });
    transaction.set(db.collection('auditLogs').doc(), audit(caller.uid, 'member.create', 'memberProfile', caller.uid, null));
    return created;
  });
  return toPlain<MemberProfileDocument>(profile);
});

/**
 * Deletes membership, points and the sign-in account. Reservations stay with the hotel for its records
 * and for stays still to come, but are no longer linked to the account.
 */
export const memberDeleteAccount = callable('memberDeleteAccount', async (request) => {
  const caller = requireUser(request);
  const [transactions, reservations] = await Promise.all([
    db.collection('pointTransactions').where('userId', '==', caller.uid).get(),
    db.collection('reservations').where('userId', '==', caller.uid).get(),
  ]);
  const writer = db.bulkWriter();
  transactions.docs.forEach((item) => void writer.delete(item.ref));
  reservations.docs.forEach((item) => void writer.update(item.ref, { userId: 'deleted-account', updatedAt: Timestamp.now() }));
  ['memberProfiles', 'pointAccounts', 'users', 'staffMembers'].forEach((collection) => void writer.delete(db.collection(collection).doc(caller.uid)));
  void writer.create(db.collection('auditLogs').doc(), audit(caller.uid, 'member.delete', 'user', caller.uid, null));
  await writer.close();
  await auth.deleteUser(caller.uid);
  return { deleted: true };
});
