import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import type { MemberRepository } from '@/repositories';
import { getFirestoreClient } from '@/services/firebase';
import { mapToAppError } from '@/services/errors';
import type { MemberProfileDocument } from '@/types';
import { mapFirestoreDates } from './firestore-mappers';

export class FirebaseMemberRepository implements MemberRepository {
  async getProfile(userId: string, hotelId: string) {
    try { const snapshot = await getDocs(query(collection(getFirestoreClient(), 'memberProfiles'), where('userId', '==', userId), where('hotelId', '==', hotelId), limit(1))); return snapshot.empty ? null : mapFirestoreDates<MemberProfileDocument>(snapshot.docs[0]!.data(), ['createdAt', 'updatedAt']); }
    catch (error) { throw mapToAppError(error); }
  }
}
