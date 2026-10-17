# Firestore schema — version 1

All business collections include `hotelId` unless the document is globally scoped. Dates are stored as Firestore timestamps in persistence and mapped to ISO strings at the application boundary.

| Collection | Document ID recommendation | Purpose / access |
|---|---|---|
| `publicHotelContent` | `hotelId` | One document per group property (`content: HotelPublicProfile`, `published`). The app lists every published document ordered by `content.sortOrder`; public read |
| `rooms` | generated or stable room ID | Published room content; public read |
| `facilities` | generated or stable facility ID | Published facility content; public read |
| `faq` | stable FAQ ID | Published FAQ; public read |
| `users` | Firebase Auth UID | Account projection; owner read |
| `memberProfiles` | scoped/composite ID | Hotel membership profile; owner read |
| `reservations` | reservation ID | Owner read; server writes |
| `restaurantPublicStatus` | `hotelId__restaurantId` | Aggregated public summary only |
| `restaurantQueue` | queue entry ID | Server-only internal queue |
| `bathPublicStatus` | `hotelId__bathId` | Aggregated public summary only |
| `pointAccounts` | scoped/composite ID | Per-hotel balance; owner read, server writes |
| `pointTransactions` | transaction ID | Immutable audit ledger; owner read, server writes |
| `coupons` | coupon ID | Active coupon definition; public read |
| `couponRedemptions` | redemption ID | Owner read, server transaction writes |
| `deviceTokens` | generated token registration ID | Server-only token registration lifecycle |
| `appConfig` | `public` or server-only IDs | Minimum version and maintenance settings |
| `auditLogs` | generated audit ID | Server-only immutable audit records |

## Security-critical fields

Reservations retain `reservationId`, `userId`, `hotelId`, `externalReservationId`, `status`, `checkIn`, `checkOut`, `guestCount`, `createdAt` and `updatedAt`. Card numbers, CVV and complete payment data must never be stored.

Point transactions retain `transactionId`, `userId`, `hotelId`, `type`, `amount`, `balanceBefore`, `balanceAfter`, `source`, `referenceId` and `createdAt`. Balance and ledger changes must occur in one server transaction and produce an audit log.

`restaurantPublicStatus` exposes only `restaurantId`, `restaurantName`, `status`, `waitingGroups`, `estimatedWaitMinutes` and `updatedAt`. Guest name, room, phone, table assignment, staff notes and the full queue remain server-only.

## Adding a property

The group currently has `oarai-hotel`, `omoide-romankan`, `doggys-coast-oarai` and `gyoraian`. A new property needs no app release: add a `publicHotelContent/{hotelId}` document with `published: true`, then add its `rooms` (and optionally `facilities`, `faq`, `notices`) with the same `hotelId`. In mock mode the same data lives in `repositories/mock/mock-group-hotels.ts`.
