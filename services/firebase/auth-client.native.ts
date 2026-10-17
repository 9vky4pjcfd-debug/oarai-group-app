import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from 'firebase/auth';
import { getFirebaseClientApp } from './firebase-client';

let auth: Auth | null = null;
export function getFirebaseAuthClient(): Auth {
  if (auth) return auth;
  const app = getFirebaseClientApp();
  try { auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) }); }
  catch { auth = getAuth(app); }
  return auth;
}
