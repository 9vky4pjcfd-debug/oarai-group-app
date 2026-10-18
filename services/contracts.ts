import type {
  AdminNotice, AuthSession, BookingContacts, InventoryQuery, InventoryRow, InventoryUpdate, InventoryUpdateResult, ReservationQuery, SeedResult, StaffMember, StaffUpdate, AuthState, BathPublicStatusDocument, BookingPolicy, BookingRequest, DateOnly, CouponDocument, FederatedCredential,
  Facility, FaqItem, FloorGuide, HomeContent, HotelPublicProfile, MembershipTier, MemberProfileDocument, Notice, NotificationPreferences,
  PointAccountDocument, PointTransactionDocument,
  ReservationDocument, RestaurantPublicStatusDocument, Room, RoomOffer, StaySearch,
} from '@/types';

export interface AuthService {
  getState(): AuthState;
  subscribe(listener: (state: AuthState) => void): () => void;
  getSession(): Promise<AuthSession | null>;
  signInWithEmail(email: string, password: string): Promise<AuthSession>;
  /** Creates an email account and sends the verification email. */
  signUpWithEmail(email: string, password: string, displayName: string): Promise<AuthSession>;
  signInWithProvider(credential: FederatedCredential): Promise<AuthSession>;
  sendPasswordReset(email: string): Promise<void>;
  sendEmailVerification(): Promise<void>;
  /** Reloads the signed-in user, e.g. after they verified their email or were given a staff role. */
  refreshSession(): Promise<AuthSession | null>;
  signOut(): Promise<void>;
  /** Deletes membership, points and the sign-in account. Reservations stay with the hotel. */
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

/** Room booking across every group hotel. Reservations are listed per user, not per hotel. */
export interface ReservationService {
  getPolicy(): BookingPolicy;
  /** Today's date at the hotels (Asia/Tokyo). */
  today(): DateOnly;
  searchRooms(search: StaySearch): Promise<RoomOffer[]>;
  createReservation(userId: string, request: BookingRequest): Promise<ReservationDocument>;
  getOwnReservations(userId: string): Promise<ReservationDocument[]>;
  getOwnReservation(userId: string, reservationId: string): Promise<ReservationDocument | null>;
  cancelReservation(userId: string, reservationId: string): Promise<ReservationDocument>;
}
/** Membership and points are shared by every group hotel, so these are keyed by user only. */
export interface MemberService {
  getProfile(userId: string): Promise<MemberProfileDocument | null>;
  getTiers(): Promise<MembershipTier[]>;
  /** Creates the signed-in user's group membership and point account if they have none yet; returns the profile. */
  ensureProfile(input: { displayName: string; preferredLanguage: MemberProfileDocument['preferredLanguage'] }): Promise<MemberProfileDocument>;
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

/**
 * Hotel-side tools (Firebase mode only). Every call is checked on the server against the caller's
 * Custom Claims: staff and managers act on their own hotels, admins on every hotel.
 */
export interface AdminService {
  readonly available: boolean;
  getInventory(query: InventoryQuery): Promise<InventoryRow[]>;
  updateInventory(update: InventoryUpdate): Promise<InventoryUpdateResult>;
  getBookingContacts(hotelId: string): Promise<BookingContacts>;
  /** Managers and admins only. */
  setBookingContacts(contacts: BookingContacts): Promise<void>;
  /** Notices of the caller's hotels (and group-wide ones for admins), drafts included, newest first. */
  listNotices(): Promise<AdminNotice[]>;
  /** Group-wide notices (`hotelId: null`) need an admin. A new notice gets its ID from the server when `noticeId` is empty. */
  saveNotice(notice: AdminNotice): Promise<AdminNotice>;
  deleteNotice(noticeId: string): Promise<void>;
  listReservations(query: ReservationQuery): Promise<ReservationDocument[]>;
  /** Admins only. */
  listStaff(): Promise<StaffMember[]>;
  /** Admins only. The person must already have an account. */
  setStaff(update: StaffUpdate): Promise<void>;
  /** Makes the caller an admin when their verified email is one of the owner addresses set at deploy time. */
  claimOwner(): Promise<void>;
  /** Admins only. Writes the bundled hotel, room, facility, FAQ, notice and tier content; existing documents are kept unless `overwrite`. */
  seedContent(overwrite: boolean): Promise<SeedResult>;
}

export interface ServiceRegistry {
  auth: AuthService;
  hotelContent: HotelContentService;
  crowdStatus: CrowdStatusService;
  reservations: ReservationService;
  member: MemberService;
  points: PointService;
  notifications: NotificationService;
  admin: AdminService;
}
