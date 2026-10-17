import type { MembershipTier } from '@/types';

/** Base earn rate shared by every group hotel: 1 point per this many yen spent. */
export const YEN_PER_BASE_POINT = 100;

const byThreshold = (tiers: readonly MembershipTier[]) => [...tiers].sort((a, b) => a.qualifyingPoints - b.qualifyingPoints);

/** The highest tier whose threshold the member has reached; the lowest tier when none is reached. */
export function resolveTier(qualifyingPoints: number, tiers: readonly MembershipTier[]): MembershipTier {
  const sorted = byThreshold(tiers);
  const lowest = sorted[0];
  if (!lowest) throw new Error('At least one membership tier is required.');
  return sorted.reduce((current, tier) => (qualifyingPoints >= tier.qualifyingPoints ? tier : current), lowest);
}

export interface TierProgress {
  current: MembershipTier;
  next: MembershipTier | null;
  /** Qualifying points still needed for the next tier; 0 at the top tier. */
  remaining: number;
  /** 0–1 progress from the current tier's threshold to the next one; 1 at the top tier. */
  ratio: number;
}

export function getTierProgress(qualifyingPoints: number, tiers: readonly MembershipTier[]): TierProgress {
  const current = resolveTier(qualifyingPoints, tiers);
  const next = byThreshold(tiers).find((tier) => tier.qualifyingPoints > current.qualifyingPoints) ?? null;
  if (!next) return { current, next, remaining: 0, ratio: 1 };
  const span = next.qualifyingPoints - current.qualifyingPoints;
  const remaining = Math.max(next.qualifyingPoints - qualifyingPoints, 0);
  return { current, next, remaining, ratio: Math.min(Math.max((span - remaining) / span, 0), 1) };
}

/** Points for a stay or purchase. `base` counts toward the tier; `total` (with the tier bonus) is added to the balance. */
export function calculateEarnedPoints(amountYen: number, tier: MembershipTier): { base: number; total: number } {
  const base = Math.floor(Math.max(amountYen, 0) / YEN_PER_BASE_POINT);
  return { base, total: Math.floor(base * tier.earnRate) };
}
