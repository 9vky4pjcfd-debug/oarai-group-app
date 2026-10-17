import { environmentConfig } from '@/config';
import { useAuthState } from '@/features/auth/AuthProvider';
import { useContent } from '@/features/content';
import { getTierProgress, type TierProgress } from '@/features/member/membership-rules';
import { DEMO_MEMBER_ID } from '@/repositories/mock/mock-membership';
import { services } from '@/services';
import type { HotelPublicProfile, MemberProfileDocument, PointAccountDocument, PointTransactionDocument } from '@/types';

export type MemberIdentity =
  | { status: 'loading'; userId: null; isDemo: false }
  | { status: 'signed-out'; userId: null; isDemo: false }
  | { status: 'member'; userId: string; isDemo: boolean };

/** The signed-in member, or a demo member while the app runs on mock data without sign-in. */
export function useMemberIdentity(): MemberIdentity {
  const auth = useAuthState();
  if (auth.status === 'authenticated') return { status: 'member', userId: auth.session.user.uid, isDemo: false };
  if (environmentConfig.backendMode === 'mock') return { status: 'member', userId: DEMO_MEMBER_ID, isDemo: true };
  if (auth.status === 'loading') return { status: 'loading', userId: null, isDemo: false };
  return { status: 'signed-out', userId: null, isDemo: false };
}

export interface MembershipSummary {
  profile: MemberProfileDocument;
  account: PointAccountDocument;
  progress: TierProgress;
  tiers: Awaited<ReturnType<typeof services.member.getTiers>>;
}

/** Profile, group-wide balance and tier. Resolves to null for a user who has no membership yet. */
export function useMembership(userId: string | null) {
  return useContent(`membership:${userId ?? '-'}`, async (): Promise<MembershipSummary | null> => {
    if (!userId) return null;
    const [profile, account, tiers] = await Promise.all([services.member.getProfile(userId), services.points.getAccount(userId), services.member.getTiers()]);
    if (!profile || !account || tiers.length === 0) return null;
    // The tier is recomputed from qualifying points so the card stays right even if the stored tier lags behind.
    return { profile, account, tiers, progress: getTierProgress(account.qualifyingPoints, tiers) };
  });
}

export interface PointHistory { transactions: PointTransactionDocument[]; hotels: Map<string, HotelPublicProfile>; }

export function usePointHistory(userId: string | null, limit = 50) {
  return useContent(`point-history:${userId ?? '-'}:${limit}`, async (force): Promise<PointHistory | null> => {
    if (!userId) return null;
    const [transactions, hotels] = await Promise.all([services.points.getTransactions(userId, limit), services.hotelContent.getHotels({ forceRefresh: force })]);
    return { transactions, hotels: new Map(hotels.map((hotel) => [hotel.hotelId, hotel])) };
  });
}
