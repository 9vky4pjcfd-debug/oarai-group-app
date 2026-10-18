import type { DateOnly } from './booking';
import type { ReservationDocument } from './firestore';
import type { Notice } from './public-content';

/** Hotel-side roles. They come only from verified Custom Claims set by the server. */
export type StaffRole = 'staff' | 'manager' | 'admin';

/** App allotment and adult rate for one room type on one night (`bookingInventory`). */
export interface InventoryRow {
  hotelId: string;
  roomId: string;
  date: DateOnly;
  /** Rooms of this type set aside for app sales. */
  allotment: number;
  /** Rooms already sold through the app; maintained by the booking functions. */
  booked: number;
  /** Adult rate per person per night (JPY, tax and service included); 0 when not set. */
  adultRate: number;
  closed: boolean;
}

/** Dates are inclusive, at most 62 nights. */
export interface InventoryQuery { hotelId: string; from: DateOnly; to: DateOnly; }

/** Sets the given fields on every night from `from` to `to` (inclusive) for each room; fields left out stay as they are. */
export interface InventoryUpdate {
  hotelId: string;
  roomIds: string[];
  from: DateOnly;
  to: DateOnly;
  /** Only these weekdays (0 = Sunday … 6 = Saturday); every day when left out. */
  weekdays?: number[];
  allotment?: number;
  adultRate?: number;
  closed?: boolean;
}

export interface InventoryUpdateResult { updated: number; }

/** Addresses that receive the booking and cancellation notices of one hotel. */
export interface BookingContacts { hotelId: string; emails: string[]; }

/** A notice as staff edit it, including unpublished drafts. */
export interface AdminNotice extends Notice { published: boolean; }

export interface StaffMember { uid: string; email: string; role: StaffRole; hotelIds: string[]; updatedAt: string; }

/** `role: 'none'` removes hotel access. `hotelIds` is ignored for admins, who manage every hotel. */
export interface StaffUpdate { email: string; role: StaffRole | 'none'; hotelIds: string[]; }

/** Reservations whose check-in falls between `from` and `to` (inclusive), at most 62 days. */
export interface ReservationQuery { hotelId: string; from: DateOnly; to: DateOnly; }

export interface SeedResult { written: number; skipped: number; }

export type AdminReservation = ReservationDocument;
