import { describe, expect, it } from 'vitest';
import { MockHotelRepository } from '@/repositories/mock';
import { HotelContentServiceImpl } from '@/services/hotel/HotelContentServiceImpl';
import { filterNotices, visibleNotices } from '@/services/hotel/notice-utils';
import type { Notice } from '@/types';

const notice = (noticeId: string, hotelId: string | null, publishedAt: string, extra: Partial<Notice> = {}): Notice => ({
  noticeId, hotelId, publishedAt, category: 'news', priority: 'normal', title: {}, body: {}, sortOrder: 1, ...extra,
});
const now = Date.parse('2026-10-17T12:00:00.000Z');

describe('notices', () => {
  it('hides scheduled and expired notices and sorts newest first', () => {
    const result = visibleNotices([
      notice('old', 'a', '2026-01-01T00:00:00.000Z'),
      notice('future', 'a', '2026-12-01T00:00:00.000Z'),
      notice('expired', null, '2026-05-01T00:00:00.000Z', { expiresAt: '2026-06-01T00:00:00.000Z' }),
      notice('new', null, '2026-10-01T00:00:00.000Z'),
    ], now);
    expect(result.map((item) => item.noticeId)).toEqual(['new', 'old']);
  });
  it('puts important notices first on the same date', () => {
    const result = visibleNotices([notice('normal', null, '2026-10-01T00:00:00.000Z'), notice('urgent', null, '2026-10-01T00:00:00.000Z', { priority: 'important', sortOrder: 9 })], now);
    expect(result[0]!.noticeId).toBe('urgent');
  });
  it('filters by group or by hotel, keeping group-wide notices in a hotel view', () => {
    const list = [notice('g', null, '2026-10-01T00:00:00.000Z'), notice('a', 'hotel-a', '2026-10-01T00:00:00.000Z'), notice('b', 'hotel-b', '2026-10-01T00:00:00.000Z')];
    expect(filterNotices(list, 'all')).toHaveLength(3);
    expect(filterNotices(list, 'group').map((item) => item.noticeId)).toEqual(['g']);
    expect(filterNotices(list, 'hotel-a').map((item) => item.noticeId)).toEqual(['g', 'a']);
  });
  it('serves group and hotel sample notices that reference known hotels', async () => {
    const repository = new MockHotelRepository();
    const service = new HotelContentServiceImpl(repository, 60_000, () => now);
    const [notices, hotels] = await Promise.all([service.getAllNotices(), repository.getHotels()]);
    const hotelIds = new Set(hotels.map((hotel) => hotel.hotelId));
    expect(notices.some((item) => item.hotelId === null)).toBe(true);
    expect(notices.filter((item) => item.hotelId !== null).every((item) => hotelIds.has(item.hotelId!))).toBe(true);
    expect(new Set(notices.map((item) => item.noticeId)).size).toBe(notices.length);
  });
});
