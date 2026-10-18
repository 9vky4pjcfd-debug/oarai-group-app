import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { setGlobalOptions } from 'firebase-functions/v2';
import { HttpsError, onCall, type CallableRequest, type FunctionsErrorCode } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { defineBoolean } from 'firebase-functions/params';
import { AppError, type StaffRole } from '@/types';

initializeApp();
export const db = getFirestore();
// Optional fields in shared app types may be undefined; Firestore would reject those writes.
db.settings({ ignoreUndefinedProperties: true });
export const auth = getAuth();

// Tokyo keeps calls close to the hotels and guests; the client uses the same region.
setGlobalOptions({ region: 'asia-northeast1', maxInstances: 10 });

/** Turn on once App Check is registered for the web site and the store apps. */
const enforceAppCheck = defineBoolean('ENFORCE_APP_CHECK', { default: false, description: 'Reject calls without a valid App Check token' });

const appErrorCodes: Record<AppError['code'], FunctionsErrorCode> = {
  NETWORK_ERROR: 'unavailable',
  AUTH_REQUIRED: 'unauthenticated',
  PERMISSION_DENIED: 'permission-denied',
  NOT_FOUND: 'not-found',
  VALIDATION_ERROR: 'invalid-argument',
  RATE_LIMITED: 'resource-exhausted',
  SERVER_ERROR: 'internal',
  MAINTENANCE: 'unavailable',
  UNKNOWN: 'internal',
};

/** A refusal the app explains to the user; `reason` arrives as `details.reason`. */
export function refuse(reason: string, message: string, code: FunctionsErrorCode = 'failed-precondition'): never {
  throw new HttpsError(code, message, { reason });
}

/** A callable in the shared region, with rule errors mapped to HTTPS errors and anything unexpected logged, never leaked. */
export function callable<Result>(name: string, handler: (request: CallableRequest<unknown>) => Promise<Result>) {
  return onCall({ enforceAppCheck }, async (request) => {
    try {
      return await handler(request);
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      if (error instanceof AppError) throw new HttpsError(appErrorCodes[error.code], error.message, typeof error.cause === 'string' ? { reason: error.cause } : undefined);
      logger.error(`${name} failed`, error);
      throw new HttpsError('internal', 'The request could not be completed.');
    }
  });
}

export interface Caller { uid: string; email: string | null; emailVerified: boolean; role: StaffRole | null; hotelIds: string[]; }

export function requireUser(request: CallableRequest<unknown>): Caller {
  const token = request.auth?.token;
  if (!request.auth || !token) throw new HttpsError('unauthenticated', 'Sign in first.');
  const role = token.role === 'staff' || token.role === 'manager' || token.role === 'admin' ? token.role : null;
  const hotelIds = Array.isArray(token.hotels) ? token.hotels.filter((item: unknown): item is string => typeof item === 'string') : [];
  return { uid: request.auth.uid, email: typeof token.email === 'string' ? token.email.toLowerCase() : null, emailVerified: token.email_verified === true, role, hotelIds };
}

export function requireVerifiedUser(request: CallableRequest<unknown>): Caller {
  const caller = requireUser(request);
  if (!caller.emailVerified) refuse('email-not-verified', 'Verify your email address first.');
  return caller;
}

const roleRank: Record<StaffRole, number> = { staff: 1, manager: 2, admin: 3 };

/** The caller must hold at least `minimum`, and staff and managers only act on their own hotels. */
export function requireStaff(request: CallableRequest<unknown>, minimum: StaffRole, hotelId?: string | null): Caller {
  const caller = requireUser(request);
  if (!caller.role || roleRank[caller.role] < roleRank[minimum]) throw new HttpsError('permission-denied', 'You do not have access to this.');
  // A null hotelId means the whole group, which only admins manage.
  if (hotelId !== undefined && caller.role !== 'admin' && (hotelId === null || !caller.hotelIds.includes(hotelId))) {
    throw new HttpsError('permission-denied', 'You do not have access to this hotel.');
  }
  return caller;
}

export function canManageHotel(caller: Caller, hotelId: string | null): boolean {
  return caller.role === 'admin' || (hotelId !== null && caller.hotelIds.includes(hotelId));
}

/** Firestore timestamps become ISO strings, the shape the app reads. */
export function toPlain<T>(data: Record<string, unknown>): T {
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value instanceof Timestamp ? value.toDate().toISOString() : value])) as T;
}

export function audit(actorId: string, action: string, targetType: string, targetId: string, hotelId: string | null) {
  return { actorId, action, targetType, targetId, hotelId, createdAt: Timestamp.now() };
}
