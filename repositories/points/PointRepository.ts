import type { CouponDocument, PointAccountDocument, PointTransactionDocument } from '@/types';

export interface PointRepository {
  getAccount(userId: string, hotelId: string): Promise<PointAccountDocument | null>;
  getTransactions(userId: string, hotelId: string, limit: number): Promise<PointTransactionDocument[]>;
  getAvailableCoupons(hotelId: string): Promise<CouponDocument[]>;
}

/** Point mutations intentionally have no client repository contract. */
export interface PointCommandGateway {
  requestCouponRedemption(couponId: string): Promise<void>;
}
