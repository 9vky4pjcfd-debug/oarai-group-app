import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import type { MemberRepository } from '@/repositories';
import { getFirestoreClient } from '@/services/firebase';
import { mapToAppError } from '@/services/errors';
import type { MembershipTier, MembershipTierDocument, MemberProfileDocument } from '@/types';
import { mapFirestoreDates } from './firestore-mappers';

export class FirebaseMemberRepository implements MemberRepository {
  async getProfile(userId: string) {
    try { const snapshot = await getDoc(doc(getFirestoreClient(), 'memberProfiles', userId)); return snapshot.exists() ? mapFirestoreDates<MemberProfileDocument>(snapshot.data(), ['createdAt', 'updatedAt']) : null; }
    catch (error) { throw mapToAppError(error); }
  }
  async getTiers(): Promise<MembershipTier[]> {
    try {
      const snapshot = await getDocs(query(collection(getFirestoreClient(), 'membershipTiers'), where('published', '==', true)));
      return snapshot.docs.map((item) => mapFirestoreDates<MembershipTierDocument>(item.data(), ['createdAt', 'updatedAt'])).sort((a, b) => a.sortOrder - b.sortOrder);
    } catch (error) { throw mapToAppError(error); }
  }
}
