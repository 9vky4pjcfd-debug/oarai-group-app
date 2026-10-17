import { environmentConfig, isFirebaseConfigured } from '@/config';
import type { CrowdStatusRepository, HotelRepository, MemberRepository, PointRepository, ReservationRepository } from '@/repositories';
import { FirebaseAuthRepository, FirebaseCrowdStatusRepository, FirebaseHotelRepository, FirebaseMemberRepository, FirebasePointRepository, FirebaseReservationRepository } from '@/repositories/firebase';
import { MockAuthRepository, MockCrowdStatusRepository, MockHotelRepository, MockMemberRepository, MockPointRepository, MockReservationRepository } from '@/repositories/mock';
import { mockGroupRooms } from '@/repositories/mock/mock-group-hotels';
import { createDeviceStore } from '@/repositories/mock/device-store';
import { AppError, type NotificationPreferences } from '@/types';
import { AuthServiceImpl } from './auth/AuthServiceImpl';
import { ReservationServiceImpl } from './booking/ReservationServiceImpl';
import type { ServiceRegistry } from './contracts';
import { CrowdStatusServiceImpl } from './crowd-status/CrowdStatusServiceImpl';
import { HotelContentServiceImpl } from './hotel/HotelContentServiceImpl';

const useFirebase = environmentConfig.backendMode === 'firebase';
if (useFirebase && !isFirebaseConfigured) throw new AppError('MAINTENANCE', 'Firebase client configuration is incomplete.');

const hotelRepository: HotelRepository = useFirebase ? new FirebaseHotelRepository() : new MockHotelRepository();
const crowdRepository: CrowdStatusRepository = useFirebase ? new FirebaseCrowdStatusRepository() : new MockCrowdStatusRepository();
const memberRepository: MemberRepository = useFirebase ? new FirebaseMemberRepository() : new MockMemberRepository();
const pointRepository: PointRepository = useFirebase ? new FirebasePointRepository() : new MockPointRepository();
const reservationRepository: ReservationRepository = useFirebase ? new FirebaseReservationRepository() : new MockReservationRepository(mockGroupRooms, createDeviceStore());
const authRepository = useFirebase ? new FirebaseAuthRepository() : new MockAuthRepository();
const notificationDefaults: NotificationPreferences = { hotelInformation: false, reservationUpdates: false, offers: false };

const hotelContent = new HotelContentServiceImpl(hotelRepository);

export const services: ServiceRegistry = {
  auth: new AuthServiceImpl(authRepository),
  hotelContent,
  crowdStatus: new CrowdStatusServiceImpl(crowdRepository),
  member: { getProfile: (userId) => memberRepository.getProfile(userId), getTiers: () => memberRepository.getTiers() },
  points: {
    getAccount: (userId) => pointRepository.getAccount(userId),
    getTransactions: (userId, limit) => pointRepository.getTransactions(userId, limit),
    getAvailableCoupons: (hotelId) => pointRepository.getAvailableCoupons(hotelId),
  },
  reservations: new ReservationServiceImpl(reservationRepository, hotelContent),
  notifications: { getPreferences: async () => notificationDefaults, updatePreferences: async () => undefined },
};
