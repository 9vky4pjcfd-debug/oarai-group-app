import { describe, expect, it } from 'vitest';
import { buildScopedDocumentId, type CrowdStatusRepository, type HotelRepository, type MemberRepository } from '@/repositories';
import { resolveTier } from '@/features/member/membership-rules';
import { MockCrowdStatusRepository, MockHotelRepository, MockMemberRepository, MockPointRepository } from '@/repositories/mock';

function exerciseHotelContract(repository: HotelRepository) { return repository.getRooms('gyoraian'); }
function exerciseCrowdContract(repository: CrowdStatusRepository) { return repository.getRestaurantStatus('hotel-a', 'hinode'); }
function exerciseMemberContract(repository: MemberRepository) { return repository.getProfile('user-a'); }

describe('repository contracts', () => {
  it('keeps hotel data scoped by hotelId', async () => {
    const rooms = await exerciseHotelContract(new MockHotelRepository());
    expect(rooms.length).toBeGreaterThan(0);
    expect(rooms.every((room) => room.hotelId === 'gyoraian')).toBe(true);
  });
  it('lists every group hotel in display order', async () => {
    const hotels = await new MockHotelRepository().getHotels();
    expect(hotels.map((hotel) => hotel.hotelId)).toEqual(['oarai-hotel', 'omoide-romankan', 'doggys-coast-oarai', 'gyoraian']);
  });
  it('returns nothing for an unknown hotel', async () => {
    const repository = new MockHotelRepository();
    expect(await repository.getHotelContent('unknown')).toBeNull();
    expect(await repository.getRooms('unknown')).toEqual([]);
  });
  it('supports a new hotel added as data only', async () => {
    const [base] = await new MockHotelRepository().getHotels();
    const repository = new MockHotelRepository([{ ...base!, hotelId: 'new-hotel', sortOrder: 9 }], []);
    expect((await repository.getHotels()).map((hotel) => hotel.hotelId)).toEqual(['new-hotel']);
  });
  it('returns only a restaurant public summary', async () => { const result = await exerciseCrowdContract(new MockCrowdStatusRepository()); expect(result).toMatchObject({ waitingGroups: 3, restaurantName: '日の出', isPublic: true }); expect(result).not.toHaveProperty('guestName'); });
  it('keys the member profile by user only, shared across hotels', async () => {
    const profile = await exerciseMemberContract(new MockMemberRepository());
    expect(profile).toMatchObject({ userId: 'user-a' });
    expect(profile).not.toHaveProperty('hotelId');
  });
  it('keeps one point balance across hotels that matches the ledger', async () => {
    const points = new MockPointRepository();
    const [account, transactions] = await Promise.all([points.getAccount('user-a'), points.getTransactions('user-a', 50)]);
    expect(new Set(transactions.map((item) => item.hotelId)).size).toBeGreaterThan(1);
    expect(transactions.reduce((sum, item) => sum + item.amount, 0)).toBe(account.balance);
    expect(transactions[0]!.balanceAfter).toBe(account.balance);
    expect(transactions.map((item) => item.createdAt)).toEqual([...transactions.map((item) => item.createdAt)].sort().reverse());
  });
  it('stores a tier that matches its qualifying points', async () => {
    const [account, tiers] = await Promise.all([new MockPointRepository().getAccount('user-a'), new MockMemberRepository().getTiers()]);
    expect(resolveTier(account.qualifyingPoints, tiers).tierId).toBe(account.tierId);
  });
  it('builds collision-safe hotel-scoped public document IDs', () => { expect(buildScopedDocumentId('hotel/a', 'hinode 1')).toBe('hotel%2Fa__hinode%201'); });
});
