import { addDays, daysBetween, isDateOnly } from '@/services/booking/booking-rules';
import { serverRefusalReason } from '@/services/errors/error-mapper';
import { AppError, type DateOnly, type HotelPublicProfile, type LocalizedText, type StaffRole, type User } from '@/types';

export const MAX_RANGE_DAYS = 62;
export const MAX_CONTACT_EMAILS = 10;
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const rank: Record<string, number> = { staff: 1, manager: 2, admin: 3 };

export const staffRole = (user: Pick<User, 'role'> | null | undefined): StaffRole | null =>
  user && user.role in rank ? (user.role as StaffRole) : null;
export const hasRole = (user: Pick<User, 'role'> | null | undefined, minimum: StaffRole) => (rank[user?.role ?? ''] ?? 0) >= rank[minimum]!;

/** Hotels the user may manage: every hotel for admins, otherwise those in their claims. */
export function managedHotels(user: Pick<User, 'role' | 'hotelIds'>, hotels: HotelPublicProfile[]) {
  return user.role === 'admin' ? hotels : hotels.filter((hotel) => user.hotelIds.includes(hotel.hotelId));
}

export const isEmail = (value: string) => emailPattern.test(value.trim());
// A regex rather than `new URL`, whose getters are incomplete on some React Native versions.
export const isHttpsUrl = (value: string) => /^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)+(:\d+)?([/?#]\S*)?$/i.test(value);

/** Parses a non-negative whole number; null when blank, NaN when malformed. */
export function parseCount(value: string): number | null {
  const trimmed = value.trim().replace(/[,，]/g, '');
  if (trimmed === '') return null;
  return /^\d+$/.test(trimmed) ? Number(trimmed) : NaN;
}

export type RangeError = 'date' | 'order' | 'max';
/** Checks an inclusive date range of at most 62 days. */
export function rangeError(from: string, to: string): RangeError | null {
  if (!isDateOnly(from) || !isDateOnly(to)) return 'date';
  if (from > to) return 'order';
  return daysBetween(from, to) + 1 > MAX_RANGE_DAYS ? 'max' : null;
}

export const monthStart = (value: DateOnly) => `${value.slice(0, 7)}-01`;
export function shiftMonth(month: DateOnly, months: number): DateOnly {
  const date = new Date(`${monthStart(month)}T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString().slice(0, 10);
}
export const monthEnd = (month: DateOnly) => addDays(shiftMonth(month, 1), -1);
export function datesBetween(from: DateOnly, to: DateOnly): DateOnly[] {
  const dates: DateOnly[] = [];
  for (let day = from; day <= to; day = addDays(day, 1)) dates.push(day);
  return dates;
}

/** A hotel-local date as the ISO instant of 00:00 Japan time. */
export const jstMidnightIso = (date: DateOnly) => new Date(`${date}T00:00:00+09:00`).toISOString();
/** The Japan-time calendar date of an ISO instant. */
export const jstDate = (iso: string): DateOnly => new Date(Date.parse(iso) + JST_OFFSET_MS).toISOString().slice(0, 10);

/** Keeps only the languages that have text. */
export function cleanLocalized(value: LocalizedText): LocalizedText {
  return Object.fromEntries(Object.entries(value).map(([key, text]) => [key, text?.trim() ?? '']).filter(([, text]) => text !== ''));
}

export function parseEmailList(value: string) {
  const emails = [...new Set(value.split(/[\n,;、\s]+/).map((item) => item.trim()).filter(Boolean))];
  return { emails, invalid: emails.filter((email) => !isEmail(email)) };
}

/** i18n key (under `admin.errors`) for a refused admin call, plus the server's reason when it is one we do not explain. */
export function adminErrorKey(error: unknown): { key: string; reason?: string } {
  const reason = serverRefusalReason(error);
  if (reason && knownReasons.has(reason)) return { key: `reasons.${reason}` };
  const code = error instanceof AppError ? error.code : 'UNKNOWN';
  const key = codeKeys[code] ?? 'generic';
  return reason ? { key, reason } : { key };
}

const knownReasons = new Set(['below-booked', 'email-not-verified', 'not-owner', 'user-not-found', 'invalid-range']);
const codeKeys: Record<string, string> = {
  PERMISSION_DENIED: 'permission', AUTH_REQUIRED: 'signIn', NETWORK_ERROR: 'network', RATE_LIMITED: 'rateLimited',
  NOT_FOUND: 'notFound', VALIDATION_ERROR: 'invalid', SERVER_ERROR: 'server', MAINTENANCE: 'server',
};
