import { AppError } from '@/types';

const firebaseCodeMap: Record<string, ConstructorParameters<typeof AppError>[0]> = {
  'auth/network-request-failed': 'NETWORK_ERROR',
  'auth/user-not-found': 'AUTH_REQUIRED',
  'auth/wrong-password': 'AUTH_REQUIRED',
  'auth/invalid-credential': 'AUTH_REQUIRED',
  'auth/too-many-requests': 'RATE_LIMITED',
  'auth/email-already-in-use': 'VALIDATION_ERROR',
  'auth/invalid-email': 'VALIDATION_ERROR',
  'auth/missing-password': 'VALIDATION_ERROR',
  'auth/weak-password': 'VALIDATION_ERROR',
  'auth/password-does-not-meet-requirements': 'VALIDATION_ERROR',
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

/** The Firebase error code behind an AppError (e.g. `auth/email-already-in-use`), so screens can explain it. */
export function externalErrorCode(error: unknown): string | undefined {
  return readExternalCode(error instanceof AppError ? error.cause : error);
}

/** `details.reason` of a refused Cloud Functions call (e.g. `email-not-verified`), carried as the AppError cause. */
export function serverRefusalReason(error: unknown): string | undefined {
  return error instanceof AppError && typeof error.cause === 'string' ? error.cause : undefined;
}

/** Like `mapToAppError`, but a server's `details.reason` (e.g. `sold-out`) becomes the AppError cause. */
export function mapCallableError(error: unknown): AppError {
  const mapped = mapToAppError(error);
  const details = typeof error === 'object' && error !== null && 'details' in error ? (error as { details?: { reason?: unknown } }).details : undefined;
  return typeof details?.reason === 'string' ? new AppError(mapped.code, mapped.message, { cause: details.reason, retryable: mapped.retryable }) : mapped;
}
