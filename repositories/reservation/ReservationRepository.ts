import type { BookingRequest, ReservationDocument, RoomAvailability, StaySearch } from '@/types';

/**
 * Reservations are group-wide: one list per user across every hotel.
 * Reads may come straight from Firestore; availability, create and cancel are server commands
 * because inventory, price and the hotel system of record live on the server.
 */
export interface ReservationRepository {
  getOwnReservations(userId: string): Promise<ReservationDocument[]>;
  getOwnReservation(userId: string, reservationId: string): Promise<ReservationDocument | null>;
  getAvailability(search: StaySearch): Promise<RoomAvailability[]>;
  createReservation(userId: string, request: BookingRequest): Promise<ReservationDocument>;
  cancelReservation(userId: string, reservationId: string): Promise<ReservationDocument>;
}
