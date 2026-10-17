import { describe, expect, it } from 'vitest';
import { sanitizeMetadata } from '@/services/logging';

describe('production logging sanitization', () => {
  it('redacts credentials and personal reservation data recursively', () => {
    expect(sanitizeMetadata({ token: 'secret', nested: { reservationId: 'R-1', count: 2 }, status: 'ok' })).toEqual({
      token: '[REDACTED]', nested: { reservationId: '[REDACTED]', count: 2 }, status: 'ok',
    });
  });
});
