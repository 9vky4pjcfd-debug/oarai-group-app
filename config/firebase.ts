import type { FirebaseOptions } from 'firebase/app';
import { runtimeEnvironmentSource, type EnvironmentSource } from './env';

const requiredFirebaseKeys = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
] as const;

export function resolveFirebaseOptions(source: EnvironmentSource): FirebaseOptions | null {
  if (requiredFirebaseKeys.some((key) => !source[key]?.trim())) return null;

  const options: FirebaseOptions = {
    apiKey: source.EXPO_PUBLIC_FIREBASE_API_KEY!,
    authDomain: source.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: source.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: source.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: source.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: source.EXPO_PUBLIC_FIREBASE_APP_ID!,
  };
  if (source.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID) options.measurementId = source.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID;
  return options;
}

export const firebaseOptions = resolveFirebaseOptions(runtimeEnvironmentSource);
export const isFirebaseConfigured = firebaseOptions !== null;
