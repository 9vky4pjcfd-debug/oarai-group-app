import { describe, expect, it } from 'vitest';
import { calculateEarnedPoints, getTierProgress, resolveTier } from '@/features/member/membership-rules';
import { mockMembershipTiers as tiers } from '@/repositories/mock/mock-membership';

describe('membership rules', () => {
  it('picks the highest tier reached, in any input order', () => {
    const shuffled = [...tiers].reverse();
    expect(resolveTier(0, shuffled).tierId).toBe('blue');
    expect(resolveTier(499, shuffled).tierId).toBe('blue');
    expect(resolveTier(500, shuffled).tierId).toBe('silver');
    expect(resolveTier(1860, shuffled).tierId).toBe('gold');
    expect(resolveTier(99999, shuffled).tierId).toBe('platinum');
  });
  it('reports progress to the next tier', () => {
    expect(getTierProgress(1000, tiers)).toMatchObject({ current: { tierId: 'silver' }, next: { tierId: 'gold' }, remaining: 500, ratio: 0.5 });
    expect(getTierProgress(5000, tiers)).toMatchObject({ current: { tierId: 'platinum' }, next: null, remaining: 0, ratio: 1 });
  });
  it('earns 1 base point per ¥100 and applies the tier multiplier to the balance only', () => {
    const silver = tiers.find((tier) => tier.tierId === 'silver')!;
    expect(calculateEarnedPoints(36_099, silver)).toEqual({ base: 360, total: 450 });
    expect(calculateEarnedPoints(-500, silver)).toEqual({ base: 0, total: 0 });
  });
  it('requires at least one tier', () => { expect(() => resolveTier(0, [])).toThrow(); });
});
