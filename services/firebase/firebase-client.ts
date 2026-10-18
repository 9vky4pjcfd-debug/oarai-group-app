import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions, type Functions } from 'firebase/functions';
import { environmentConfig, firebaseOptions } from '@/config';
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

/** Local emulator host (e.g. `127.0.0.1`) for development and end-to-end tests; never used in production. */
export const emulatorHost = environmentConfig.isProduction ? undefined : process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST || undefined;

export function getFirestoreClient(): Firestore {
  if (!firestore) {
    firestore = getFirestore(getFirebaseClientApp());
    if (emulatorHost) connectFirestoreEmulator(firestore, emulatorHost, 8080);
  }
  return firestore;
}

export function getFunctionsClient(): Functions {
  if (!functions) {
    functions = getFunctions(getFirebaseClientApp(), FUNCTIONS_REGION);
    if (emulatorHost) connectFunctionsEmulator(functions, emulatorHost, 5001);
  }
  return functions;
}
