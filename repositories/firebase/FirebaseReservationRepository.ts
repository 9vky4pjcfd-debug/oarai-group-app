import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import type { ReservationRepository } from '@/repositories';
import { getFirestoreClient, getFunctionsClient } from '@/services/firebase';
import { mapToAppError } from '@/services/errors';
import { AppError, type BookingRequest, type ReservationDocument, type RoomAvailability, type StaySearch } from '@/types';
import { mapFirestoreDates } from './firestore-mappers';

// checkIn / checkOut are stored as hotel-local YYYY-MM-DD strings, so only audit timestamps are mapped.
const dateFields = ['createdAt', 'updatedAt'] as const;
const toReservation = (data: Record<string, unknown>) => {
  const mapped = mapFirestoreDates<ReservationDocument>(data, dateFields);
  return { ...mapped, cancelledAt: data.cancelledAt == null ? null : mapFirestoreDates<{ cancelledAt: string }>(data, ['cancelledAt']).cancelledAt };
};

/** Server details such as `{ reason: 'sold-out' }` become the AppError cause, so the UI can explain them. */
function mapCallableError(error: unknown): AppError {
  const mapped = mapToAppError(error);
  const details = typeof error === 'object' && error !== null && 'details' in error ? (error as { details?: { reason?: unknown } }).details : undefined;
  return typeof details?.reason === 'string' ? new AppError(mapped.code, mapped.message, { cause: details.reason, retryable: mapped.retryable }) : mapped;
}

async function call<Request, Response>(name: string, data: Request): Promise<Response> {
  try {
    return (await httpsCallable<Request, Response>(getFunctionsClient(), name)(data)).data;
  } catch (error) { throw mapCallableError(error); }
}

/**
 * Reads the signed-in user's reservations from Firestore and sends commands to Cloud Functions
 * (`bookingGetAvailability`, `bookingCreateReservation`, `bookingCancelReservation`), which own
 * inventory, price and the hotel system of record. The server takes the user from the auth token.
 */
export class FirebaseReservationRepository implements ReservationRepository {
  async getOwnReservations(userId: string) {
    try {
      const snapshot = await getDocs(query(collection(getFirestoreClient(), 'reservations'), where('userId', '==', userId)));
      return snapshot.docs.map((item) => toReservation(item.data()));
    } catch (error) { throw mapToAppError(error); }
  }

  async getOwnReservation(userId: string, reservationId: string) {
    try {
      const snapshot = await getDoc(doc(getFirestoreClient(), 'reservations', reservationId));
      if (!snapshot.exists()) return null;
      const reservation = toReservation(snapshot.data());
      return reservation.userId === userId ? reservation : null;
    } catch (error) { throw mapToAppError(error); }
  }

  async getAvailability(search: StaySearch) {
    return (await call<StaySearch, { rooms: RoomAvailability[] }>('bookingGetAvailability', search)).rooms;
  }

  async createReservation(_userId: string, request: BookingRequest) {
    return toReservation(await call<BookingRequest, Record<string, unknown>>('bookingCreateReservation', request));
  }

  async cancelReservation(_userId: string, reservationId: string) {
    return toReservation(await call<{ reservationId: string }, Record<string, unknown>>('bookingCancelReservation', { reservationId }));
  }
}
