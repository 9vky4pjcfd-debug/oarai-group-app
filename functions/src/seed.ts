import type { Timestamp } from 'firebase-admin/firestore';
import { buildScopedDocumentId } from '@/repositories/scoped-id';
import { mockGroupRooms, mockHotels } from '@/repositories/mock/mock-group-hotels';
import { mockFacilities, mockFaq, mockFloorGuides } from '@/repositories/mock/mock-hotel-content';
import { mockMembershipTiers } from '@/repositories/mock/mock-membership';
import { mockNotices } from '@/repositories/mock/mock-notices';
import { toStoredImages } from './seed-images';

export interface SeedDocument { collection: string; id: string; data: object; }

/** The content the app shows in demo mode, as Firestore documents, so the live app starts with the same pages. */
export function seedDocuments(now: Timestamp): SeedDocument[] {
  const audited = { createdAt: now, updatedAt: now };
  const scoped = <T extends { hotelId: string }>(collection: string, items: T[], key: (item: T) => string) =>
    items.map((item) => ({ collection, id: buildScopedDocumentId(item.hotelId, key(item)), data: { ...toStoredImages(item), published: true, ...audited } }));
  return [
    ...mockHotels.map((hotel) => ({ collection: 'publicHotelContent', id: hotel.hotelId, data: { hotelId: hotel.hotelId, published: true, content: toStoredImages(hotel), ...audited } })),
    ...scoped('rooms', mockGroupRooms, (room) => room.roomId),
    ...scoped('facilities', mockFacilities, (facility) => facility.facilityId),
    ...scoped('floorGuides', mockFloorGuides, (floor) => floor.floorId),
    ...scoped('faq', mockFaq, (item) => item.faqId),
    ...mockNotices.map((notice) => ({ collection: 'notices', id: notice.noticeId, data: { ...toStoredImages(notice), published: true, ...audited } })),
    ...mockMembershipTiers.map((tier) => ({ collection: 'membershipTiers', id: tier.tierId, data: { ...tier, published: true, ...audited } })),
  ];
}
