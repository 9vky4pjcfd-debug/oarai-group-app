import type { AuthSession, FederatedCredential } from '@/types';

export interface SignUpInput { email: string; password: string; displayName: string; }

export interface AuthRepository {
  getSession(): Promise<AuthSession | null>;
  observeSession(listener: (session: AuthSession | null) => void): () => void;
  signInWithEmail(email: string, password: string): Promise<AuthSession>;
  /** Creates the account and sends the address-verification email. */
  signUpWithEmail(input: SignUpInput): Promise<AuthSession>;
  signInWithProvider(credential: FederatedCredential): Promise<AuthSession>;
  sendPasswordReset(email: string): Promise<void>;
  sendEmailVerification(): Promise<void>;
  /** Reloads the user and its token, so a just-verified email or a new staff role shows up. */
  refreshSession(): Promise<AuthSession | null>;
  signOut(): Promise<void>;
  deleteAccount(): Promise<void>;
}
