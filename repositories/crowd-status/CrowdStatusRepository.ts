import type { BathPublicStatusDocument, RestaurantPublicStatusDocument } from '@/types';

export interface CrowdStatusRepository {
  getRestaurantStatus(hotelId: string, restaurantId: string): Promise<RestaurantPublicStatusDocument | null>;
  getBathStatus(hotelId: string, bathId: string): Promise<BathPublicStatusDocument | null>;
}
