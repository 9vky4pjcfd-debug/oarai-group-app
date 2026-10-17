import type { MemberRepository } from '@/repositories';
import type { MemberProfileDocument } from '@/types';

export class MockMemberRepository implements MemberRepository {
  async getProfile(userId: string, hotelId: string): Promise<MemberProfileDocument> {
    return { userId, hotelId, membershipNumber: 'MOCK-0001', displayName: 'Mock Member', preferredLanguage: 'ja', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' };
  }
}
