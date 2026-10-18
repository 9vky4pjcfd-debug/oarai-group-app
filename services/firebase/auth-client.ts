import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth';
import { emulatorHost, getFirebaseClientApp } from './firebase-client';

let auth: Auth | null = null;
export function getFirebaseAuthClient(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseClientApp());
    if (emulatorHost) connectAuthEmulator(auth, `http://${emulatorHost}:9099`, { disableWarnings: true });
  }
  return auth;
}
