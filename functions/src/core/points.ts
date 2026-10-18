import { calculateEarnedPoints, resolveTier } from '@/features/member/membership-rules';
import type { MembershipTier } from '@/types';

export interface StayAward {
  /** Counts toward the tier. */
  base: number;
  /** Added to the balance (base × the tier's earn rate at the time of the stay). */
  total: number;
  qualifyingPoints: number;
  tierId: string;
}

/**
 * Points for a completed stay. `qualifyingBefore` is the base points the member earned in the
 * last 12 months before this stay; the tier for the earn rate is the one those points give.
 */
export function stayAward(totalAmount: number, qualifyingBefore: number, tiers: readonly MembershipTier[]): StayAward {
  const { base, total } = calculateEarnedPoints(totalAmount, resolveTier(qualifyingBefore, tiers));
  const qualifyingPoints = qualifyingBefore + base;
  return { base, total, qualifyingPoints, tierId: resolveTier(qualifyingPoints, tiers).tierId };
}
