import { GoogleAuthProvider, OAuthProvider, onAuthStateChanged, signInWithCredential, signInWithEmailAndPassword, signOut, type User as FirebaseUser } from 'firebase/auth';
import type { AuthRepository } from '@/repositories';
import { getFirebaseAuthClient } from '@/services/firebase';
import { mapToAppError } from '@/services/errors';
import { AppError, type AuthSession, type FederatedCredential, type MemberRole } from '@/types';

async function toSession(user: FirebaseUser): Promise<AuthSession> {
  const token = await user.getIdTokenResult();
  const claimedRole = token.claims.role;
  const role: MemberRole = claimedRole === 'member' || claimedRole === 'staff' || claimedRole === 'manager' || claimedRole === 'admin' ? claimedRole : 'guest';
  return { user: { uid: user.uid, email: user.email, emailVerified: user.emailVerified, role, roleSource: 'custom-claims' }, issuedAt: token.issuedAtTime };
}

export class FirebaseAuthRepository implements AuthRepository {
  async getSession() { const user = getFirebaseAuthClient().currentUser; return user ? toSession(user) : null; }
  observeSession(listener: (session: AuthSession | null) => void) {
    return onAuthStateChanged(getFirebaseAuthClient(), (user) => { if (!user) listener(null); else void toSession(user).then(listener).catch(() => listener(null)); });
  }
  async signInWithEmail(email: string, password: string) {
    try { return await toSession((await signInWithEmailAndPassword(getFirebaseAuthClient(), email, password)).user); }
    catch (error) { throw mapToAppError(error); }
  }
  async signInWithProvider(credential: FederatedCredential) {
    try {
      const firebaseCredential = credential.provider === 'google'
        ? GoogleAuthProvider.credential(credential.idToken)
        : new OAuthProvider('apple.com').credential(credential.nonce ? { idToken: credential.idToken, rawNonce: credential.nonce } : { idToken: credential.idToken });
      return await toSession((await signInWithCredential(getFirebaseAuthClient(), firebaseCredential)).user);
    } catch (error) { throw mapToAppError(error); }
  }
  async signOut() { try { await signOut(getFirebaseAuthClient()); } catch (error) { throw mapToAppError(error); } }
  async deleteAccount(): Promise<void> { throw new AppError('SERVER_ERROR', 'Account deletion requires the server deletion workflow.'); }
}
