import { isDateOnly } from '@/services/booking/booking-rules';
import { AppError, type AdminNotice, type BookingContacts, type BookingRequest, type InventoryQuery, type InventoryUpdate, type LocalizedText, type NoticeCategory, type StaffUpdate, type StaySearch } from '@/types';

// Callable data comes straight from the client, so every field is checked for type and size here
// before any business rule runs.

type Data = Record<string, unknown>;

function invalid(message: string): never { throw new AppError('VALIDATION_ERROR', message); }

export function object(value: unknown): Data {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) invalid('A request object is required.');
  return value as Data;
}

export function text(data: Data, key: string, max: number, options: { optional?: boolean } = {}): string {
  const value = data[key];
  if (value === undefined || value === null || value === '') {
    if (options.optional) return '';
    invalid(`${key} is required.`);
  }
  if (typeof value !== 'string' || value.length > max) invalid(`${key} must be text up to ${max} characters.`);
  return value.trim();
}

export function integer(data: Data, key: string, min: number, max: number): number {
  const value = data[key];
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) invalid(`${key} must be a whole number from ${min} to ${max}.`);
  return value;
}

export function date(data: Data, key: string): string {
  const value = text(data, key, 10);
  if (!isDateOnly(value)) invalid(`${key} must be a YYYY-MM-DD date.`);
  return value;
}

const idPattern = /^[a-z0-9][a-z0-9-]{0,62}$/;
export function id(data: Data, key: string): string {
  const value = text(data, key, 63);
  if (!idPattern.test(value)) invalid(`${key} is not a valid ID.`);
  return value;
}

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseStaySearch(value: unknown): StaySearch {
  const data = object(value);
  return {
    hotelId: id(data, 'hotelId'),
    checkIn: date(data, 'checkIn'),
    checkOut: date(data, 'checkOut'),
    adults: integer(data, 'adults', 1, 50),
    children: integer(data, 'children', 0, 50),
    infants: integer(data, 'infants', 0, 50),
    rooms: integer(data, 'rooms', 1, 50),
  };
}

export function parseBookingRequest(value: unknown): BookingRequest {
  const data = object(value);
  const contact = object(data.contact);
  return {
    ...parseStaySearch(data),
    roomId: id(data, 'roomId'),
    contact: { name: text(contact, 'name', 80), phone: text(contact, 'phone', 20), email: text(contact, 'email', 254) },
    notes: text(data, 'notes', 500, { optional: true }),
    quotedTotal: integer(data, 'quotedTotal', 0, 100_000_000),
  };
}

export function parseInventoryQuery(value: unknown): InventoryQuery {
  const data = object(value);
  return { hotelId: id(data, 'hotelId'), from: date(data, 'from'), to: date(data, 'to') };
}

export function parseInventoryUpdate(value: unknown): InventoryUpdate {
  const data = object(value);
  const roomIds = data.roomIds;
  if (!Array.isArray(roomIds) || roomIds.length === 0 || roomIds.length > 30) invalid('Choose 1 to 30 room types.');
  const update: InventoryUpdate = {
    hotelId: id(data, 'hotelId'),
    roomIds: roomIds.map((_, index) => id(roomIds as unknown as Data, String(index))),
    from: date(data, 'from'),
    to: date(data, 'to'),
  };
  if (data.weekdays !== undefined) {
    if (!Array.isArray(data.weekdays) || data.weekdays.some((day) => !Number.isInteger(day) || day < 0 || day > 6)) invalid('weekdays must be 0 to 6.');
    update.weekdays = [...new Set(data.weekdays as number[])];
  }
  if (data.allotment !== undefined) update.allotment = integer(data, 'allotment', 0, 999);
  if (data.adultRate !== undefined) update.adultRate = integer(data, 'adultRate', 0, 10_000_000);
  if (data.closed !== undefined) {
    if (typeof data.closed !== 'boolean') invalid('closed must be true or false.');
    update.closed = data.closed;
  }
  if (update.allotment === undefined && update.adultRate === undefined && update.closed === undefined) invalid('Nothing to change.');
  return update;
}

export function parseBookingContacts(value: unknown): BookingContacts {
  const data = object(value);
  const emails = data.emails;
  if (!Array.isArray(emails) || emails.length > 10) invalid('Up to 10 addresses.');
  const cleaned = [...new Set(emails.map((item) => (typeof item === 'string' ? item.trim().toLowerCase() : '')))];
  if (cleaned.some((item) => item.length > 254 || !emailPattern.test(item))) invalid('Every address must be a valid email.');
  return { hotelId: id(data, 'hotelId'), emails: cleaned };
}

const languages = ['ja', 'zh-TW', 'en'] as const;
function localized(data: Data, key: string, max: number, required: boolean): LocalizedText {
  const value = data[key] === undefined ? {} : object(data[key]);
  const result: LocalizedText = {};
  for (const language of languages) {
    const item = text(value, language, max, { optional: true });
    if (item) result[language] = item;
  }
  if (required && !result.ja) invalid(`${key} needs Japanese text.`);
  return result;
}

const categories: readonly NoticeCategory[] = ['news', 'campaign', 'facility', 'important'];

function isoTime(data: Data, key: string, optional: boolean): string | undefined {
  const value = text(data, key, 40, { optional });
  if (!value) return undefined;
  const time = Date.parse(value);
  if (Number.isNaN(time)) invalid(`${key} must be a date and time.`);
  return new Date(time).toISOString();
}

export function parseNotice(value: unknown): AdminNotice {
  const data = object(value);
  const hotelId = data.hotelId === null ? null : id(data, 'hotelId');
  const category = data.category as NoticeCategory;
  if (!categories.includes(category)) invalid('Unknown category.');
  if (data.priority !== 'normal' && data.priority !== 'important') invalid('Unknown priority.');
  if (typeof data.published !== 'boolean') invalid('published must be true or false.');
  const linkUrl = text(data, 'linkUrl', 500, { optional: true });
  if (linkUrl) {
    let url: URL | null = null;
    try { url = new URL(linkUrl); } catch { invalid('linkUrl must be an https address.'); }
    if (url.protocol !== 'https:' || url.username || url.password) invalid('linkUrl must be an https address.');
  }
  const notice: AdminNotice = {
    noticeId: text(data, 'noticeId', 63, { optional: true }),
    hotelId,
    category,
    priority: data.priority,
    title: localized(data, 'title', 120, true),
    body: localized(data, 'body', 4000, true),
    publishedAt: isoTime(data, 'publishedAt', false)!,
    sortOrder: data.sortOrder === undefined ? 0 : integer(data, 'sortOrder', -1000, 1000),
    published: data.published,
  };
  if (notice.noticeId && !idPattern.test(notice.noticeId)) invalid('noticeId is not a valid ID.');
  const expiresAt = isoTime(data, 'expiresAt', true);
  if (expiresAt) notice.expiresAt = expiresAt;
  if (linkUrl) notice.linkUrl = linkUrl;
  return notice;
}

export function parseStaffUpdate(value: unknown): StaffUpdate {
  const data = object(value);
  const email = text(data, 'email', 254).toLowerCase();
  if (!emailPattern.test(email)) invalid('A valid email is required.');
  const role = data.role;
  if (role !== 'staff' && role !== 'manager' && role !== 'admin' && role !== 'none') invalid('Unknown role.');
  const hotelIds = data.hotelIds;
  if (!Array.isArray(hotelIds) || hotelIds.length > 30) invalid('hotelIds must be a list.');
  return { email, role, hotelIds: [...new Set(hotelIds.map((_, index) => id(hotelIds as unknown as Data, String(index))))] };
}
