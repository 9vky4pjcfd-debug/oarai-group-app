import type { HotelRepository } from '@/repositories';
import type { Facility, FaqItem, FloorGuide, HomeContent, HotelPublicProfile, Notice, Room } from '@/types';
import { mockGroupRooms, mockHotels } from './mock-group-hotels';
import { mockFacilities, mockFaq, mockFloorGuides } from './mock-hotel-content';
import { mockNotices } from './mock-notices';

function byHotel<T extends { hotelId: string | null; sortOrder: number }>(items: T[], hotelId: string): T[] {
  return items.filter((item) => item.hotelId === hotelId).sort((a, b) => a.sortOrder - b.sortOrder);
}

export class MockHotelRepository implements HotelRepository {
  constructor(
    private readonly hotels: HotelPublicProfile[] = mockHotels,
    private readonly rooms: Room[] = mockGroupRooms,
  ) {}

  async getHotels(): Promise<HotelPublicProfile[]> { return [...this.hotels].sort((a, b) => a.sortOrder - b.sortOrder); }
  async getHotelContent(hotelId: string): Promise<HotelPublicProfile | null> { return this.hotels.find((hotel) => hotel.hotelId === hotelId) ?? null; }

  async getHomeContent(hotelId: string): Promise<HomeContent | null> {
    const hotel = await this.getHotelContent(hotelId);
    if (!hotel) return null;
    return {
      hotel,
      notices: byHotel(mockNotices, hotelId).slice(0, 3),
      featuredRooms: byHotel(this.rooms, hotelId).slice(0, 3),
      featuredFacilities: byHotel(mockFacilities, hotelId).filter((item) => ['hinode', 'bath', 'sunahama-lounge'].includes(item.facilityId)),
    };
  }

  async getNotices(hotelId: string): Promise<Notice[]> { return byHotel(mockNotices, hotelId); }
  async getAllNotices(): Promise<Notice[]> { return [...mockNotices]; }
  async getNotice(hotelId: string, noticeId: string): Promise<Notice | null> { return (await this.getNotices(hotelId)).find((item) => item.noticeId === noticeId) ?? null; }
  async getRooms(hotelId: string): Promise<Room[]> { return byHotel(this.rooms, hotelId); }
  async getRoom(hotelId: string, roomId: string): Promise<Room | null> { return (await this.getRooms(hotelId)).find((item) => item.roomId === roomId) ?? null; }
  async getFacilities(hotelId: string): Promise<Facility[]> { return byHotel(mockFacilities, hotelId); }
  async getFacility(hotelId: string, facilityId: string): Promise<Facility | null> { return (await this.getFacilities(hotelId)).find((item) => item.facilityId === facilityId) ?? null; }
  async getFloorGuides(hotelId: string): Promise<FloorGuide[]> { return byHotel(mockFloorGuides, hotelId); }
  async getFaq(hotelId: string): Promise<FaqItem[]> { return byHotel(mockFaq, hotelId); }
}
