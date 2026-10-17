import type { CrowdStatusRepository } from '@/repositories';
import type { CrowdStatusService } from '@/services/contracts';

export class CrowdStatusServiceImpl implements CrowdStatusService {
  constructor(private readonly repository: CrowdStatusRepository) {}
  getRestaurantStatus(hotelId: string, restaurantId: string) { return this.repository.getRestaurantStatus(hotelId, restaurantId); }
  getBathStatus(hotelId: string, bathId: string) { return this.repository.getBathStatus(hotelId, bathId); }
}
