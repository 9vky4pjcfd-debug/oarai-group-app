import { stayNights } from '@/services/booking/booking-rules';
import type { BookingPolicy, DateOnly, RoomAvailability, StaySearch } from '@/types';

/** Stored fields of one `bookingInventory/{hotelId}__{roomId}__{date}` document. */
export interface InventoryNight { allotment: number; booked: number; adultRate: number; closed: boolean; }

export function inventoryDocId(hotelId: string, roomId: string, date: DateOnly): string {
  return `${hotelId}__${roomId}__${date}`;
}

/** Unknown or malformed stored values count as "nothing for sale". */
export function readInventoryNight(data: Record<string, unknown> | undefined): InventoryNight | undefined {
  if (!data) return undefined;
  const number = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : 0);
  return { allotment: number(data.allotment), booked: number(data.booked), adultRate: number(data.adultRate), closed: data.closed === true };
}

/** Rooms still for sale on one night; a night without a rate or marked closed sells nothing. */
export function nightRemaining(night: InventoryNight | undefined): number {
  if (!night || night.closed || night.adultRate <= 0) return 0;
  return Math.max(0, Math.floor(night.allotment - night.booked));
}

/** Child rate rounded to ¥100, like a published rate card. */
export function childRate(adultRate: number, policy: BookingPolicy): number {
  return Math.round((adultRate * policy.childRate) / 100) * 100;
}

/** Whole-party price for one night: adults full, children at the child rate, infants free. Room count does not change it. */
export function nightAmount(adultRate: number, party: Pick<StaySearch, 'adults' | 'children'>, policy: BookingPolicy): number {
  return adultRate * party.adults + childRate(adultRate, policy) * party.children;
}

/** Availability and price of one room type over the stay, from its inventory nights (in stay order). */
export function quoteRoom(hotelId: string, roomId: string, search: StaySearch, nights: (InventoryNight | undefined)[], policy: BookingPolicy): RoomAvailability {
  const dates = stayNights(search.checkIn, search.checkOut);
  const remaining = dates.length === 0 ? 0 : Math.min(...dates.map((_, index) => nightRemaining(nights[index])));
  const nightly = remaining >= search.rooms ? dates.map((date, index) => ({ date, amount: nightAmount(nights[index]!.adultRate, search, policy) })) : [];
  return { hotelId, roomId, remaining, nightly, totalAmount: nightly.reduce((sum, night) => sum + night.amount, 0), currency: 'JPY' };
}

/** Every date from `from` to `to`, both included. */
export function dateRange(from: DateOnly, to: DateOnly): DateOnly[] {
  return stayNights(from, to).concat(from <= to ? [to] : []);
}
