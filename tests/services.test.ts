import { describe, expect, it } from 'vitest';
import { MockAuthRepository, MockHotelRepository } from '@/repositories/mock';
import { AuthServiceImpl } from '@/services/auth/AuthServiceImpl';
import { HotelContentServiceImpl } from '@/services/hotel/HotelContentServiceImpl';

describe('services', () => {
  it('exposes loading then unauthenticated auth state', () => {
    const service = new AuthServiceImpl(new MockAuthRepository());
    expect(service.getState().status).toBe('unauthenticated');
  });
  it('updates auth state after sign in and sign out', async () => {
    const service = new AuthServiceImpl(new MockAuthRepository());
    await service.signInWithEmail('guest@example.invalid', 'test-password');
    expect(service.getState().status).toBe('authenticated');
    await service.signOut();
    expect(service.getState().status).toBe('unauthenticated');
  });
  it('delegates hotel reads to the repository', async () => {
    const service = new HotelContentServiceImpl(new MockHotelRepository());
    expect(await service.getRooms('oarai-hotel')).toHaveLength(10);
    expect(await service.getHotels()).toHaveLength(4);
  });
  it('caches the group hotel list', async () => {
    const repository = new MockHotelRepository();
    let calls = 0;
    const original = repository.getHotels.bind(repository);
    repository.getHotels = () => { calls += 1; return original(); };
    const service = new HotelContentServiceImpl(repository);
    await service.getHotels();
    await service.getHotels();
    expect(calls).toBe(1);
  });
});
