import { doc, getDoc } from 'firebase/firestore';
import { buildScopedDocumentId, type CrowdStatusRepository } from '@/repositories';
import { getFirestoreClient } from '@/services/firebase';
import { mapToAppError } from '@/services/errors';
import type { BathPublicStatusDocument, RestaurantPublicStatusDocument } from '@/types';
import { mapFirestoreDates } from './firestore-mappers';

async function readPublicStatus<T extends { hotelId: string; isPublic: boolean }>(collectionName: string, documentId: string, hotelId: string): Promise<T | null> {
  try { const snapshot = await getDoc(doc(getFirestoreClient(), collectionName, documentId)); if (!snapshot.exists()) return null; const data = mapFirestoreDates<T>(snapshot.data(), ['updatedAt']); return data.hotelId === hotelId && data.isPublic ? data : null; }
  catch (error) { throw mapToAppError(error); }
}

export class FirebaseCrowdStatusRepository implements CrowdStatusRepository {
  getRestaurantStatus(hotelId: string, restaurantId: string) { return readPublicStatus<RestaurantPublicStatusDocument>('restaurantPublicStatus', buildScopedDocumentId(hotelId, restaurantId), hotelId); }
  getBathStatus(hotelId: string, bathId: string) { return readPublicStatus<BathPublicStatusDocument>('bathPublicStatus', buildScopedDocumentId(hotelId, bathId), hotelId); }
}
