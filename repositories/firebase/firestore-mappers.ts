import type { DocumentData } from 'firebase/firestore';
import { AppError } from '@/types';

function hasToDate(value: unknown): value is { toDate(): Date } {
  return typeof value === 'object' && value !== null && 'toDate' in value && typeof value.toDate === 'function';
}

export function toISODateString(value: unknown): string {
  if (typeof value === 'string' && !Number.isNaN(Date.parse(value))) return value;
  if (value instanceof Date) return value.toISOString();
  if (hasToDate(value)) return value.toDate().toISOString();
  throw new AppError('VALIDATION_ERROR', 'A backend timestamp was missing or invalid.');
}

export function mapFirestoreDates<T>(data: DocumentData, dateFields: readonly string[]): T {
  const mapped: DocumentData = { ...data };
  dateFields.forEach((field) => { mapped[field] = toISODateString(data[field]); });
  return mapped as T;
}
