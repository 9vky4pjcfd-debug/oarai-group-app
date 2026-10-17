import type { AppEnvironment } from '@/config';

export type NativeAppCheckProvider = 'debug' | 'play-integrity' | 'app-attest-with-device-check-fallback';

export interface AppCheckIntegrationPlan {
  android: NativeAppCheckProvider;
  ios: NativeAppCheckProvider;
  enforcementRequired: boolean;
}

export interface AppCheckInitializationResult {
  status: 'pending-native-configuration';
  plan: AppCheckIntegrationPlan;
}

export function getAppCheckIntegrationPlan(environment: AppEnvironment): AppCheckIntegrationPlan {
  if (environment === 'development') {
    return { android: 'debug', ios: 'debug', enforcementRequired: false };
  }
  return {
    android: 'play-integrity',
    ios: 'app-attest-with-device-check-fallback',
    enforcementRequired: true,
  };
}

/** Native attestation requires a development build, real Firebase projects and platform credentials. */
export async function initializeAppCheckIntegration(environment: AppEnvironment): Promise<AppCheckInitializationResult> {
  return { status: 'pending-native-configuration', plan: getAppCheckIntegrationPlan(environment) };
}
