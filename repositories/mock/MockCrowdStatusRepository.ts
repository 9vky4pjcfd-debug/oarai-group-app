import type { CrowdStatusRepository } from '@/repositories';
import type { BathPublicStatusDocument, RestaurantPublicStatusDocument } from '@/types';

export class MockCrowdStatusRepository implements CrowdStatusRepository {
  async getRestaurantStatus(hotelId: string, restaurantId: string): Promise<RestaurantPublicStatusDocument> {
    return { hotelId, restaurantId, restaurantName: '日の出', status: 'busy', waitingGroups: 3, estimatedWaitMinutes: 15, updatedAt: new Date().toISOString(), isPublic: true };
  }
  async getBathStatus(hotelId: string, bathId: string): Promise<BathPublicStatusDocument> {
    return { hotelId, bathId, status: 'quiet', updatedAt: new Date().toISOString(), isPublic: true };
  }
}
