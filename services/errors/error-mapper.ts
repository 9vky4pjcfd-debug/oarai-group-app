import { AppError } from '@/types';

const firebaseCodeMap: Record<string, ConstructorParameters<typeof AppError>[0]> = {
  'auth/network-request-failed': 'NETWORK_ERROR',
  'auth/user-not-found': 'AUTH_REQUIRED',
  'auth/wrong-password': 'AUTH_REQUIRED',
  'auth/invalid-credential': 'AUTH_REQUIRED',
  'auth/too-many-requests': 'RATE_LIMITED',
  'permission-denied': 'PERMISSION_DENIED',
  'not-found': 'NOT_FOUND',
  'resource-exhausted': 'RATE_LIMITED',
  'unavailable': 'NETWORK_ERROR',
  'functions/unauthenticated': 'AUTH_REQUIRED',
  'functions/permission-denied': 'PERMISSION_DENIED',
  'functions/not-found': 'NOT_FOUND',
  'functions/invalid-argument': 'VALIDATION_ERROR',
  'functions/failed-precondition': 'VALIDATION_ERROR',
  'functions/resource-exhausted': 'RATE_LIMITED',
  'functions/unavailable': 'NETWORK_ERROR',
  'functions/internal': 'SERVER_ERROR',
};

function readExternalCode(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null || !('code' in error)) return undefined;
  return typeof error.code === 'string' ? error.code : undefined;
}

export function mapToAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  const externalCode = readExternalCode(error);
  const code = externalCode ? firebaseCodeMap[externalCode] ?? 'UNKNOWN' : 'UNKNOWN';
  const retryable = code === 'NETWORK_ERROR' || code === 'RATE_LIMITED' || code === 'SERVER_ERROR';
  return new AppError(code, 'The requested operation could not be completed.', { cause: error, retryable });
}
