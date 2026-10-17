import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import type { HotelRepository } from '@/repositories';
import { getFirestoreClient } from '@/services/firebase';
import { mapToAppError } from '@/services/errors';
import type { Facility, FaqItem, FloorGuide, HomeContent, HotelPublicProfile, Notice, Room } from '@/types';
import { mapFirestoreDates } from './firestore-mappers';

async function publishedByHotel<T>(path: string, hotelId: string): Promise<T[]> {
  try {
    const snapshot = await getDocs(query(collection(getFirestoreClient(), path), where('hotelId', '==', hotelId), where('published', '==', true)));
    return snapshot.docs.map((item) => mapFirestoreDates<T>(item.data(), ['createdAt', 'updatedAt']));
  } catch (error) { throw mapToAppError(error); }
}

export class FirebaseHotelRepository implements HotelRepository {
  async getHotels() {
    try {
      const snapshot = await getDocs(query(collection(getFirestoreClient(), 'publicHotelContent'), where('published', '==', true)));
      return snapshot.docs.map((item) => item.data().content as HotelPublicProfile).sort((a, b) => a.sortOrder - b.sortOrder);
    } catch (error) { throw mapToAppError(error); }
  }
  async getHomeContent(hotelId: string) {
    try {
      const snapshot = await getDoc(doc(getFirestoreClient(), 'homeContent', hotelId));
      return snapshot.exists() && snapshot.data().published === true ? snapshot.data().content as HomeContent : null;
    } catch (error) { throw mapToAppError(error); }
  }
  async getHotelContent(hotelId: string) {
    try { const snapshot = await getDoc(doc(getFirestoreClient(), 'publicHotelContent', hotelId)); return snapshot.exists() && snapshot.data().published === true ? snapshot.data().content as HotelPublicProfile : null; }
    catch (error) { throw mapToAppError(error); }
  }
  getNotices(hotelId: string) { return publishedByHotel<Notice>('notices', hotelId); }
  async getNotice(hotelId: string, noticeId: string) { return (await this.getNotices(hotelId)).find((item) => item.noticeId === noticeId) ?? null; }
  getRooms(hotelId: string) { return publishedByHotel<Room>('rooms', hotelId); }
  async getRoom(hotelId: string, roomId: string) { return (await this.getRooms(hotelId)).find((item) => item.roomId === roomId) ?? null; }
  getFacilities(hotelId: string) { return publishedByHotel<Facility>('facilities', hotelId); }
  async getFacility(hotelId: string, facilityId: string) { return (await this.getFacilities(hotelId)).find((item) => item.facilityId === facilityId) ?? null; }
  getFloorGuides(hotelId: string) { return publishedByHotel<FloorGuide>('floorGuides', hotelId); }
  getFaq(hotelId: string) { return publishedByHotel<FaqItem>('faq', hotelId); }
}
