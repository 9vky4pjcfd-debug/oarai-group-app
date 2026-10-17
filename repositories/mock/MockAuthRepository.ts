import type { AuthRepository } from '@/repositories';
import { AppError, type AuthSession, type FederatedCredential } from '@/types';

export class MockAuthRepository implements AuthRepository {
  private session: AuthSession | null = null;
  private listeners = new Set<(session: AuthSession | null) => void>();

  async getSession() { return this.session; }
  observeSession(listener: (session: AuthSession | null) => void) { this.listeners.add(listener); listener(this.session); return () => this.listeners.delete(listener); }
  async signInWithEmail(email: string, password: string) {
    if (!email || !password) throw new AppError('VALIDATION_ERROR', 'Email and password are required.');
    this.session = { user: { uid: 'mock-user', email, emailVerified: true, role: 'member', roleSource: 'custom-claims' } };
    this.notify();
    return this.session;
  }
  async signInWithProvider(credential: FederatedCredential) {
    if (!credential.idToken) throw new AppError('VALIDATION_ERROR', 'Provider credential is required.');
    this.session = { user: { uid: `mock-${credential.provider}`, email: null, emailVerified: true, role: 'member', roleSource: 'custom-claims' } };
    this.notify();
    return this.session;
  }
  async signOut() { this.session = null; this.notify(); }
  async deleteAccount() { this.session = null; this.notify(); }
  private notify() { this.listeners.forEach((listener) => listener(this.session)); }
}
