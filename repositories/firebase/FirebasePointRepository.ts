import { collection, doc, getDoc, getDocs, limit as limitQuery, orderBy, query, where } from 'firebase/firestore';
import type { PointRepository } from '@/repositories';
import { getFirestoreClient } from '@/services/firebase';
import { mapToAppError } from '@/services/errors';
import type { CouponDocument, PointAccountDocument, PointTransactionDocument } from '@/types';
import { mapFirestoreDates, toISODateString } from './firestore-mappers';

export class FirebasePointRepository implements PointRepository {
  async getAccount(userId: string) {
    try {
      const snapshot = await getDoc(doc(getFirestoreClient(), 'pointAccounts', userId));
      if (!snapshot.exists()) return null;
      const data = snapshot.data();
      const account = mapFirestoreDates<PointAccountDocument>(data, ['createdAt', 'updatedAt', 'tierEvaluatedAt']);
      return data.nextExpiry ? { ...account, nextExpiry: { amount: Number(data.nextExpiry.amount), expiresAt: toISODateString(data.nextExpiry.expiresAt) } } : account;
    } catch (error) { throw mapToAppError(error); }
  }
  async getTransactions(userId: string, resultLimit: number) {
    try { const snapshot = await getDocs(query(collection(getFirestoreClient(), 'pointTransactions'), where('userId', '==', userId), orderBy('createdAt', 'desc'), limitQuery(Math.min(Math.max(resultLimit, 1), 100)))); return snapshot.docs.map((item) => mapFirestoreDates<PointTransactionDocument>(item.data(), ['createdAt'])); }
    catch (error) { throw mapToAppError(error); }
  }
  async getAvailableCoupons(hotelId: string) {
    try { const snapshot = await getDocs(query(collection(getFirestoreClient(), 'coupons'), where('hotelId', '==', hotelId), where('active', '==', true))); return snapshot.docs.map((item) => mapFirestoreDates<CouponDocument>(item.data(), ['createdAt', 'updatedAt', 'validFrom', 'validUntil'])); }
    catch (error) { throw mapToAppError(error); }
  }
}
