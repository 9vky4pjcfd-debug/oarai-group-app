import { collection, getDocs, limit as limitQuery, query, where } from 'firebase/firestore';
import type { PointRepository } from '@/repositories';
import { getFirestoreClient } from '@/services/firebase';
import { mapToAppError } from '@/services/errors';
import type { CouponDocument, PointAccountDocument, PointTransactionDocument } from '@/types';
import { mapFirestoreDates } from './firestore-mappers';

export class FirebasePointRepository implements PointRepository {
  async getAccount(userId: string, hotelId: string) {
    try { const snapshot = await getDocs(query(collection(getFirestoreClient(), 'pointAccounts'), where('userId', '==', userId), where('hotelId', '==', hotelId), limitQuery(1))); return snapshot.empty ? null : mapFirestoreDates<PointAccountDocument>(snapshot.docs[0]!.data(), ['createdAt', 'updatedAt']); }
    catch (error) { throw mapToAppError(error); }
  }
  async getTransactions(userId: string, hotelId: string, resultLimit: number) {
    try { const snapshot = await getDocs(query(collection(getFirestoreClient(), 'pointTransactions'), where('userId', '==', userId), where('hotelId', '==', hotelId), limitQuery(Math.min(Math.max(resultLimit, 1), 100)))); return snapshot.docs.map((item) => mapFirestoreDates<PointTransactionDocument>(item.data(), ['createdAt'])); }
    catch (error) { throw mapToAppError(error); }
  }
  async getAvailableCoupons(hotelId: string) {
    try { const snapshot = await getDocs(query(collection(getFirestoreClient(), 'coupons'), where('hotelId', '==', hotelId), where('active', '==', true))); return snapshot.docs.map((item) => mapFirestoreDates<CouponDocument>(item.data(), ['createdAt', 'updatedAt', 'validFrom', 'validUntil'])); }
    catch (error) { throw mapToAppError(error); }
  }
}
