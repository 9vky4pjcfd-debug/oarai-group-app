import type { ReservationRepository } from '@/repositories';
import { canCancelInApp, defaultBookingPolicy, stayNights, todayAtHotel } from '@/services/booking/booking-rules';
import { AppError, type BookingRequest, type ReservationDocument, type Room, type RoomAvailability, type StaySearch } from '@/types';
import { mockBackgroundOccupancy, mockNightlyRate, ROOMS_PER_TYPE } from './mock-booking';
import { mockGroupRooms } from './mock-group-hotels';
import { createMemoryStore, type KeyValueStore } from './mock-storage';

const storageKey = 'oarai.mock.reservations.v2';

/** Stands in for the booking server: quotes demo rates, holds demo inventory and keeps bookings on the device. */
export class MockReservationRepository implements ReservationRepository {
  private cache: ReservationDocument[] | null = null;

  constructor(
    private readonly rooms: Room[] = mockGroupRooms,
    private readonly store: KeyValueStore = createMemoryStore(),
    private readonly now: () => number = Date.now,
  ) {}

  async getOwnReservations(userId: string) {
    return (await this.load()).filter((item) => item.userId === userId);
  }

  async getOwnReservation(userId: string, reservationId: string) {
    return (await this.getOwnReservations(userId)).find((item) => item.reservationId === reservationId) ?? null;
  }

  async getAvailability(search: StaySearch): Promise<RoomAvailability[]> {
    const reservations = await this.load();
    const nights = stayNights(search.checkIn, search.checkOut);
    return this.rooms
      .filter((room) => room.hotelId === search.hotelId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((room) => {
        const remaining = Math.min(...nights.map((night) => ROOMS_PER_TYPE
          - mockBackgroundOccupancy(room.roomId, room.hotelId, night)
          - reservations.filter((item) => item.hotelId === room.hotelId && item.roomId === room.roomId && item.status !== 'cancelled' && item.checkIn <= night && night < item.checkOut).reduce((sum, item) => sum + item.rooms, 0)));
        const nightly = remaining >= search.rooms ? nights.map((date) => ({ date, amount: mockNightlyRate(room, date, search) })) : [];
        return { hotelId: room.hotelId, roomId: room.roomId, remaining: Math.max(0, remaining), nightly, totalAmount: nightly.reduce((sum, night) => sum + night.amount, 0), currency: 'JPY' as const };
      });
  }

  async createReservation(userId: string, request: BookingRequest): Promise<ReservationDocument> {
    const offer = (await this.getAvailability(request)).find((item) => item.roomId === request.roomId);
    if (!offer) throw new AppError('NOT_FOUND', 'The room does not exist.');
    if (offer.remaining < request.rooms) throw new AppError('VALIDATION_ERROR', 'The room is no longer available.', { cause: 'sold-out' });
    if (offer.totalAmount !== request.quotedTotal) throw new AppError('VALIDATION_ERROR', 'The price has changed.', { cause: 'price-changed' });
    const createdAt = new Date(this.now()).toISOString();
    const reservation: ReservationDocument = {
      reservationId: `mock-${this.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      userId,
      hotelId: request.hotelId,
      roomId: request.roomId,
      confirmationCode: confirmationCode(this.now()),
      externalReservationId: null,
      status: 'confirmed',
      checkIn: request.checkIn,
      checkOut: request.checkOut,
      rooms: request.rooms,
      adults: request.adults,
      children: request.children,
      infants: request.infants,
      guestCount: request.adults + request.children + request.infants,
      totalAmount: offer.totalAmount,
      currency: 'JPY',
      paymentMethod: 'pay-at-hotel',
      contact: { name: request.contact.name.trim(), phone: request.contact.phone.trim(), email: request.contact.email.trim() },
      notes: request.notes.trim(),
      cancelledAt: null,
      createdAt,
      updatedAt: createdAt,
    };
    await this.save([...(await this.load()), reservation]);
    return reservation;
  }

  async cancelReservation(userId: string, reservationId: string): Promise<ReservationDocument> {
    const reservations = await this.load();
    const current = reservations.find((item) => item.reservationId === reservationId && item.userId === userId);
    if (!current) throw new AppError('NOT_FOUND', 'Reservation not found.');
    if (!canCancelInApp(current, defaultBookingPolicy, todayAtHotel(this.now()))) throw new AppError('PERMISSION_DENIED', 'This reservation can no longer be cancelled in the app.');
    const at = new Date(this.now()).toISOString();
    const cancelled: ReservationDocument = { ...current, status: 'cancelled', cancelledAt: at, updatedAt: at };
    await this.save(reservations.map((item) => item.reservationId === reservationId ? cancelled : item));
    return cancelled;
  }

  private async load(): Promise<ReservationDocument[]> {
    if (this.cache) return this.cache;
    try {
      const raw = await this.store.getItem(storageKey);
      this.cache = raw ? (JSON.parse(raw) as ReservationDocument[]) : [];
    } catch {
      this.cache = [];
    }
    return this.cache;
  }

  private async save(reservations: ReservationDocument[]) {
    this.cache = reservations;
    await this.store.setItem(storageKey, JSON.stringify(reservations));
  }
}

const codeAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function confirmationCode(now: number): string {
  const random = Array.from({ length: 6 }, () => codeAlphabet[Math.floor(Math.random() * codeAlphabet.length)]).join('');
  return `OG${new Date(now).toISOString().slice(2, 4)}-${random}`;
}
