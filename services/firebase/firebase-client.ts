import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getFunctions, type Functions } from 'firebase/functions';
import { firebaseOptions } from '@/config';
import { AppError } from '@/types';

let app: FirebaseApp | null = null;
let firestore: Firestore | null = null;
let functions: Functions | null = null;

/** Cloud Functions region; Tokyo keeps booking calls close to the hotels and guests. */
export const FUNCTIONS_REGION = 'asia-northeast1';

export function getFirebaseClientApp(): FirebaseApp {
  if (!firebaseOptions) throw new AppError('MAINTENANCE', 'Firebase is not configured for this environment.');
  app ??= getApps().length > 0 ? getApp() : initializeApp(firebaseOptions);
  return app;
}

export function getFirestoreClient(): Firestore {
  firestore ??= getFirestore(getFirebaseClientApp());
  return firestore;
}

export function getFunctionsClient(): Functions {
  functions ??= getFunctions(getFirebaseClientApp(), FUNCTIONS_REGION);
  return functions;
}
