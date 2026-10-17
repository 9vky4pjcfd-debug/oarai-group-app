import { describe, expect, it } from 'vitest';
import { mapToAppError } from '@/services/errors';
import { AppError } from '@/types';

describe('error mapping', () => {
  it('maps network errors without exposing the raw Firebase message', () => {
    const result = mapToAppError({ code: 'auth/network-request-failed', message: 'internal firebase detail' });
    expect(result.code).toBe('NETWORK_ERROR');
    expect(result.message).not.toContain('internal firebase detail');
  });
  it('preserves an existing AppError', () => {
    const source = new AppError('MAINTENANCE', 'Maintenance');
    expect(mapToAppError(source)).toBe(source);
  });
  it('maps unknown failures to UNKNOWN', () => { expect(mapToAppError(new Error('boom')).code).toBe('UNKNOWN'); });
});
