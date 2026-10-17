import type { PointRepository } from '@/repositories';
import type { CouponDocument, PointAccountDocument, PointTransactionDocument } from '@/types';
import { mockPointAccount, mockPointTransactions } from './mock-membership';

export class MockPointRepository implements PointRepository {
  async getAccount(userId: string): Promise<PointAccountDocument> { return mockPointAccount(userId); }
  async getTransactions(userId: string, limit: number): Promise<PointTransactionDocument[]> { return mockPointTransactions(userId).slice(0, Math.max(limit, 0)); }
  async getAvailableCoupons(): Promise<CouponDocument[]> { return []; }
}
