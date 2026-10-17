import type { MemberRepository } from '@/repositories';
import type { MembershipTier, MemberProfileDocument } from '@/types';
import { mockMemberProfile, mockMembershipTiers } from './mock-membership';

export class MockMemberRepository implements MemberRepository {
  constructor(private readonly tiers: MembershipTier[] = mockMembershipTiers) {}
  async getProfile(userId: string): Promise<MemberProfileDocument> { return mockMemberProfile(userId); }
  async getTiers(): Promise<MembershipTier[]> { return [...this.tiers].sort((a, b) => a.sortOrder - b.sortOrder); }
}
