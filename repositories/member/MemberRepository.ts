import type { MembershipTier, MemberProfileDocument } from '@/types';

/** Membership is shared across the group, so profiles are keyed by user only. */
export interface MemberRepository {
  getProfile(userId: string): Promise<MemberProfileDocument | null>;
  getTiers(): Promise<MembershipTier[]>;
  /** Server command: creates the caller's profile and point account when missing. */
  ensureProfile(input: { displayName: string; preferredLanguage: MemberProfileDocument['preferredLanguage'] }): Promise<MemberProfileDocument>;
}

export interface MemberVerificationGateway {
  verifyMemberQr(qrPayload: string): Promise<{ valid: boolean }>;
}
