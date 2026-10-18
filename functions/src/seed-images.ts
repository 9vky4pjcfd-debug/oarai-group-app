/**
 * The build turns `require('@/assets/x.jpg')` into the string `x.jpg`, so app-bundled images
 * become `{ kind: 'bundled', key }`, which the app resolves to the same file.
 */
export function toStoredImages<T>(value: T): T {
  if (Array.isArray(value)) return value.map(toStoredImages) as T;
  // Only plain objects are walked, so values such as Firestore timestamps pass through untouched.
  if (typeof value !== 'object' || value === null || Object.getPrototypeOf(value) !== Object.prototype) return value;
  const record = value as Record<string, unknown>;
  if (record.kind === 'local' && typeof record.source === 'string') return { kind: 'bundled', key: record.source, accessibilityLabel: record.accessibilityLabel } as T;
  return Object.fromEntries(Object.entries(record).filter(([, item]) => item !== undefined).map(([key, item]) => [key, toStoredImages(item)])) as T;
}
