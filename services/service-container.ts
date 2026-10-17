import { environmentConfig, isFirebaseConfigured } from '@/config';
import type { CrowdStatusRepository, HotelRepository, MemberRepository, PointRepository, ReservationRepository } from '@/repositories';
import { FirebaseAuthRepository, FirebaseCrowdStatusRepository, FirebaseHotelRepository, FirebaseMemberRepository, FirebasePointRepository, FirebaseReservationRepository } from '@/repositories/firebase';
import { MockAuthRepository, MockCrowdStatusRepository, MockHotelRepository, MockMemberRepository, MockPointRepository, MockReservationRepository } from '@/repositories/mock';
import { AppError, type NotificationPreferences } from '@/types';
import { AuthServiceImpl } from './auth/AuthServiceImpl';
import type { ServiceRegistry } from './contracts';
import { CrowdStatusServiceImpl } from './crowd-status/CrowdStatusServiceImpl';
import { HotelContentServiceImpl } from './hotel/HotelContentServiceImpl';

const useFirebase = environmentConfig.backendMode === 'firebase';
if (useFirebase && !isFirebaseConfigured) throw new AppError('MAINTENANCE', 'Firebase client configuration is incomplete.');

const hotelRepository: HotelRepository = useFirebase ? new FirebaseHotelRepository() : new MockHotelRepository();
const crowdRepository: CrowdStatusRepository = useFirebase ? new FirebaseCrowdStatusRepository() : new MockCrowdStatusRepository();
const memberRepository: MemberRepository = useFirebase ? new FirebaseMemberRepository() : new MockMemberRepository();
const pointRepository: PointRepository = useFirebase ? new FirebasePointRepository() : new MockPointRepository();
const reservationRepository: ReservationRepository = useFirebase ? new FirebaseReservationRepository() : new MockReservationRepository();
const authRepository = useFirebase ? new FirebaseAuthRepository() : new MockAuthRepository();
const notificationDefaults: NotificationPreferences = { hotelInformation: false, reservationUpdates: false, offers: false };

export const services: ServiceRegistry = {
  auth: new AuthServiceImpl(authRepository),
  hotelContent: new HotelContentServiceImpl(hotelRepository),
  crowdStatus: new CrowdStatusServiceImpl(crowdRepository),
  member: { getProfile: (userId, hotelId) => memberRepository.getProfile(userId, hotelId) },
  points: {
    getAccount: (userId, hotelId) => pointRepository.getAccount(userId, hotelId),
    getTransactions: (userId, hotelId, limit) => pointRepository.getTransactions(userId, hotelId, limit),
    getAvailableCoupons: (hotelId) => pointRepository.getAvailableCoupons(hotelId),
  },
  reservations: { getOwnReservations: (userId, hotelId) => reservationRepository.getOwnReservations(userId, hotelId) },
  notifications: { getPreferences: async () => notificationDefaults, updatePreferences: async () => undefined },
};
