import type { HotelRepository } from '@/repositories';
import { visibleNotices } from './notice-utils';
import type { ContentReadOptions, HotelContentService } from '@/services/contracts';

interface CacheEntry { expiresAt: number; value: unknown; }
const defaultTtlMs = 5 * 60 * 1000;

export class HotelContentServiceImpl implements HotelContentService {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly inFlight = new Map<string, Promise<unknown>>();

  constructor(
    private readonly repository: HotelRepository,
    private readonly ttlMs = defaultTtlMs,
    private readonly now: () => number = Date.now,
  ) {}

  private async read<T>(key: string, loader: () => Promise<T>, options?: ContentReadOptions): Promise<T> {
    if (!options?.forceRefresh) {
      const cached = this.cache.get(key);
      if (cached && cached.expiresAt > this.now()) return cached.value as T;
      const pending = this.inFlight.get(key);
      if (pending) return pending as Promise<T>;
    }
    const promise = loader()
      .then((value) => {
        this.cache.set(key, { value, expiresAt: this.now() + this.ttlMs });
        return value;
      })
      .finally(() => this.inFlight.delete(key));
    this.inFlight.set(key, promise);
    return promise;
  }

  clearCache(hotelId?: string) {
    if (!hotelId) {
      this.cache.clear();
      this.inFlight.clear();
      return;
    }
    const prefix = `${hotelId}:`;
    for (const key of this.cache.keys()) if (key.startsWith(prefix)) this.cache.delete(key);
    for (const key of this.inFlight.keys()) if (key.startsWith(prefix)) this.inFlight.delete(key);
  }

  getHotels(options?: ContentReadOptions) { return this.read('group:hotels', () => this.repository.getHotels(), options); }
  getHomeContent(hotelId: string, options?: ContentReadOptions) { return this.read(`${hotelId}:home`, () => this.repository.getHomeContent(hotelId), options); }
  getHotelContent(hotelId: string, options?: ContentReadOptions) { return this.read(`${hotelId}:hotel`, () => this.repository.getHotelContent(hotelId), options); }
  getNotices(hotelId: string, options?: ContentReadOptions) { return this.read(`${hotelId}:notices`, () => this.repository.getNotices(hotelId), options); }
  getAllNotices(options?: ContentReadOptions) { return this.read('group:notices', async () => visibleNotices(await this.repository.getAllNotices(), this.now()), options); }
  getNotice(hotelId: string, noticeId: string, options?: ContentReadOptions) { return this.read(`${hotelId}:notice:${noticeId}`, () => this.repository.getNotice(hotelId, noticeId), options); }
  getRooms(hotelId: string, options?: ContentReadOptions) { return this.read(`${hotelId}:rooms`, () => this.repository.getRooms(hotelId), options); }
  getRoom(hotelId: string, roomId: string, options?: ContentReadOptions) { return this.read(`${hotelId}:room:${roomId}`, () => this.repository.getRoom(hotelId, roomId), options); }
  getFacilities(hotelId: string, options?: ContentReadOptions) { return this.read(`${hotelId}:facilities`, () => this.repository.getFacilities(hotelId), options); }
  getFacility(hotelId: string, facilityId: string, options?: ContentReadOptions) { return this.read(`${hotelId}:facility:${facilityId}`, () => this.repository.getFacility(hotelId, facilityId), options); }
  getFloorGuides(hotelId: string, options?: ContentReadOptions) { return this.read(`${hotelId}:floor-guides`, () => this.repository.getFloorGuides(hotelId), options); }
  getFaq(hotelId: string, options?: ContentReadOptions) { return this.read(`${hotelId}:faq`, () => this.repository.getFaq(hotelId), options); }
}
