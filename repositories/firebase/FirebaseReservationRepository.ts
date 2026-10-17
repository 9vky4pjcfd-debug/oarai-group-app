import { collection, getDocs, query, where } from 'firebase/firestore';
import type { ReservationRepository } from '@/repositories';
import { getFirestoreClient } from '@/services/firebase';
import { mapToAppError } from '@/services/errors';
import type { ReservationDocument } from '@/types';
import { mapFirestoreDates } from './firestore-mappers';

export class FirebaseReservationRepository implements ReservationRepository {
  async getOwnReservations(userId: string, hotelId: string) {
    try {
      const snapshot = await getDocs(query(collection(getFirestoreClient(), 'reservations'), where('userId', '==', userId), where('hotelId', '==', hotelId)));
      return snapshot.docs.map((item) => mapFirestoreDates<ReservationDocument>(item.data(), ['checkIn', 'checkOut', 'createdAt', 'updatedAt']));
    } catch (error) { throw mapToAppError(error); }
  }
}
