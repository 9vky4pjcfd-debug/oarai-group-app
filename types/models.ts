export type EntityId = string;

export type CrowdLevel = 'quiet' | 'moderate' | 'busy' | 'unavailable';

export interface CrowdStatus {
  facilityId: EntityId;
  level: CrowdLevel;
  waitingParties?: number;
  updatedAt: string;
  isDemo: boolean;
}

export interface ReservationSearch {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
}

export interface MemberProfile {
  id: EntityId;
  userId: EntityId;
  hotelId: EntityId;
  displayName: string;
  membershipNumber: string;
  preferredLanguage: 'ja' | 'zh-TW' | 'en';
}

export interface PointTransaction {
  id: EntityId;
  occurredAt: string;
  description: string;
  points: number;
}

export interface Coupon {
  id: EntityId;
  title: string;
  expiresAt: string;
}

export interface NotificationPreferences {
  hotelInformation: boolean;
  reservationUpdates: boolean;
  offers: boolean;
}
