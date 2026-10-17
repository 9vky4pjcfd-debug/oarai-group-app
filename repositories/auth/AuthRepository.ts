import type { AuthSession, FederatedCredential } from '@/types';

export interface AuthRepository {
  getSession(): Promise<AuthSession | null>;
  observeSession(listener: (session: AuthSession | null) => void): () => void;
  signInWithEmail(email: string, password: string): Promise<AuthSession>;
  signInWithProvider(credential: FederatedCredential): Promise<AuthSession>;
  signOut(): Promise<void>;
  deleteAccount(): Promise<void>;
}
