import type { AuthRepository, SignUpInput } from '@/repositories';
import { AppError, type AuthSession, type FederatedCredential } from '@/types';

export class MockAuthRepository implements AuthRepository {
  private session: AuthSession | null = null;
  private listeners = new Set<(session: AuthSession | null) => void>();

  async getSession() { return this.session; }
  observeSession(listener: (session: AuthSession | null) => void) { this.listeners.add(listener); listener(this.session); return () => this.listeners.delete(listener); }
  async signInWithEmail(email: string, password: string) {
    if (!email || !password) throw new AppError('VALIDATION_ERROR', 'Email and password are required.');
    return this.start({ uid: 'mock-user', email, emailVerified: true, role: 'member', roleSource: 'custom-claims', hotelIds: [] });
  }
  async signUpWithEmail({ email, password, displayName }: SignUpInput) {
    if (!email || !password) throw new AppError('VALIDATION_ERROR', 'Email and password are required.');
    return this.start({ uid: 'mock-user', email, emailVerified: false, role: 'guest', roleSource: 'custom-claims', hotelIds: [], displayName });
  }
  async signInWithProvider(credential: FederatedCredential) {
    if (!credential.idToken) throw new AppError('VALIDATION_ERROR', 'Provider credential is required.');
    return this.start({ uid: `mock-${credential.provider}`, email: null, emailVerified: true, role: 'member', roleSource: 'custom-claims', hotelIds: [] });
  }
  async sendPasswordReset() { return undefined; }
  async sendEmailVerification() { return undefined; }
  async refreshSession() { return this.session; }
  async signOut() { this.session = null; this.notify(); }
  async deleteAccount() { this.session = null; this.notify(); }
  private start(user: AuthSession['user']) { this.session = { user }; this.notify(); return this.session; }
  private notify() { this.listeners.forEach((listener) => listener(this.session)); }
}
