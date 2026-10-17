import type { CouponDocument, PointAccountDocument, PointTransactionDocument } from '@/types';

/** One group-wide point account per user; transactions record which hotel they happened at. */
export interface PointRepository {
  getAccount(userId: string): Promise<PointAccountDocument | null>;
  /** Newest first. */
  getTransactions(userId: string, limit: number): Promise<PointTransactionDocument[]>;
  getAvailableCoupons(hotelId: string): Promise<CouponDocument[]>;
}

/** Point mutations intentionally have no client repository contract. */
export interface PointCommandGateway {
  requestCouponRedemption(couponId: string): Promise<void>;
}
