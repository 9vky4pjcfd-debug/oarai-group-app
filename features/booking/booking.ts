import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useContent } from '@/features/content';
import { isDateOnly } from '@/services/booking/booking-rules';
import { services } from '@/services';
import type { DateOnly, StaySearch } from '@/types';

export type StayParams = { hotelId?: string; checkIn?: string; checkOut?: string; adults?: string; children?: string; infants?: string; rooms?: string; roomId?: string };

/** Reads a stay search from route params; null when anything is missing or malformed. */
export function parseStayParams(params: StayParams): StaySearch | null {
  const adults = Number(params.adults);
  const children = Number(params.children ?? 0);
  const infants = Number(params.infants ?? 0);
  const rooms = Number(params.rooms ?? 1);
  if (!params.hotelId || !params.checkIn || !params.checkOut || !isDateOnly(params.checkIn) || !isDateOnly(params.checkOut)) return null;
  if (![adults, children, infants, rooms].every(Number.isInteger)) return null;
  return { hotelId: params.hotelId, checkIn: params.checkIn, checkOut: params.checkOut, adults, children, infants, rooms };
}

export function toStayParams(search: StaySearch, roomId?: string) {
  return { hotelId: search.hotelId, checkIn: search.checkIn, checkOut: search.checkOut, adults: String(search.adults), children: String(search.children), infants: String(search.infants), rooms: String(search.rooms), ...(roomId ? { roomId } : {}) };
}

const searchKey = (search: StaySearch) => `${search.hotelId}:${search.checkIn}:${search.checkOut}:${search.adults}:${search.children}:${search.infants}:${search.rooms}`;

export const useRoomOffers = (search: StaySearch | null) =>
  useContent(`room-offers:${search ? searchKey(search) : '-'}`, async () => (search ? services.reservations.searchRooms(search) : null));

export const useOwnReservations = (userId: string | null) =>
  useContent(`reservations:${userId ?? '-'}`, async () => (userId ? services.reservations.getOwnReservations(userId) : null));

export const useOwnReservation = (userId: string | null, reservationId: string) =>
  useContent(`reservation:${userId ?? '-'}:${reservationId}`, async () => (userId ? services.reservations.getOwnReservation(userId, reservationId) : null));

/** Locale-aware formatting for stay dates and yen amounts. */
export function useBookingFormat() {
  const { i18n, t } = useTranslation();
  const locale = i18n.resolvedLanguage ?? i18n.language;
  // DateOnly values are parsed at UTC midnight, so format in UTC to keep the calendar day.
  const date = useCallback((value: DateOnly) => new Date(`${value}T00:00:00Z`).toLocaleDateString(locale, { month: 'short', day: 'numeric', weekday: 'short', timeZone: 'UTC' }), [locale]);
  const longDate = useCallback((value: DateOnly) => new Date(`${value}T00:00:00Z`).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short', timeZone: 'UTC' }), [locale]);
  const yen = useCallback((value: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'JPY' }).format(value), [locale]);
  const guests = useCallback((search: Pick<StaySearch, 'adults' | 'children' | 'infants'>) => [
    t('booking.adultCount', { count: search.adults }),
    ...(search.children > 0 ? [t('booking.childCount', { count: search.children })] : []),
    ...(search.infants > 0 ? [t('booking.infantCount', { count: search.infants })] : []),
  ].join(locale.startsWith('en') ? ', ' : '・'), [locale, t]);
  const rooms = useCallback((count: number) => t('booking.roomCount', { count }), [t]);
  const percent = useCallback((rate: number) => new Intl.NumberFormat(locale, { style: 'percent' }).format(rate), [locale]);
  return { date, longDate, yen, guests, rooms, percent };
}
