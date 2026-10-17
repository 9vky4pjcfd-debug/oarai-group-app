import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseOptions } from '@/config';
import { AppError } from '@/types';

let app: FirebaseApp | null = null;
let firestore: Firestore | null = null;

export function getFirebaseClientApp(): FirebaseApp {
  if (!firebaseOptions) throw new AppError('MAINTENANCE', 'Firebase is not configured for this environment.');
  app ??= getApps().length > 0 ? getApp() : initializeApp(firebaseOptions);
  return app;
}

export function getFirestoreClient(): Firestore {
  firestore ??= getFirestore(getFirebaseClientApp());
  return firestore;
}
