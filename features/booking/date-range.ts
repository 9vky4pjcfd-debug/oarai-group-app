import { daysBetween } from '@/services/booking/booking-rules';
import type { DateOnly } from '@/types';

export interface DateRange { checkIn: DateOnly | null; checkOut: DateOnly | null; }

/** Applies one tap to a check-in / check-out range: the first tap starts a stay, the second ends it. */
export function nextRange(range: DateRange, tapped: DateOnly, maxNights: number): DateRange {
  if (!range.checkIn || range.checkOut || tapped <= range.checkIn || daysBetween(range.checkIn, tapped) > maxNights) return { checkIn: tapped, checkOut: null };
  return { checkIn: range.checkIn, checkOut: tapped };
}
