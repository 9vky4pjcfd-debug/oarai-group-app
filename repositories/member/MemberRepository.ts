import type { MemberProfileDocument } from '@/types';

export interface MemberRepository {
  getProfile(userId: string, hotelId: string): Promise<MemberProfileDocument | null>;
}

export interface MemberVerificationGateway {
  verifyMemberQr(qrPayload: string): Promise<{ valid: boolean }>;
}
