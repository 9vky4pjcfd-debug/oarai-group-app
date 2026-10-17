import type { Facility, FaqItem, FloorGuide, HomeContent, HotelPublicProfile, Notice, Room } from '@/types';

export interface HotelRepository {
  getHotels(): Promise<HotelPublicProfile[]>;
  getHomeContent(hotelId: string): Promise<HomeContent | null>;
  getHotelContent(hotelId: string): Promise<HotelPublicProfile | null>;
  getNotices(hotelId: string): Promise<Notice[]>;
  getNotice(hotelId: string, noticeId: string): Promise<Notice | null>;
  getRooms(hotelId: string): Promise<Room[]>;
  getRoom(hotelId: string, roomId: string): Promise<Room | null>;
  getFacilities(hotelId: string): Promise<Facility[]>;
  getFacility(hotelId: string, facilityId: string): Promise<Facility | null>;
  getFloorGuides(hotelId: string): Promise<FloorGuide[]>;
  getFaq(hotelId: string): Promise<FaqItem[]>;
}
