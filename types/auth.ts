export type MemberRole = 'guest' | 'member' | 'staff' | 'manager' | 'admin';
export type AuthProvider = 'email' | 'apple' | 'google';
export type AuthStatus = 'loading' | 'unauthenticated' | 'authenticated';

export interface User {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  role: MemberRole;
  roleSource: 'custom-claims';
  /** Hotels a staff member or manager may manage (from Custom Claims); admins manage every hotel. */
  hotelIds: string[];
  displayName?: string | null | undefined;
}

export interface AuthSession {
  user: User;
  issuedAt?: string | undefined;
}

export type AuthState =
  | { status: 'loading'; session: null }
  | { status: 'unauthenticated'; session: null }
  | { status: 'authenticated'; session: AuthSession };

export interface FederatedCredential {
  provider: Extract<AuthProvider, 'apple' | 'google'>;
  idToken: string;
  nonce?: string | undefined;
}
