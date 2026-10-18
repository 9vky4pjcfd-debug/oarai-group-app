import { describe, expect, it } from 'vitest';
import { confirmationCode, membershipNumber } from '@/functions/src/core/codes';
import { parseBookingContacts, parseBookingRequest, parseInventoryUpdate, parseNotice } from '@/functions/src/core/input';
import { dateRange, nightRemaining, quoteRoom } from '@/functions/src/core/inventory';
import { guestConfirmationMail, hotelNoticeMail } from '@/functions/src/core/mail';
import { stayAward } from '@/functions/src/core/points';
import { toStoredImages } from '@/functions/src/seed-images';
import { mockMembershipTiers } from '@/repositories/mock/mock-membership';
import { defaultBookingPolicy } from '@/services/booking/booking-rules';
import type { ReservationDocument, StaySearch } from '@/types';

const search: StaySearch = { hotelId: 'oarai-hotel', checkIn: '2026-11-06', checkOut: '2026-11-08', adults: 2, children: 1, infants: 1, rooms: 1 };
const open = (allotment: number, booked = 0, adultRate = 16500) => ({ allotment, booked, adultRate, closed: false });

describe('booking inventory on the server', () => {
  it('sells only what is left of the allotment on every night', () => {
    const quote = quoteRoom('oarai-hotel', 'moderate', { ...search, rooms: 2 }, [open(3, 1), open(3, 2)], defaultBookingPolicy);
    expect(quote.remaining).toBe(1);
    expect(quote.nightly).toEqual([]);
    expect(quote.totalAmount).toBe(0);
  });
  it('prices per person: adults full, children half rounded to ¥100, infants free', () => {
    const quote = quoteRoom('oarai-hotel', 'moderate', search, [open(3), open(3, 0, 20625)], defaultBookingPolicy);
    expect(quote.nightly).toEqual([{ date: '2026-11-06', amount: 16500 * 2 + 8300 }, { date: '2026-11-07', amount: 20625 * 2 + 10300 }]);
    expect(quote.totalAmount).toBe(41300 + 51550);
  });
  it('treats missing, closed or unpriced nights as sold out', () => {
    expect(nightRemaining(undefined)).toBe(0);
    expect(nightRemaining({ ...open(3), closed: true })).toBe(0);
    expect(nightRemaining(open(3, 0, 0))).toBe(0);
    expect(nightRemaining(open(2, 5))).toBe(0);
    expect(quoteRoom('oarai-hotel', 'moderate', search, [open(3), undefined], defaultBookingPolicy).remaining).toBe(0);
  });
  it('lists date ranges inclusively', () => {
    expect(dateRange('2026-12-30', '2027-01-02')).toEqual(['2026-12-30', '2026-12-31', '2027-01-01', '2027-01-02']);
    expect(dateRange('2026-12-30', '2026-12-30')).toEqual(['2026-12-30']);
  });
});

describe('callable input checks', () => {
  const request = { ...search, roomId: 'moderate', contact: { name: '大洗 太郎', phone: '090-1234-5678', email: 'taro@example.com' }, notes: '', quotedTotal: 1000 };
  it('accepts a well-formed booking and rejects tampered fields', () => {
    expect(parseBookingRequest(request).roomId).toBe('moderate');
    expect(() => parseBookingRequest({ ...request, rooms: 1.5 })).toThrow();
    expect(() => parseBookingRequest({ ...request, hotelId: '../x' })).toThrow();
    expect(() => parseBookingRequest({ ...request, notes: 'x'.repeat(501) })).toThrow();
    expect(() => parseBookingRequest({ ...request, contact: 'x' })).toThrow();
  });
  it('needs at least one field to change in an inventory update', () => {
    expect(() => parseInventoryUpdate({ hotelId: 'oarai-hotel', roomIds: ['moderate'], from: '2026-11-01', to: '2026-11-30' })).toThrow();
    expect(parseInventoryUpdate({ hotelId: 'oarai-hotel', roomIds: ['moderate'], from: '2026-11-01', to: '2026-11-30', weekdays: [6, 6], allotment: 2 })).toMatchObject({ weekdays: [6], allotment: 2 });
    expect(() => parseInventoryUpdate({ hotelId: 'oarai-hotel', roomIds: ['moderate'], from: '2026-11-01', to: '2026-11-30', allotment: -1 })).toThrow();
  });
  it('only allows https links and Japanese text in notices', () => {
    const notice = { noticeId: '', hotelId: null, category: 'news', priority: 'normal', title: { ja: 'お知らせ' }, body: { ja: '本文' }, publishedAt: '2026-11-01T00:00:00+09:00', published: true };
    expect(parseNotice(notice).publishedAt).toBe('2026-10-31T15:00:00.000Z');
    expect(() => parseNotice({ ...notice, linkUrl: 'javascript:alert(1)' })).toThrow();
    expect(() => parseNotice({ ...notice, title: { en: 'News' } })).toThrow();
  });
  it('normalises hotel notice addresses', () => {
    expect(parseBookingContacts({ hotelId: 'gyoraian', emails: [' Front@Example.com ', 'front@example.com'] }).emails).toEqual(['front@example.com']);
    expect(() => parseBookingContacts({ hotelId: 'gyoraian', emails: ['not-an-email'] })).toThrow();
  });
});

