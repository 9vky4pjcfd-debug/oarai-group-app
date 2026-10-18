import {
  createUserWithEmailAndPassword, GoogleAuthProvider, OAuthProvider, onIdTokenChanged, sendEmailVerification, sendPasswordResetEmail,
  signInWithCredential, signInWithEmailAndPassword, signOut, updateProfile, type User as FirebaseUser,
} from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import type { AuthRepository, SignUpInput } from '@/repositories';
import { getFirebaseAuthClient, getFunctionsClient } from '@/services/firebase';
import { mapCallableError, mapToAppError } from '@/services/errors';
import type { AuthSession, FederatedCredential, MemberRole } from '@/types';

const roles: readonly MemberRole[] = ['member', 'staff', 'manager', 'admin'];

async function toSession(user: FirebaseUser, forceRefresh = false): Promise<AuthSession> {
  const token = await user.getIdTokenResult(forceRefresh);
  // A token issued before the address was verified still says unverified, and the server would refuse bookings with it.
  if (user.emailVerified && token.claims.email_verified !== true && !forceRefresh) return toSession(user, true);
  const claimedRole = token.claims.role;
  const role: MemberRole = roles.includes(claimedRole as MemberRole) ? claimedRole as MemberRole : 'guest';
  const hotelIds = Array.isArray(token.claims.hotels) ? token.claims.hotels.filter((item): item is string => typeof item === 'string') : [];
  return {
    user: { uid: user.uid, email: user.email, emailVerified: user.emailVerified, role, roleSource: 'custom-claims', hotelIds, displayName: user.displayName },
    issuedAt: token.issuedAtTime,
  };
}

export class FirebaseAuthRepository implements AuthRepository {
  async getSession() { const user = getFirebaseAuthClient().currentUser; return user ? toSession(user) : null; }
  // ID token changes cover sign-in, sign-out and the forced refresh after verification or a role change.
  observeSession(listener: (session: AuthSession | null) => void) {
    return onIdTokenChanged(getFirebaseAuthClient(), (user) => { if (!user) listener(null); else void toSession(user).then(listener).catch(() => listener(null)); });
  }
  async signInWithEmail(email: string, password: string) {
    try { return await toSession((await signInWithEmailAndPassword(getFirebaseAuthClient(), email, password)).user); }
    catch (error) { throw mapToAppError(error); }
  }
  async signUpWithEmail({ email, password, displayName }: SignUpInput) {
    try {
      const { user } = await createUserWithEmailAndPassword(getFirebaseAuthClient(), email, password);
      await updateProfile(user, { displayName });
      await sendEmailVerification(user);
      return await toSession(user);
    } catch (error) { throw mapToAppError(error); }
  }
  async signInWithProvider(credential: FederatedCredential) {
    try {
      const firebaseCredential = credential.provider === 'google'
        ? GoogleAuthProvider.credential(credential.idToken)
        : new OAuthProvider('apple.com').credential(credential.nonce ? { idToken: credential.idToken, rawNonce: credential.nonce } : { idToken: credential.idToken });
      return await toSession((await signInWithCredential(getFirebaseAuthClient(), firebaseCredential)).user);
    } catch (error) { throw mapToAppError(error); }
  }
  async sendPasswordReset(email: string) {
    try { await sendPasswordResetEmail(getFirebaseAuthClient(), email); } catch (error) { throw mapToAppError(error); }
  }
  async sendEmailVerification() {
    const user = getFirebaseAuthClient().currentUser;
    if (!user || user.emailVerified) return;
    try { await sendEmailVerification(user); } catch (error) { throw mapToAppError(error); }
  }
  async refreshSession() {
    const user = getFirebaseAuthClient().currentUser;
    if (!user) return null;
    try { await user.reload(); return await toSession(user, true); } catch (error) { throw mapToAppError(error); }
  }
  async signOut() { try { await signOut(getFirebaseAuthClient()); } catch (error) { throw mapToAppError(error); } }
  // The server removes membership, points and the sign-in account together; reservations stay with the hotel.
  async deleteAccount() {
    try { await httpsCallable(getFunctionsClient(), 'memberDeleteAccount')({}); await signOut(getFirebaseAuthClient()); }
    catch (error) { throw mapCallableError(error); }
  }
}
