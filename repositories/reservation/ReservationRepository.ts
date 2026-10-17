import type { ReservationDocument } from '@/types';

export interface ReservationRepository {
  getOwnReservations(userId: string, hotelId: string): Promise<ReservationDocument[]>;
}

export interface ReservationCommandGateway {
  createReservation(input: unknown): Promise<ReservationDocument>;
  modifyReservation(reservationId: string, input: unknown): Promise<ReservationDocument>;
  cancelReservation(reservationId: string): Promise<ReservationDocument>;
}
