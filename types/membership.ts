import type { LocalizedText } from './public-content';

/** A group membership tier. Tiers are data (Firestore `membershipTiers`), so thresholds and benefits can change without an app release. */
export interface MembershipTier {
  tierId: string;
  name: LocalizedText;
  /** Minimum qualifying points in the rolling 12 months to hold this tier. */
  qualifyingPoints: number;
  /** Multiplier applied to base points earned at any group hotel. */
  earnRate: number;
  benefits: LocalizedText[];
  /** Card colour as a hex string. */
  color: string;
  sortOrder: number;
}
