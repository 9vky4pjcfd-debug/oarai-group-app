import { getAuth, type Auth } from 'firebase/auth';
import { getFirebaseClientApp } from './firebase-client';

let auth: Auth | null = null;
export function getFirebaseAuthClient(): Auth {
  auth ??= getAuth(getFirebaseClientApp());
  return auth;
}
