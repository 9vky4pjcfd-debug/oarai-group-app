import type { Href } from 'expo-router';
import { externalErrorCode } from '@/services/errors/error-mapper';
import { AppError, type MemberProfileDocument } from '@/types';

export const MIN_PASSWORD_LENGTH = 8;

const errorKeys: Record<string, string> = {
  'auth/invalid-credential': 'auth.errors.invalidCredential',
  'auth/user-not-found': 'auth.errors.invalidCredential',
  'auth/wrong-password': 'auth.errors.invalidCredential',
  'auth/email-already-in-use': 'auth.errors.emailInUse',
  'auth/weak-password': 'auth.errors.weakPassword',
  'auth/password-does-not-meet-requirements': 'auth.errors.weakPassword',
  'auth/invalid-email': 'auth.errors.invalidEmail',
  'auth/missing-password': 'auth.errors.passwordRequired',
  'auth/too-many-requests': 'auth.errors.tooManyRequests',
  'auth/network-request-failed': 'auth.errors.network',
  'auth/requires-recent-login': 'auth.errors.recentLogin',
};

/** The `auth.errors.*` key explaining a failed auth call. */
export function authErrorKey(error: unknown): string {
  const code = externalErrorCode(error);
  if (code && errorKeys[code]) return errorKeys[code];
  if (error instanceof AppError && error.code === 'NETWORK_ERROR') return 'auth.errors.network';
  if (error instanceof AppError && error.code === 'RATE_LIMITED') return 'auth.errors.tooManyRequests';
  return 'auth.errors.generic';
}

export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export function memberLanguage(language: string | undefined): MemberProfileDocument['preferredLanguage'] {
  const tag = language?.toLowerCase() ?? '';
  if (tag.startsWith('zh')) return 'zh-TW';
  if (tag.startsWith('en')) return 'en';
  return 'ja';
}

export const defaultDisplayName = (user: { displayName?: string | null | undefined; email: string | null }) => user.displayName?.trim() || user.email?.split('@')[0] || '';

/** Only same-app paths are followed after sign-in, so a crafted link cannot send the user elsewhere. */
export function safeRedirect(value: string | string[] | undefined): Href | null {
  const path = Array.isArray(value) ? value[0] : value;
  return path && path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/\\') ? (path as Href) : null;
}

export function signInHref(redirect?: string): Href {
  return redirect ? { pathname: '/account/sign-in', params: { redirect } } : '/account/sign-in';
}
