import { defaultBookingPolicy } from '@/services/booking/booking-rules';
import type { DateOnly, Room, StaySearch } from '@/types';
import { DOGGYS_COAST_ID, GYORAIAN_ID, ROMANKAN_ID } from './mock-group-hotels';
import { OARAI_HOTEL_ID } from './mock-hotel-content';

// Demo rates and inventory only. Real rates and stock must come from each hotel's booking system.

/** Adult rate per night (JPY, tax and service included) for the cheapest room type of each hotel. */
const baseAdultRate: Record<string, number> = {
  [OARAI_HOTEL_ID]: 16500,
  [ROMANKAN_ID]: 24200,
  [DOGGYS_COAST_ID]: 19800,
  [GYORAIAN_ID]: 14300,
};
const defaultBaseRate = 15000;
/** Each step up the room list costs this much more per adult. */
const roomStep = 2200;
/** Saturday nights (and the night before a holiday, not modelled here). */
export const SATURDAY_SURCHARGE = 1.25;
export const ROOMS_PER_TYPE = 3;

export function mockAdultRate(room: Pick<Room, 'hotelId' | 'sortOrder'>): number {
  return (baseAdultRate[room.hotelId] ?? defaultBaseRate) + Math.max(0, room.sortOrder - 1) * roomStep;
}

function hash(value: string): number {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) result = (result * 31 + value.charCodeAt(index)) >>> 0;
  return result;
}

/** Rooms of a type already taken by other guests on a night, so the demo shows busy and sold-out dates. */
export function mockBackgroundOccupancy(roomId: string, hotelId: string, night: DateOnly): number {
  const weekday = new Date(`${night}T00:00:00Z`).getUTCDay();
  const busy = weekday === 6 ? 2 : weekday === 5 ? 1 : 0;
  return Math.min(ROOMS_PER_TYPE, busy + (hash(`${hotelId}:${roomId}:${night}`) % 4 === 0 ? 1 : 0));
}

/** Per-person price for one night: adults full, children at the child rate, infants free. Room count does not change it. */
export function mockNightlyRate(room: Pick<Room, 'hotelId' | 'sortOrder'>, night: DateOnly, party: Pick<StaySearch, 'adults' | 'children'>): number {
  const weekday = new Date(`${night}T00:00:00Z`).getUTCDay();
  // Rates are rounded to ¥100 like a published rate card.
  const adultRate = Math.round((mockAdultRate(room) * (weekday === 6 ? SATURDAY_SURCHARGE : 1)) / 100) * 100;
  const childRate = Math.round((adultRate * defaultBookingPolicy.childRate) / 100) * 100;
  return adultRate * party.adults + childRate * party.children;
}
