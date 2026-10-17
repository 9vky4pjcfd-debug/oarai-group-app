import type {
  AuthSession, AuthState, BathPublicStatusDocument, CouponDocument, FederatedCredential,
  Facility, FaqItem, FloorGuide, HomeContent, HotelPublicProfile, MembershipTier, MemberProfileDocument, Notice, NotificationPreferences,
  PointAccountDocument, PointTransactionDocument,
  ReservationDocument, RestaurantPublicStatusDocument, Room,
} from '@/types';

export interface AuthService {
  getState(): AuthState;
  subscribe(listener: (state: AuthState) => void): () => void;
  getSession(): Promise<AuthSession | null>;
  signInWithEmail(email: string, password: string): Promise<AuthSession>;
  signInWithProvider(credential: FederatedCredential): Promise<AuthSession>;
  signOut(): Promise<void>;
  deleteAccount(): Promise<void>;
}

export interface ContentReadOptions { forceRefresh?: boolean; }
export interface HotelContentService {
  getHotels(options?: ContentReadOptions): Promise<HotelPublicProfile[]>;
  getHomeContent(hotelId: string, options?: ContentReadOptions): Promise<HomeContent | null>;
  getHotelContent(hotelId: string, options?: ContentReadOptions): Promise<HotelPublicProfile | null>;
  getNotices(hotelId: string, options?: ContentReadOptions): Promise<Notice[]>;
  /** Group-wide and per-hotel notices that are currently visible, newest first. */
  getAllNotices(options?: ContentReadOptions): Promise<Notice[]>;
  getNotice(hotelId: string, noticeId: string, options?: ContentReadOptions): Promise<Notice | null>;
  getRooms(hotelId: string, options?: ContentReadOptions): Promise<Room[]>;
  getRoom(hotelId: string, roomId: string, options?: ContentReadOptions): Promise<Room | null>;
  getFacilities(hotelId: string, options?: ContentReadOptions): Promise<Facility[]>;
  getFacility(hotelId: string, facilityId: string, options?: ContentReadOptions): Promise<Facility | null>;
  getFloorGuides(hotelId: string, options?: ContentReadOptions): Promise<FloorGuide[]>;
  getFaq(hotelId: string, options?: ContentReadOptions): Promise<FaqItem[]>;
  clearCache(hotelId?: string): void;
}

export interface CrowdStatusService {
  getRestaurantStatus(hotelId: string, restaurantId: string): Promise<RestaurantPublicStatusDocument | null>;
  getBathStatus(hotelId: string, bathId: string): Promise<BathPublicStatusDocument | null>;
}

export interface ReservationService { getOwnReservations(userId: string, hotelId: string): Promise<ReservationDocument[]>; }
/** Membership and points are shared by every group hotel, so these are keyed by user only. */
export interface MemberService {
  getProfile(userId: string): Promise<MemberProfileDocument | null>;
  getTiers(): Promise<MembershipTier[]>;
}
export interface PointService {
  getAccount(userId: string): Promise<PointAccountDocument | null>;
  getTransactions(userId: string, limit: number): Promise<PointTransactionDocument[]>;
  getAvailableCoupons(hotelId: string): Promise<CouponDocument[]>;
}
export interface NotificationService {
  getPreferences(): Promise<NotificationPreferences>;
  updatePreferences(preferences: NotificationPreferences): Promise<void>;
}

export interface ServiceRegistry {
  auth: AuthService;
  hotelContent: HotelContentService;
  crowdStatus: CrowdStatusService;
  reservations: ReservationService;
  member: MemberService;
  points: PointService;
  notifications: NotificationService;
}
