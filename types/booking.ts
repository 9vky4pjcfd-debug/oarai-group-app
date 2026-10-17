import type { Room } from './public-content';

/** A calendar date at the hotel (Asia/Tokyo), formatted YYYY-MM-DD. */
export type DateOnly = string;

export interface StaySearch {
  hotelId: string;
  checkIn: DateOnly;
  checkOut: DateOnly;
  adults: number;
  /** Children charged at the child rate (see `BookingPolicy.childAge`). */
  children: number;
  /** Infants who stay free and do not take a bed; they do not count toward room capacity. */
  infants: number;
  /** Rooms of the same type in this booking. */
  rooms: number;
}

export interface NightlyRate { date: DateOnly; amount: number; }

/** Availability and price for one room type over a whole stay, as quoted by the booking backend. */
export interface RoomAvailability {
  hotelId: string;
  roomId: string;
  /** Rooms of this type still free on every night of the stay. */
  remaining: number;
  /** Price per night for the whole party across all rooms; empty when not enough rooms are free. */
  nightly: NightlyRate[];
  totalAmount: number;
  currency: 'JPY';
}

export interface RoomOffer extends RoomAvailability { room: Room; }

export interface GuestContact { name: string; phone: string; email: string; }

export interface BookingRequest extends StaySearch {
  roomId: string;
  contact: GuestContact;
  notes: string;
  /** The total the guest saw; the backend rejects the booking if its own quote differs. */
  quotedTotal: number;
}

export type PaymentMethod = 'pay-at-hotel';

/** Share of the stay total charged when the guest cancels this many days (or fewer) before check-in. */
export interface CancellationFeeTier { daysBefore: number; rate: number; }

/** Booking rules shown to the guest and enforced again by the backend. */
export interface BookingPolicy {
  /** Fee tiers, any order. Cancelling earlier than the largest `daysBefore` is free. */
  cancellationFees: CancellationFeeTier[];
  /** Charged when the guest does not arrive and did not contact the hotel. */
  noShowRate: number;
  maxNights: number;
  /** How far ahead check-in can be, in days from today. */
  bookingWindowDays: number;
  /** Most rooms one booking can hold in the app; larger groups call the hotel. */
  maxRoomsOnline: number;
  /** Children from `min` up to (not including) `max` years old pay the child rate; younger ones are infants. */
  childAge: { min: number; max: number };
  /** Child rate as a share of the adult rate. */
  childRate: number;
  paymentMethod: PaymentMethod;
}
