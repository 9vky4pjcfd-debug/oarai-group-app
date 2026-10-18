import { Timestamp } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { addDays, todayAtHotel } from '@/services/booking/booking-rules';
import type { MembershipTier, ReservationDocument } from '@/types';
import { db } from './app';
import { stayAward } from './core/points';

const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

/**
 * Every morning, stays that checked out yesterday or earlier become `completed` and earn points.
 * Staff cancel a no-show before then so it earns nothing. Each award is keyed by reservation, so a rerun never pays twice.
 */
export const pointsAwardCompletedStays = onSchedule({ schedule: 'every day 06:00', timeZone: 'Asia/Tokyo' }, async () => {
  const today = todayAtHotel();
  const due = await db.collection('reservations').where('status', '==', 'confirmed').where('checkOut', '<=', addDays(today, -1)).limit(400).get();
  const tierSnapshot = await db.collection('membershipTiers').where('published', '==', true).get();
  const tiers = tierSnapshot.docs.map((item) => item.data() as MembershipTier);
  let awarded = 0;

  for (const item of due.docs) {
    await db.runTransaction(async (transaction) => {
      const reservation = await transaction.get(item.ref);
      const data = reservation.data() as ReservationDocument | undefined;
      if (!data || data.status !== 'confirmed') return;
      const accountRef = db.collection('pointAccounts').doc(data.userId);
      const ledgerRef = db.collection('pointTransactions').doc(`stay-${reservation.id}`);
      const [account, ledger] = await transaction.getAll(accountRef, ledgerRef);
      const now = Timestamp.now();
      if (!account?.exists || ledger?.exists || tiers.length === 0) {
        transaction.update(item.ref, { status: 'completed', updatedAt: now });
        return;
      }
      const recent = await transaction.get(db.collection('pointTransactions').where('userId', '==', data.userId).where('type', '==', 'earn').where('createdAt', '>=', Timestamp.fromMillis(now.toMillis() - YEAR_MS)));
      const qualifyingBefore = recent.docs.reduce((sum, entry) => sum + (Number(entry.data().basePoints) || 0), 0);
      const award = stayAward(data.totalAmount, qualifyingBefore, tiers);
      const balanceBefore = Number(account.data()!.balance) || 0;
      transaction.set(ledgerRef, {
        transactionId: ledgerRef.id, userId: data.userId, hotelId: data.hotelId, type: 'earn', amount: award.total, basePoints: award.base,
        balanceBefore, balanceAfter: balanceBefore + award.total, source: 'stay', referenceId: data.confirmationCode,
        description: { ja: 'ご宿泊', 'zh-TW': '住宿', en: 'Stay' }, createdAt: now,
      });
      transaction.update(accountRef, {
        balance: balanceBefore + award.total, qualifyingPoints: award.qualifyingPoints, tierId: award.tierId, tierEvaluatedAt: now,
        version: (Number(account.data()!.version) || 0) + 1, updatedAt: now,
      });
      transaction.update(item.ref, { status: 'completed', pointsAwarded: award.total, updatedAt: now });
      awarded += 1;
    });
  }
  logger.info('Completed stays processed', { due: due.size, awarded });
});
