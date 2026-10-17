export const appErrorCodes = [
  'NETWORK_ERROR', 'AUTH_REQUIRED', 'PERMISSION_DENIED', 'NOT_FOUND',
  'VALIDATION_ERROR', 'RATE_LIMITED', 'SERVER_ERROR', 'MAINTENANCE', 'UNKNOWN',
] as const;

export type AppErrorCode = (typeof appErrorCodes)[number];

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly retryable: boolean;

  constructor(code: AppErrorCode, message: string, options?: { cause?: unknown; retryable?: boolean }) {
    super(message, options?.cause === undefined ? undefined : { cause: options.cause });
    this.name = 'AppError';
    this.code = code;
    this.retryable = options?.retryable ?? false;
  }
}
