import type { PointRepository } from '@/repositories';

export class MockPointRepository implements PointRepository {
  async getAccount() { return null; }
  async getTransactions() { return []; }
  async getAvailableCoupons() { return []; }
}
