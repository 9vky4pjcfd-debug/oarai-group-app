import { createContext, useContext, useSyncExternalStore, type PropsWithChildren } from 'react';
import { services } from '@/services';
import type { AuthState } from '@/types';

const AuthStateContext = createContext<AuthState>({ status: 'loading', session: null });
const serverAuthState: AuthState = { status: 'loading', session: null };

export function AuthProvider({ children }: PropsWithChildren) {
  const state = useSyncExternalStore(
    (listener) => services.auth.subscribe(listener),
    () => services.auth.getState(),
    () => serverAuthState,
  );
  return <AuthStateContext.Provider value={state}>{children}</AuthStateContext.Provider>;
}

export function useAuthState() { return useContext(AuthStateContext); }