describe('server documents', () => {
  const reservation: ReservationDocument = {
    reservationId: 'r1', userId: 'u1', hotelId: 'oarai-hotel', roomId: 'moderate', confirmationCode: 'OG26-ABCDEF', externalReservationId: null, status: 'confirmed',
    checkIn: '2026-11-06', checkOut: '2026-11-08', rooms: 1, adults: 2, children: 1, infants: 0, guestCount: 3, totalAmount: 92850, currency: 'JPY', paymentMethod: 'pay-at-hotel',
    contact: { name: '大洗 太郎', phone: '090-1234-5678', email: 'taro@example.com' }, notes: '', cancelledAt: null, createdAt: '2026-10-18T00:00:00.000Z', updatedAt: '2026-10-18T00:00:00.000Z',
  };
  const context = { hotelName: { ja: '大洗ホテル', en: 'Oarai Hotel' }, hotelPhone: '0570-200-418', roomName: { ja: 'モデレート' } };
  it('writes the guest confirmation in their language with the cancellation fees', () => {
    const mail = guestConfirmationMail(reservation, context, 'en', defaultBookingPolicy);
    expect(mail.to).toEqual(['taro@example.com']);
    expect(mail.message.subject).toContain('Oarai Hotel');
    expect(mail.message.text).toContain('OG26-ABCDEF');
    expect(mail.message.text).toContain('Free cancellation in the app until 2026-11-02');
    expect(mail.message.text).toContain('The day before: 50% (¥46,425)');
  });
  it('tells hotel staff what to enter into 支配人くん', () => {
    const mail = hotelNoticeMail(reservation, context, ['front@example.com'], 'created');
    expect(mail.message.subject).toContain('新規');
    expect(mail.message.text).toContain('090-1234-5678');
  });
  it('awards stay points at the tier the member held, and moves them up', () => {
    expect(stayAward(92850, 400, mockMembershipTiers)).toEqual({ base: 928, total: 928, qualifyingPoints: 1328, tierId: 'silver' });
    expect(stayAward(92850, 1500, mockMembershipTiers)).toMatchObject({ base: 928, total: 1392, tierId: 'gold' });
  });
  it('makes readable codes', () => {
    expect(confirmationCode(new Date('2026-10-18T00:00:00Z'))).toMatch(/^OG26-[A-HJ-NP-Z2-9]{6}$/);
    expect(membershipNumber(42, new Date('2026-10-18T00:00:00Z'))).toBe('OG-2026-000042');
  });
  it('stores app-bundled images by key', () => {
    expect(toStoredImages({ images: [{ kind: 'local', source: 'content/room.jpg', accessibilityLabel: { ja: '客室' } }], skip: undefined })).toEqual({ images: [{ kind: 'bundled', key: 'content/room.jpg', accessibilityLabel: { ja: '客室' } }] });
  });
});

describe('seed content', () => {
  it('keeps audit timestamps as real timestamps', async () => {
    const { seedDocuments } = await import('@/functions/src/seed');
    class FakeTimestamp { constructor(readonly seconds: number) {} }
    const now = new FakeTimestamp(1) as unknown as Parameters<typeof seedDocuments>[0];
    const documents = seedDocuments(now);
    const room = documents.find((item) => item.collection === 'rooms') as { data: Record<string, unknown> };
    expect(room.data.createdAt).toBe(now);
    expect(room.data.published).toBe(true);
  });
});
