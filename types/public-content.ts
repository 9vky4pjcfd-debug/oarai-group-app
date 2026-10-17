export type ContentLanguage = 'ja' | 'zh-TW' | 'en';
export type LocalizedText = Partial<Record<ContentLanguage, string>>;

export type ContentImage =
  | { kind: 'local'; source: number; accessibilityLabel: LocalizedText }
  | { kind: 'remote'; uri: string; accessibilityLabel: LocalizedText };

export interface HotelLink {
  id: string;
  label: LocalizedText;
  url: string;
}

export type NoticeCategory = 'news' | 'campaign' | 'facility' | 'important';

/** An announcement. `hotelId` null means it applies to the whole group. */
export interface Notice {
  noticeId: string;
  hotelId: string | null;
  category: NoticeCategory;
  title: LocalizedText;
  body: LocalizedText;
  priority: 'normal' | 'important';
  publishedAt: string;
  /** Hidden from the app after this time when set. */
  expiresAt?: string;
  linkUrl?: string;
  sortOrder: number;
}

/** One property (館) of the group. New properties are added as data, not code. */
export interface HotelPublicProfile {
  hotelId: string;
  name: LocalizedText;
  area: LocalizedText;
  shortDescription: LocalizedText;
  description: LocalizedText;
  highlights: LocalizedText[];
  address?: LocalizedText;
  phone?: string;
  checkInTime?: string;
  checkOutTime?: string;
  heroImage?: ContentImage;
  logo?: ContentImage;
  websiteUrl?: string;
  links: HotelLink[];
  sortOrder: number;
}

export interface Room {
  roomId: string;
  hotelId: string;
  name: LocalizedText;
  shortDescription: LocalizedText;
  description: LocalizedText;
  capacityMin: number | null;
  capacityMax: number;
  bedType?: LocalizedText;
  roomSize: LocalizedText;
  images: ContentImage[];
  amenities: LocalizedText[];
  features: LocalizedText[];
  category: LocalizedText;
  sortOrder: number;
}

export interface Facility {
  facilityId: string;
  hotelId: string;
  name: LocalizedText;
  shortDescription: LocalizedText;
  description: LocalizedText;
  category: LocalizedText;
  location?: LocalizedText;
  businessHours?: LocalizedText;
  images: ContentImage[];
  features: LocalizedText[];
  sortOrder: number;
}

export interface FloorGuide {
  floorId: string;
  hotelId: string;
  label: LocalizedText;
  description: LocalizedText;
  mapImage: ContentImage;
  facilityIds: string[];
  sortOrder: number;
}

export interface FaqItem {
  faqId: string;
  hotelId: string;
  question: LocalizedText;
  answer: LocalizedText;
  category: LocalizedText;
  sortOrder: number;
}

export interface HomeContent {
  hotel: HotelPublicProfile;
  notices: Notice[];
  featuredRooms: Room[];
  featuredFacilities: Facility[];
}
