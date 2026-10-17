import { describe, expect, it } from 'vitest';
import { resolveEnvironment } from '@/config/env';
import { resolveFirebaseOptions } from '@/config/firebase';

describe('environment configuration', () => {
  it('defaults to development mock mode', () => {
    expect(resolveEnvironment({})).toMatchObject({ name: 'development', backendMode: 'mock', isDevelopment: true });
  });
  it('rejects mock mode outside development', () => {
    expect(() => resolveEnvironment({ EXPO_PUBLIC_APP_ENV: 'production', EXPO_PUBLIC_BACKEND_MODE: 'mock' })).toThrow();
  });
  it('rejects App Check debug in production', () => {
    expect(() => resolveEnvironment({ EXPO_PUBLIC_APP_ENV: 'production', EXPO_PUBLIC_BACKEND_MODE: 'firebase', EXPO_PUBLIC_APP_CHECK_DEBUG: 'true' })).toThrow();
  });
  it('requires a complete Firebase client configuration', () => {
    expect(resolveFirebaseOptions({ EXPO_PUBLIC_FIREBASE_API_KEY: 'public-client-value' })).toBeNull();
    expect(resolveFirebaseOptions({
      EXPO_PUBLIC_FIREBASE_API_KEY: 'public-client-value', EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: 'example.invalid',
      EXPO_PUBLIC_FIREBASE_PROJECT_ID: 'test-only-project', EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: 'example.invalid',
      EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '1', EXPO_PUBLIC_FIREBASE_APP_ID: 'test-app',
    })?.projectId).toBe('test-only-project');
  });
});
