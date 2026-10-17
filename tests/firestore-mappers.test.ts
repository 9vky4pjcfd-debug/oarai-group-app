import { describe, expect, it } from 'vitest';
import { mapFirestoreDates, toISODateString } from '@/repositories/firebase';
import { AppError } from '@/types';

describe('Firestore timestamp mapping', () => {
  it('maps Firestore-like timestamps at the repository boundary', () => {
    const timestamp = { toDate: () => new Date('2026-01-01T00:00:00.000Z') };
    expect(mapFirestoreDates<{ createdAt: string }>({ createdAt: timestamp }, ['createdAt']).createdAt).toBe('2026-01-01T00:00:00.000Z');
  });
  it('rejects invalid backend timestamp values', () => {
    expect(() => toISODateString(null)).toThrow(AppError);
  });
});
