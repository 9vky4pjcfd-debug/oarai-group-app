import { describe, expect, it } from 'vitest';
import { adminErrorKey, cleanLocalized, datesBetween, hasRole, isHttpsUrl, jstDate, jstMidnightIso, managedHotels, monthEnd, parseCount, parseEmailList, rangeError, shiftMonth } from '@/features/admin/admin-rules';
import { adminText } from '@/i18n/locales/admin';
import { mapCallableError } from '@/services/errors/error-mapper';
import type { HotelPublicProfile } from '@/types';

const hotel = (hotelId: string) => ({ hotelId }) as HotelPublicProfile;

describe('admin rules', () => {
  it('ranks roles and limits hotels to the claims unless admin', () => {
    expect(hasRole({ role: 'manager' }, 'staff')).toBe(true);
    expect(hasRole({ role: 'staff' }, 'manager')).toBe(false);
    expect(hasRole({ role: 'member' }, 'staff')).toBe(false);
    const hotels = [hotel('a'), hotel('b')];
    expect(managedHotels({ role: 'staff', hotelIds: ['b', 'x'] }, hotels).map((item) => item.hotelId)).toEqual(['b']);
    expect(managedHotels({ role: 'admin', hotelIds: [] }, hotels)).toHaveLength(2);
  });

  it('validates counts, ranges and URLs', () => {
    expect(parseCount('')).toBeNull();
    expect(parseCount(' 12,000 ')).toBe(12000);
    expect(parseCount('-1')).toBeNaN();
    expect(parseCount('1.5')).toBeNaN();
    expect(rangeError('2026-10-01', '2026-12-01')).toBeNull();
    expect(rangeError('2026-10-01', '2026-12-02')).toBe('max');
    expect(rangeError('2026-10-02', '2026-10-01')).toBe('order');
    expect(rangeError('2026-02-30', '2026-03-01')).toBe('date');
    expect(isHttpsUrl('https://example.com/path?x=1')).toBe(true);
    expect(isHttpsUrl('http://example.com')).toBe(false);
    expect(isHttpsUrl('https://localhost')).toBe(false);
  });

  it('handles months and Japan-time dates', () => {
    expect(monthEnd('2026-02-01')).toBe('2026-02-28');
    expect(shiftMonth('2026-12-01', 1)).toBe('2027-01-01');
    expect(datesBetween('2026-10-30', '2026-11-01')).toEqual(['2026-10-30', '2026-10-31', '2026-11-01']);
    expect(jstMidnightIso('2026-10-17')).toBe('2026-10-16T15:00:00.000Z');
    expect(jstDate('2026-10-16T15:00:00.000Z')).toBe('2026-10-17');
  });

  it('cleans text and email lists', () => {
    expect(cleanLocalized({ ja: ' お知らせ ', en: ' ', 'zh-TW': '' })).toEqual({ ja: 'お知らせ' });
    expect(parseEmailList('a@example.com\n\na@example.com, bad')).toEqual({ emails: ['a@example.com', 'bad'], invalid: ['bad'] });
  });

  it('explains server refusals', () => {
    expect(adminErrorKey(mapCallableError({ code: 'functions/failed-precondition', details: { reason: 'below-booked' } }))).toEqual({ key: 'reasons.below-booked' });
    expect(adminErrorKey(mapCallableError({ code: 'functions/permission-denied' }))).toEqual({ key: 'permission' });
    expect(adminErrorKey(mapCallableError({ code: 'functions/invalid-argument', details: { reason: 'something-new' } }))).toEqual({ key: 'invalid', reason: 'something-new' });
  });

  it('has the same admin strings in every language', () => {
    const keys = (value: object, prefix = ''): string[] => Object.entries(value).flatMap(([key, child]) => typeof child === 'object' ? keys(child, `${prefix}${key}.`) : [`${prefix}${key.replace(/_(one|other)$/, '')}`]);
    const ja = [...new Set(keys(adminText.ja))].sort();
    expect([...new Set(keys(adminText['zh-TW']))].sort()).toEqual(ja);
    expect([...new Set(keys(adminText.en))].sort()).toEqual(ja);
  });
});
