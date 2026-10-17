import { describe, expect, it } from 'vitest';
import { nextRange } from '@/features/booking/date-range';
import { MockHotelRepository, MockReservationRepository } from '@/repositories/mock';
import { mockNightlyRate } from '@/repositories/mock/mock-booking';
import { createMemoryStore } from '@/repositories/mock/mock-storage';
import { addDays, cancellationFeeRate, canCancelInApp, contactErrors, defaultBookingPolicy, freeCancellationUntil, roomFitsParty, sortReservations, stayNights, todayAtHotel, validateStaySearch } from '@/services/booking/booking-rules';
import { bookingFailureReason, ReservationServiceImpl } from '@/services/booking/ReservationServiceImpl';
import { HotelContentServiceImpl } from '@/services/hotel/HotelContentServiceImpl';
import type { BookingRequest, ReservationDocument, StaySearch } from '@/types';

// 2026-10-17 12:00 JST, a Saturday.
const now = Date.parse('2026-10-17T03:00:00Z');
const today = '2026-10-17';
const contact = { name: '大洗 太郎', phone: '029-267-2151', email: 'guest@example.com' };

function createService() {
  const repository = new MockReservationRepository(undefined, createMemoryStore(), () => now);
  return new ReservationServiceImpl(repository, new HotelContentServiceImpl(new MockHotelRepository()), defaultBookingPolicy, () => now);
}

const search: StaySearch = { hotelId: 'oarai-hotel', checkIn: '2026-11-04', checkOut: '2026-11-06', adults: 2, children: 0, infants: 0, rooms: 1 };

describe('booking rules', () => {
  it('uses the date in Japan', () => {
    expect(todayAtHotel(Date.parse('2026-10-17T15:30:00Z'))).toBe('2026-10-18');
    expect(todayAtHotel(now)).toBe(today);
  });
  it('lists each night of a stay across a month end', () => {
    expect(stayNights('2026-10-30', '2026-11-02')).toEqual(['2026-10-30', '2026-10-31', '2026-11-01']);
  });
  it('rejects past, reversed, too long and adult-less searches', () => {
    const check = (patch: Partial<StaySearch>) => () => validateStaySearch({ ...search, ...patch }, defaultBookingPolicy, today);
    expect(check({})).not.toThrow();
    expect(check({ checkIn: '2026-10-16' })).toThrow();
    expect(check({ checkOut: search.checkIn })).toThrow();
    expect(check({ checkOut: addDays(search.checkIn, 8) })).toThrow();
    expect(check({ adults: 0, children: 2 })).toThrow();
    expect(check({ checkIn: '2026-02-30' })).toThrow();
    expect(check({ rooms: 6, adults: 6 })).toThrow();
    expect(check({ rooms: 3, adults: 2 })).toThrow();
    expect(check({ infants: 3 })).toThrow();
  });
  it('matches the party to room capacity, across several rooms', () => {
    expect(roomFitsParty({ capacityMin: 3, capacityMax: 4 }, { adults: 2, children: 0, rooms: 1 })).toBe(false);
    expect(roomFitsParty({ capacityMin: 3, capacityMax: 4 }, { adults: 2, children: 1, rooms: 1 })).toBe(true);
    expect(roomFitsParty({ capacityMin: null, capacityMax: 2 }, { adults: 3, children: 0, rooms: 1 })).toBe(false);
    expect(roomFitsParty({ capacityMin: null, capacityMax: 2 }, { adults: 3, children: 1, rooms: 2 })).toBe(true);
    expect(roomFitsParty({ capacityMin: null, capacityMax: 4 }, { adults: 1, children: 3, rooms: 2 })).toBe(false);
  });
  it('checks contact details', () => {
    expect(contactErrors(contact)).toEqual([]);
    expect(contactErrors({ name: ' ', phone: '12', email: 'nope' })).toEqual(['name', 'phone', 'email']);
  });
  it('charges 30 % three and two days before, 50 % the day before and 100 % on the day', () => {
    const rate = (checkIn: string) => cancellationFeeRate(checkIn, today, defaultBookingPolicy);
    expect(rate('2026-10-21')).toBe(0);
    expect(rate('2026-10-20')).toBe(0.3);
    expect(rate('2026-10-19')).toBe(0.3);
    expect(rate('2026-10-18')).toBe(0.5);
    expect(rate('2026-10-17')).toBe(1);
    expect(rate('2026-10-16')).toBe(1);
    expect(freeCancellationUntil('2026-10-21', defaultBookingPolicy)).toBe('2026-10-17');
  });
  it('cancels in the app only while it is free', () => {
    expect(canCancelInApp({ status: 'confirmed', checkIn: '2026-10-21' }, defaultBookingPolicy, today)).toBe(true);
    expect(canCancelInApp({ status: 'confirmed', checkIn: '2026-10-20' }, defaultBookingPolicy, today)).toBe(false);
    expect(canCancelInApp({ status: 'cancelled', checkIn: '2026-12-01' }, defaultBookingPolicy, today)).toBe(false);
  });
  it('puts upcoming stays first', () => {
    const item = (reservationId: string, checkIn: string, status: ReservationDocument['status'] = 'confirmed') => ({ reservationId, checkIn, checkOut: addDays(checkIn, 1), status }) as ReservationDocument;
    const sorted = sortReservations([item('past', '2026-09-01'), item('later', '2026-12-01'), item('cancelled', '2026-11-01', 'cancelled'), item('soon', '2026-10-20')], today);
    expect(sorted.map((entry) => entry.reservationId)).toEqual(['soon', 'later', 'cancelled', 'past']);
  });
  it('picks check-in then check-out, restarting on an earlier or too-far date', () => {
    const start = nextRange({ checkIn: null, checkOut: null }, '2026-11-04', 7);
    expect(start).toEqual({ checkIn: '2026-11-04', checkOut: null });
    expect(nextRange(start, '2026-11-06', 7)).toEqual({ checkIn: '2026-11-04', checkOut: '2026-11-06' });
    expect(nextRange(start, '2026-11-02', 7)).toEqual({ checkIn: '2026-11-02', checkOut: null });
    expect(nextRange(start, '2026-11-20', 7)).toEqual({ checkIn: '2026-11-20', checkOut: null });
    expect(nextRange({ checkIn: '2026-11-04', checkOut: '2026-11-06' }, '2026-11-10', 7)).toEqual({ checkIn: '2026-11-10', checkOut: null });
  });
  it('prices per person: children half, infants free, Saturdays higher', () => {
    const room = { hotelId: 'oarai-hotel', sortOrder: 1 };
    expect(mockNightlyRate(room, '2026-11-07', { adults: 2, children: 0 })).toBeGreaterThan(mockNightlyRate(room, '2026-11-06', { adults: 2, children: 0 }));
    const adult = mockNightlyRate(room, '2026-11-04', { adults: 1, children: 0 });
    // The child rate is half the adult rate, rounded to ¥100.
    expect(mockNightlyRate(room, '2026-11-04', { adults: 1, children: 1 }) - adult).toBe(Math.round(adult / 2 / 100) * 100);
  });
});

