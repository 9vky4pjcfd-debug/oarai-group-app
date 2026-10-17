import { AppError, type BookingPolicy, type BookingRequest, type DateOnly, type ReservationDocument, type Room, type StaySearch } from '@/types';

/** Provisional rules until the group confirms them. Kept in one place so the backend can serve them later. */
export const defaultBookingPolicy: BookingPolicy = {
  // 3 and 2 days before: 30 %, the day before: 50 %, on the day and no-show: 100 %.
  cancellationFees: [{ daysBefore: 3, rate: 0.3 }, { daysBefore: 1, rate: 0.5 }, { daysBefore: 0, rate: 1 }],
  noShowRate: 1,
  maxNights: 7,
  bookingWindowDays: 365,
  maxRoomsOnline: 5,
  childAge: { min: 3, max: 12 },
  childRate: 0.5,
  paymentMethod: 'pay-at-hotel',
};

const DAY_MS = 24 * 60 * 60 * 1000;
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

/** Today's date at the hotels (Asia/Tokyo). */
export function todayAtHotel(now: number = Date.now()): DateOnly {
  return new Date(now + JST_OFFSET_MS).toISOString().slice(0, 10);
}

export function isDateOnly(value: string): boolean {
  return datePattern.test(value) && toDateOnly(parseDateOnly(value)) === value;
}

export function parseDateOnly(value: DateOnly): Date { return new Date(`${value}T00:00:00Z`); }
export function toDateOnly(date: Date): DateOnly { return date.toISOString().slice(0, 10); }
export function addDays(value: DateOnly, days: number): DateOnly { return toDateOnly(new Date(parseDateOnly(value).getTime() + days * DAY_MS)); }
export function daysBetween(from: DateOnly, to: DateOnly): number { return Math.round((parseDateOnly(to).getTime() - parseDateOnly(from).getTime()) / DAY_MS); }

/** Every night of the stay, by the date the night starts. */
export function stayNights(checkIn: DateOnly, checkOut: DateOnly): DateOnly[] {
  return Array.from({ length: Math.max(0, daysBetween(checkIn, checkOut)) }, (_, index) => addDays(checkIn, index));
}

/** Guests who take a bed; infants share one and are not counted. */
export function bedGuests(search: Pick<StaySearch, 'adults' | 'children'>): number { return search.adults + search.children; }

/**
 * Whether the party can be split over `rooms` rooms of this type: every room gets at least one adult
 * and stays within the room's capacity. Per-person pricing makes the exact split irrelevant to the price.
 */
export function roomFitsParty(room: Pick<Room, 'capacityMin' | 'capacityMax'>, search: Pick<StaySearch, 'adults' | 'children' | 'rooms'>): boolean {
  const size = bedGuests(search);
  return search.adults >= search.rooms && size >= search.rooms * (room.capacityMin ?? 1) && size <= search.rooms * room.capacityMax;
}

function invalid(message: string): never { throw new AppError('VALIDATION_ERROR', message); }

export function validateStaySearch(search: StaySearch, policy: BookingPolicy, today: DateOnly): void {
  if (!search.hotelId) invalid('A hotel is required.');
  if (!isDateOnly(search.checkIn) || !isDateOnly(search.checkOut)) invalid('Dates must be YYYY-MM-DD.');
  if (search.checkIn < today) invalid('Check-in cannot be in the past.');
  if (daysBetween(today, search.checkIn) > policy.bookingWindowDays) invalid('Check-in is beyond the booking window.');
  const nights = daysBetween(search.checkIn, search.checkOut);
  if (nights < 1) invalid('Check-out must be after check-in.');
  if (nights > policy.maxNights) invalid('The stay is longer than allowed.');
  if (!Number.isInteger(search.adults) || search.adults < 1) invalid('At least one adult is required.');
  if (!Number.isInteger(search.children) || search.children < 0) invalid('Children must be zero or more.');
  if (!Number.isInteger(search.infants) || search.infants < 0 || search.infants > search.adults) invalid('Each infant must share with an adult.');
  if (!Number.isInteger(search.rooms) || search.rooms < 1 || search.rooms > policy.maxRoomsOnline) invalid('Too many rooms for an online booking.');
  if (search.adults < search.rooms) invalid('Every room needs an adult.');
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[0-9\-\s()]{9,20}$/;

export type ContactField = 'name' | 'phone' | 'email';

/** Contact fields that are missing or malformed; empty when the contact is usable. */
export function contactErrors(contact: BookingRequest['contact']): ContactField[] {
  const errors: ContactField[] = [];
  if (contact.name.trim().length === 0 || contact.name.length > 80) errors.push('name');
  if (!phonePattern.test(contact.phone.trim())) errors.push('phone');
  if (!emailPattern.test(contact.email.trim())) errors.push('email');
  return errors;
}

export function validateBookingRequest(request: BookingRequest, policy: BookingPolicy, today: DateOnly): void {
  validateStaySearch(request, policy, today);
  if (!request.roomId) invalid('A room is required.');
  if (contactErrors(request.contact).length > 0) invalid('Contact details are incomplete.');
  if (request.notes.length > 500) invalid('Notes are too long.');
}

/** Share of the total charged if the guest cancels today; 0 when cancellation is still free. */
export function cancellationFeeRate(checkIn: DateOnly, today: DateOnly, policy: BookingPolicy): number {
  const daysBefore = daysBetween(today, checkIn);
  if (daysBefore < 0) return policy.noShowRate;
  return policy.cancellationFees.filter((tier) => daysBefore <= tier.daysBefore).reduce((rate, tier) => Math.max(rate, tier.rate), 0);
}

/** Fee tiers from the earliest to the day of arrival. */
export function sortedFeeTiers(policy: BookingPolicy) { return [...policy.cancellationFees].sort((a, b) => b.daysBefore - a.daysBefore); }

/** Last date the guest can cancel free of charge. */
export function freeCancellationUntil(checkIn: DateOnly, policy: BookingPolicy): DateOnly {
  const firstFeeDay = Math.max(...policy.cancellationFees.map((tier) => tier.daysBefore));
  return addDays(checkIn, -(firstFeeDay + 1));
}

/** Fee in yen for a cancellation at `rate`, rounded down to the yen. */
export function cancellationFee(totalAmount: number, rate: number): number { return Math.floor(totalAmount * rate); }

/**
 * The app cancels only while it is free. Once a fee applies the guest calls the hotel, because payment
 * is taken at the hotel and the fee has to be settled with the staff.
 */
export function canCancelInApp(reservation: Pick<ReservationDocument, 'status' | 'checkIn'>, policy: BookingPolicy, today: DateOnly): boolean {
  if (reservation.status !== 'confirmed' && reservation.status !== 'pending') return false;
  return cancellationFeeRate(reservation.checkIn, today, policy) === 0;
}

/** Upcoming stays first (soonest first), then past and cancelled ones (latest first). */
export function sortReservations(reservations: ReservationDocument[], today: DateOnly): ReservationDocument[] {
  const upcoming = (item: ReservationDocument) => item.status !== 'cancelled' && item.checkOut >= today;
  return [...reservations].sort((a, b) => {
    const ua = upcoming(a);
    const ub = upcoming(b);
    if (ua !== ub) return ua ? -1 : 1;
    return ua ? a.checkIn.localeCompare(b.checkIn) : b.checkIn.localeCompare(a.checkIn);
  });
}
