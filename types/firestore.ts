import type { MemberRole } from './auth';
import type { MembershipTier } from './membership';
import type { LocalizedText } from './public-content';

export type ISODateString = string;
export interface HotelScopedDocument { hotelId: string; }
export interface AuditedDocument { createdAt: ISODateString; updatedAt: ISODateString; }

export interface PublicHotelContentDocument extends HotelScopedDocument, AuditedDocument { hotelName: LocalizedText; summary: LocalizedText; published: boolean; }
export interface RoomDocument extends HotelScopedDocument, AuditedDocument { roomId: string; name: LocalizedText; description: LocalizedText; capacity: number; sizeSquareMeters: number; imageUrl?: string | undefined; published: boolean; }
export interface FacilityDocument extends HotelScopedDocument, AuditedDocument { facilityId: string; name: LocalizedText; description: LocalizedText; location: LocalizedText; hours: LocalizedText; imageUrl?: string | undefined; published: boolean; }
export interface FaqDocument extends HotelScopedDocument, AuditedDocument { faqId: string; question: LocalizedText; answer: LocalizedText; sortOrder: number; published: boolean; }
export interface UserDocument extends AuditedDocument { userId: string; email: string | null; role: MemberRole; roleSource: 'custom-claims'; }
/** One profile per user for the whole group (document ID = userId). `homeHotelId` is where they joined, for reporting only. */
export interface MemberProfileDocument extends AuditedDocument { userId: string; membershipNumber: string; displayName: string; preferredLanguage: 'ja' | 'zh-TW' | 'en'; homeHotelId: string | null; }

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export interface ReservationDocument extends HotelScopedDocument, AuditedDocument { reservationId: string; userId: string; externalReservationId: string | null; status: ReservationStatus; checkIn: ISODateString; checkOut: ISODateString; guestCount: number; }

export type RestaurantOperationalStatus = 'open' | 'busy' | 'paused' | 'closed';
export interface RestaurantPublicStatusDocument extends HotelScopedDocument { restaurantId: string; restaurantName: string; status: RestaurantOperationalStatus; waitingGroups: number; estimatedWaitMinutes: number | null; updatedAt: ISODateString; isPublic: boolean; }
export interface RestaurantQueueDocument extends HotelScopedDocument, AuditedDocument { queueEntryId: string; userId: string | null; status: 'waiting' | 'called' | 'seated' | 'cancelled'; partySize: number; }
export interface BathPublicStatusDocument extends HotelScopedDocument { bathId: string; status: 'quiet' | 'moderate' | 'busy' | 'closed'; updatedAt: ISODateString; isPublic: boolean; }

/** Group-wide point balance and tier (document ID = userId). Written only by the server. */
export interface PointAccountDocument extends AuditedDocument {
  userId: string;
  balance: number;
  /** Base points (before tier bonus) earned in the rolling 12 months; decides the tier. */
  qualifyingPoints: number;
  tierId: string;
  tierEvaluatedAt: ISODateString;
  nextExpiry: { amount: number; expiresAt: ISODateString } | null;
  version: number;
}
export type PointTransactionType = 'earn' | 'redeem' | 'expire' | 'adjustment' | 'reversal';
/** Immutable ledger entry. `hotelId` is the property where points were earned or used; null for group-wide adjustments. */
export interface PointTransactionDocument { transactionId: string; userId: string; hotelId: string | null; type: PointTransactionType; amount: number; balanceBefore: number; balanceAfter: number; source: string; referenceId: string; description: LocalizedText; createdAt: ISODateString; }

export interface MembershipTierDocument extends MembershipTier, AuditedDocument { published: boolean; }

export interface CouponDocument extends HotelScopedDocument, AuditedDocument { couponId: string; title: LocalizedText; validFrom: ISODateString; validUntil: ISODateString; active: boolean; }
export interface CouponRedemptionDocument extends HotelScopedDocument { redemptionId: string; couponId: string; userId: string; redeemedAt: ISODateString; }
export interface DeviceTokenDocument extends HotelScopedDocument, AuditedDocument { userId: string; platform: 'ios' | 'android'; tokenHash: string; active: boolean; }
export interface AppConfigDocument extends AuditedDocument { minimumSupportedVersion: string; maintenanceMode: boolean; }
export interface AuditLogDocument extends HotelScopedDocument { auditId: string; actorId: string; action: string; targetType: string; targetId: string; createdAt: ISODateString; }

export interface FirestoreSchemaV1 {
  publicHotelContent: PublicHotelContentDocument;
  rooms: RoomDocument;
  facilities: FacilityDocument;
  faq: FaqDocument;
  users: UserDocument;
  memberProfiles: MemberProfileDocument;
  reservations: ReservationDocument;
  restaurantPublicStatus: RestaurantPublicStatusDocument;
  restaurantQueue: RestaurantQueueDocument;
  bathPublicStatus: BathPublicStatusDocument;
  pointAccounts: PointAccountDocument;
  pointTransactions: PointTransactionDocument;
  membershipTiers: MembershipTierDocument;
  coupons: CouponDocument;
  couponRedemptions: CouponRedemptionDocument;
  deviceTokens: DeviceTokenDocument;
  appConfig: AppConfigDocument;
  auditLogs: AuditLogDocument;
}
