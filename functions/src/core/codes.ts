import { randomInt } from 'node:crypto';

// No 0/O, 1/I, so codes read out over the phone are unambiguous.
const codeAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomCode(length: number): string {
  return Array.from({ length }, () => codeAlphabet[randomInt(codeAlphabet.length)]).join('');
}

/** Short code the guest gives at the front desk, e.g. `OG26-7KQ2MX`. */
export function confirmationCode(now: Date): string {
  return `OG${now.toISOString().slice(2, 4)}-${randomCode(6)}`;
}

/** Membership number from a sequence, e.g. `OG-2026-000123`. */
export function membershipNumber(sequence: number, now: Date): string {
  return `OG-${now.getUTCFullYear()}-${String(sequence).padStart(6, '0')}`;
}

export function noticeId(now: Date): string {
  return `n-${now.toISOString().slice(0, 10).replaceAll('-', '')}-${randomCode(5).toLowerCase()}`;
}
