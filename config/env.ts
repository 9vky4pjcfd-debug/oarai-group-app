export const appEnvironments = ['development', 'staging', 'production'] as const;
export type AppEnvironment = (typeof appEnvironments)[number];

export const backendModes = ['mock', 'firebase'] as const;
export type BackendMode = (typeof backendModes)[number];

export interface EnvironmentSource {
  EXPO_PUBLIC_APP_ENV?: string | undefined;
  EXPO_PUBLIC_BACKEND_MODE?: string | undefined;
  EXPO_PUBLIC_API_BASE_URL?: string | undefined;
  EXPO_PUBLIC_FIREBASE_API_KEY?: string | undefined;
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?: string | undefined;
  EXPO_PUBLIC_FIREBASE_PROJECT_ID?: string | undefined;
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?: string | undefined;
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?: string | undefined;
  EXPO_PUBLIC_FIREBASE_APP_ID?: string | undefined;
  EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID?: string | undefined;
  EXPO_PUBLIC_APP_CHECK_DEBUG?: string | undefined;
}

export interface EnvironmentConfig {
  name: AppEnvironment;
  backendMode: BackendMode;
  apiBaseUrl?: string | undefined;
  appCheckDebug: boolean;
  isDevelopment: boolean;
  isProduction: boolean;
}

function isAppEnvironment(value: string | undefined): value is AppEnvironment {
  return appEnvironments.includes(value as AppEnvironment);
}

function isBackendMode(value: string | undefined): value is BackendMode {
  return backendModes.includes(value as BackendMode);
}

export function resolveEnvironment(source: EnvironmentSource): EnvironmentConfig {
  const name = isAppEnvironment(source.EXPO_PUBLIC_APP_ENV) ? source.EXPO_PUBLIC_APP_ENV : 'development';
  const backendMode = isBackendMode(source.EXPO_PUBLIC_BACKEND_MODE) ? source.EXPO_PUBLIC_BACKEND_MODE : 'mock';
  const appCheckDebug = source.EXPO_PUBLIC_APP_CHECK_DEBUG === 'true';

  if (name !== 'development' && backendMode === 'mock') {
    throw new Error('Mock backend is allowed only in the development environment.');
  }
  if (name === 'production' && appCheckDebug) {
    throw new Error('Firebase App Check debug mode is forbidden in production.');
  }

  return {
    name,
    backendMode,
    apiBaseUrl: source.EXPO_PUBLIC_API_BASE_URL,
    appCheckDebug,
    isDevelopment: name === 'development',
    isProduction: name === 'production',
  };
}

export const runtimeEnvironmentSource: EnvironmentSource = {
  EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
  EXPO_PUBLIC_BACKEND_MODE: process.env.EXPO_PUBLIC_BACKEND_MODE,
  EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
  EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
  EXPO_PUBLIC_APP_CHECK_DEBUG: process.env.EXPO_PUBLIC_APP_CHECK_DEBUG,
};

export const environmentConfig = resolveEnvironment(runtimeEnvironmentSource);
export const appEnvironment = environmentConfig.name;