describe('reservation service (mock backend)', () => {
  it('offers only rooms that fit the party, priced for the whole stay', async () => {
    const offers = await createService().searchRooms(search);
    expect(offers.length).toBeGreaterThan(0);
    expect(offers.every((offer) => offer.hotelId === 'oarai-hotel' && roomFitsParty(offer.room, search))).toBe(true);
    const open = offers.find((offer) => offer.remaining > 0)!;
    expect(open.nightly).toHaveLength(2);
    expect(open.totalAmount).toBe(open.nightly[0]!.amount + open.nightly[1]!.amount);
  });

  it('books, lists and cancels a stay, and frees the room again', async () => {
    const service = createService();
    const offer = (await service.searchRooms(search)).find((item) => item.remaining > 0)!;
    const request: BookingRequest = { ...search, roomId: offer.roomId, contact, notes: '', quotedTotal: offer.totalAmount };
    const reservation = await service.createReservation('user-a', request);
    expect(reservation).toMatchObject({ status: 'confirmed', userId: 'user-a', roomId: offer.roomId, totalAmount: offer.totalAmount, guestCount: 2, rooms: 1 });
    expect(reservation.confirmationCode).toMatch(/^OG26-[A-Z2-9]{6}$/);
    expect((await service.searchRooms(search)).find((item) => item.roomId === offer.roomId)!.remaining).toBe(offer.remaining - 1);
    expect(await service.getOwnReservations('user-b')).toEqual([]);
    expect((await service.getOwnReservations('user-a')).map((item) => item.reservationId)).toEqual([reservation.reservationId]);
    await expect(service.cancelReservation('user-b', reservation.reservationId)).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect((await service.cancelReservation('user-a', reservation.reservationId)).status).toBe('cancelled');
    expect((await service.searchRooms(search)).find((item) => item.roomId === offer.roomId)!.remaining).toBe(offer.remaining);
  });

  it('books several rooms at once and takes them all from stock', async () => {
    const service = createService();
    const party: StaySearch = { ...search, adults: 4, children: 1, infants: 1, rooms: 2 };
    const offer = (await service.searchRooms(party)).find((item) => item.remaining >= 2)!;
    // Per-person pricing: the total does not depend on how the party is split over rooms; the infant is free.
    expect(offer.totalAmount).toBe(mockNightlyRate(offer.room, '2026-11-04', party) + mockNightlyRate(offer.room, '2026-11-05', party));
    const reservation = await service.createReservation('user-a', { ...party, roomId: offer.roomId, contact, notes: '', quotedTotal: offer.totalAmount });
    expect(reservation).toMatchObject({ rooms: 2, infants: 1, guestCount: 6 });
    expect((await service.searchRooms(party)).find((item) => item.roomId === offer.roomId)!.remaining).toBe(offer.remaining - 2);
  });

  it('refuses a booking when the price changed or the room is gone', async () => {
    const service = createService();
    const offer = (await service.searchRooms(search)).find((item) => item.remaining > 0)!;
    const request: BookingRequest = { ...search, roomId: offer.roomId, contact, notes: '', quotedTotal: offer.totalAmount + 100 };
    expect(bookingFailureReason(await service.createReservation('user-a', request).catch((error: unknown) => error))).toBe('price-changed');
    for (let index = 0; index < offer.remaining; index += 1) await service.createReservation('user-a', { ...request, quotedTotal: offer.totalAmount });
    expect(bookingFailureReason(await service.createReservation('user-a', { ...request, quotedTotal: offer.totalAmount }).catch((error: unknown) => error))).toBe('sold-out');
  });

  it('keeps bookings in storage between app launches', async () => {
    const store = createMemoryStore();
    const first = new MockReservationRepository(undefined, store, () => now);
    const offer = (await first.getAvailability(search)).find((item) => item.remaining > 0)!;
    await first.createReservation('user-a', { ...search, roomId: offer.roomId, contact, notes: '', quotedTotal: offer.totalAmount });
    expect(await new MockReservationRepository(undefined, store, () => now).getOwnReservations('user-a')).toHaveLength(1);
  });
});
