# Firestore schema — version 1

All business collections include `hotelId` unless the document is globally scoped. Dates are stored as Firestore timestamps in persistence and mapped to ISO strings at the application boundary.

| Collection | Document ID recommendation | Purpose / access |
|---|---|---|
| `publicHotelContent` | `hotelId` | One document per group property (`content: HotelPublicProfile`, `published`). The app lists every published document ordered by `content.sortOrder`; public read |
| `rooms` | generated or stable room ID | Published room content; public read |
| `facilities` | generated or stable facility ID | Published facility content; public read |
| `faq` | stable FAQ ID | Published FAQ; public read |
| `notices` | stable notice ID | Announcements; `hotelId` is a property ID or `null` for group-wide news. Fields: `category` (`news`/`campaign`/`facility`/`important`), `priority`, `title`, `body`, `publishedAt`, optional `expiresAt` and `linkUrl`, `published`. The app hides notices before `publishedAt` and after `expiresAt`; public read |
| `users` | Firebase Auth UID | Account projection; owner read |
| `memberProfiles` | Firebase Auth UID | Group-wide membership profile (one per user, shared by every hotel); owner read |
| `membershipTiers` | tier ID (`blue`, `silver`, …) | Tier thresholds, earn rate and benefits; public read when `published` |
| `reservations` | reservation ID | One booked room, group-wide per user (`userId`, `hotelId`, `roomId`, dates, party, total, contact). Owner read; written only by booking Cloud Functions. See [booking.md](booking.md) |
| `bookingInventory` | `hotelId__roomId__date` | App allotment and adult rate per room type per night; server-only. See [booking.md](booking.md) |
| `hotelBookingContacts` | `hotelId` | Where booking notices are emailed; server-only |
| `mail` | generated | Outgoing email queue read by the Trigger Email extension (`to`, `message.subject`, `message.text`); server-only |
| `staffMembers` | Firebase Auth UID | Roster of staff roles and hotels, mirroring their Custom Claims (`role`, `hotels`); server-only |
| `counters` | `membership` | Next membership number; server-only |
| `restaurantPublicStatus` | `hotelId__restaurantId` | Aggregated public summary only |
| `restaurantQueue` | queue entry ID | Server-only internal queue |
| `bathPublicStatus` | `hotelId__bathId` | Aggregated public summary only |
| `pointAccounts` | Firebase Auth UID | Group-wide balance, qualifying points and tier; owner read, server writes |
| `pointTransactions` | transaction ID | Immutable audit ledger; owner read, server writes |
| `coupons` | coupon ID | Active coupon definition; public read |
| `couponRedemptions` | redemption ID | Owner read, server transaction writes |
| `deviceTokens` | generated token registration ID | Server-only token registration lifecycle |
| `appConfig` | `public` or server-only IDs | Minimum version and maintenance settings |
| `auditLogs` | generated audit ID | Server-only immutable audit records |

## Security-critical fields

Reservations retain `reservationId`, `userId`, `hotelId`, `roomId`, `confirmationCode`, `externalReservationId`, `status`, `checkIn` / `checkOut` (hotel-local `YYYY-MM-DD`), `rooms`, `adults`, `children`, `infants`, `guestCount`, `totalAmount`, `currency`, `paymentMethod`, `contact` (lead guest name, phone, email), `notes`, `cancelledAt`, `createdAt` and `updatedAt`. Card numbers, CVV and complete payment data must never be stored.

Point transactions retain `transactionId`, `basePoints` (earn entries only; sums to the tier's qualifying points), `userId`, `hotelId` (the property where points were earned or used; `null` for group-wide adjustments), `type`, `amount`, `balanceBefore`, `balanceAfter`, `source`, `referenceId`, `description` and `createdAt`. Balance and ledger changes must occur in one server transaction and produce an audit log.

## Group membership and points

Points and tiers are shared by every property: a member has one `memberProfiles/{uid}` and one `pointAccounts/{uid}`, and points earned at any hotel can be used at any other. Rules live in `features/member/membership-rules.ts` so the server can apply the same logic:

- Earn: 1 base point per ¥100 spent (`YEN_PER_BASE_POINT`), multiplied by the member's tier `earnRate` for the balance.
- Tier: decided by `qualifyingPoints`, the base points (before the tier bonus) earned in the rolling 12 months, against each tier's `qualifyingPoints` threshold. The server re-evaluates it after every earn and stores `tierId` / `tierEvaluatedAt`.
- The thresholds, rates and benefits are data in `membershipTiers`; the demo values in `repositories/mock/mock-membership.ts` are provisional until the group confirms them.

`restaurantPublicStatus` exposes only `restaurantId`, `restaurantName`, `status`, `waitingGroups`, `estimatedWaitMinutes` and `updatedAt`. Guest name, room, phone, table assignment, staff notes and the full queue remain server-only.

## Adding a property

The group currently has `oarai-hotel`, `omoide-romankan`, `doggys-coast-oarai` and `gyoraian`. A new property needs no app release: add a `publicHotelContent/{hotelId}` document with `published: true`, then add its `rooms` (and optionally `facilities`, `faq`, `notices`) with the same `hotelId`. In mock mode the same data lives in `repositories/mock/mock-group-hotels.ts`.
