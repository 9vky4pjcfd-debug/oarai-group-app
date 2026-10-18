import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import type { MemberRepository } from '@/repositories';
import { getFirestoreClient, getFunctionsClient } from '@/services/firebase';
import { mapCallableError, mapToAppError } from '@/services/errors';
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
  async ensureProfile(input: { displayName: string; preferredLanguage: MemberProfileDocument['preferredLanguage'] }) {
    try { return mapFirestoreDates<MemberProfileDocument>((await httpsCallable<typeof input, Record<string, unknown>>(getFunctionsClient(), 'memberEnsureProfile')(input)).data, ['createdAt', 'updatedAt']); }
    catch (error) { throw mapCallableError(error); }
  }
}
