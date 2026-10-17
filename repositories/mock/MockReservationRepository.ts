import type { ReservationRepository } from '@/repositories';

export class MockReservationRepository implements ReservationRepository {
  async getOwnReservations() { return []; }
}
