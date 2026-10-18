import AsyncStorage from '@react-native-async-storage/async-storage';
import { connectAuthEmulator, getAuth, getReactNativePersistence, initializeAuth, type Auth } from 'firebase/auth';
import { emulatorHost, getFirebaseClientApp } from './firebase-client';

let auth: Auth | null = null;
export function getFirebaseAuthClient(): Auth {
  if (auth) return auth;
  const app = getFirebaseClientApp();
  try { auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) }); }
  catch { auth = getAuth(app); }
  if (emulatorHost) connectAuthEmulator(auth, `http://${emulatorHost}:9099`, { disableWarnings: true });
  return auth;
}
