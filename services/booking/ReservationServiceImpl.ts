import type { ReservationRepository } from '@/repositories';
import type { HotelContentService, ReservationService } from '@/services/contracts';
import { AppError, type BookingPolicy, type BookingRequest, type RoomOffer, type StaySearch } from '@/types';
import { canCancelInApp, defaultBookingPolicy, roomFitsParty, sortReservations, todayAtHotel, validateBookingRequest, validateStaySearch } from './booking-rules';

export type BookingFailureReason = 'sold-out' | 'price-changed';

/** Why a booking command was refused, when the backend said so. */
export function bookingFailureReason(error: unknown): BookingFailureReason | null {
  if (!(error instanceof AppError)) return null;
  return error.cause === 'sold-out' || error.cause === 'price-changed' ? error.cause : null;
}

export class ReservationServiceImpl implements ReservationService {
  constructor(
    private readonly repository: ReservationRepository,
    private readonly content: HotelContentService,
    private readonly policy: BookingPolicy = defaultBookingPolicy,
    private readonly now: () => number = Date.now,
  ) {}

  getPolicy() { return this.policy; }
  today() { return todayAtHotel(this.now()); }

  /** Room types the party fits into, with availability and price. Types without enough free rooms stay in the list with `remaining` below `search.rooms`. */
  async searchRooms(search: StaySearch): Promise<RoomOffer[]> {
    validateStaySearch(search, this.policy, this.today());
    const [rooms, availability] = await Promise.all([this.content.getRooms(search.hotelId), this.repository.getAvailability(search)]);
    const byRoom = new Map(availability.map((item) => [item.roomId, item]));
    return rooms
      .filter((room) => roomFitsParty(room, search))
      .flatMap((room) => {
        const offer = byRoom.get(room.roomId);
        return offer ? [{ ...offer, room }] : [];
      })
      .sort((a, b) => Number(b.remaining >= search.rooms) - Number(a.remaining >= search.rooms) || a.room.sortOrder - b.room.sortOrder);
  }

  async createReservation(userId: string, request: BookingRequest) {
    validateBookingRequest(request, this.policy, this.today());
    const room = await this.content.getRoom(request.hotelId, request.roomId);
    if (!room) throw new AppError('NOT_FOUND', 'The room does not exist.');
    if (!roomFitsParty(room, request)) throw new AppError('VALIDATION_ERROR', 'The party does not fit this room.');
    return this.repository.createReservation(userId, request);
  }

  async getOwnReservations(userId: string) {
    return sortReservations(await this.repository.getOwnReservations(userId), this.today());
  }

  getOwnReservation(userId: string, reservationId: string) { return this.repository.getOwnReservation(userId, reservationId); }

  async cancelReservation(userId: string, reservationId: string) {
    const reservation = await this.repository.getOwnReservation(userId, reservationId);
    if (!reservation) throw new AppError('NOT_FOUND', 'Reservation not found.');
    if (!canCancelInApp(reservation, this.policy, this.today())) throw new AppError('PERMISSION_DENIED', 'This reservation can no longer be cancelled in the app.');
    return this.repository.cancelReservation(userId, reservationId);
  }
}
