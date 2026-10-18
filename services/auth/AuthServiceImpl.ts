import type { AuthRepository } from '@/repositories';
import type { AuthService } from '@/services/contracts';
import { mapToAppError } from '@/services/errors';
import type { AuthSession, AuthState, FederatedCredential } from '@/types';

export class AuthServiceImpl implements AuthService {
  private state: AuthState = { status: 'loading', session: null };
  private listeners = new Set<(state: AuthState) => void>();

  constructor(private readonly repository: AuthRepository) {
    repository.observeSession((session) => this.setSession(session));
  }
  getState() { return this.state; }
  subscribe(listener: (state: AuthState) => void) { this.listeners.add(listener); listener(this.state); return () => this.listeners.delete(listener); }
  async getSession() { try { return await this.repository.getSession(); } catch (error) { throw mapToAppError(error); } }
  async signInWithEmail(email: string, password: string): Promise<AuthSession> { try { return await this.repository.signInWithEmail(email.trim(), password); } catch (error) { throw mapToAppError(error); } }
  async signUpWithEmail(email: string, password: string, displayName: string): Promise<AuthSession> {
    try { return await this.repository.signUpWithEmail({ email: email.trim(), password, displayName: displayName.trim() }); } catch (error) { throw mapToAppError(error); }
  }
  async signInWithProvider(credential: FederatedCredential) { try { return await this.repository.signInWithProvider(credential); } catch (error) { throw mapToAppError(error); } }
  async sendPasswordReset(email: string) { try { await this.repository.sendPasswordReset(email.trim()); } catch (error) { throw mapToAppError(error); } }
  async sendEmailVerification() { try { await this.repository.sendEmailVerification(); } catch (error) { throw mapToAppError(error); } }
  async refreshSession() {
    try { const session = await this.repository.refreshSession(); this.setSession(session); return session; } catch (error) { throw mapToAppError(error); }
  }
  async signOut() { try { await this.repository.signOut(); } catch (error) { throw mapToAppError(error); } }
  async deleteAccount() { try { await this.repository.deleteAccount(); } catch (error) { throw mapToAppError(error); } }
  private setSession(session: AuthSession | null) { this.setState(session ? { status: 'authenticated', session } : { status: 'unauthenticated', session: null }); }
  private setState(state: AuthState) { this.state = state; this.listeners.forEach((listener) => listener(state)); }
}
