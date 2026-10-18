# Room booking

Guests book 1–5 rooms of one room type per reservation at any group hotel in three steps: hotel, dates and party → room type → review and contact details. Reservations are listed per user across the whole group (`Stay → My reservations`).

```text
features/booking/*            screens, calendar, formatting
  -> services.reservations    ReservationServiceImpl: validation, capacity filter, sorting, cancel rule
    -> ReservationRepository  Mock (demo) or Firebase
       -> Firestore `reservations` (owner read)
       -> Cloud Functions (availability, create, cancel)
```

## Rules (provisional)

Defined in `services/booking/booking-rules.ts` (`defaultBookingPolicy`) and enforced again by the server.

| Rule | Value |
|---|---|
| Rooms per booking | 1–5 of one room type; 6 or more by phone |
| Longest stay | 7 nights |
| Booking window | check-in up to 365 days ahead |
| Party | at least 1 adult per room; adults + children within `rooms × capacityMin`–`rooms × capacityMax`; infants at most one per adult |
| Price | per person per night: adults full, children 3–11 half, infants under 3 free (sharing a bed, not counted toward capacity) |
| Payment | pay at the hotel on arrival; no card data is collected or stored |
| Cancellation fee | 3 and 2 days before 30 %, the day before 50 %, on the day 100 %, no-show 100 %; earlier is free |
| In-app cancellation | only while free; once a fee applies the guest calls the hotel and settles the fee there |

Dates are hotel-local (`Asia/Tokyo`) `YYYY-MM-DD` strings. Prices are JPY, tax and service included, for the whole party.

## Mock mode

`MockReservationRepository` stands in for the booking server. Rates and stock in `repositories/mock/mock-booking.ts` are examples only: a per-hotel adult rate, +¥2,200 per step up the room list, Saturday nights +25 %, 3 rooms per type with some nights pre-filled. Bookings are saved on the device (AsyncStorage / browser storage), so the web demo keeps them per browser. The demo member from membership (`DEMO_MEMBER_ID`) is used while there is no sign-in.

## Firebase mode

Reads come from Firestore; commands go to callable Cloud Functions in `asia-northeast1`. The server takes the user from the auth token, never from the request.

| Callable | Request | Response | Server must |
|---|---|---|---|
| `bookingGetAvailability` | `StaySearch` | `{ rooms: RoomAvailability[] }` | read stock and rates from the hotel system of record |
| `bookingCreateReservation` | `BookingRequest` | `ReservationDocument` | re-validate, lock stock, re-quote; reject with `failed-precondition` and `details.reason` = `sold-out` or `price-changed`; write `reservations/{reservationId}` and an audit log |
| `bookingCancelReservation` | `{ reservationId }` | `ReservationDocument` | check owner and the cancellation deadline; release stock |

Both commands also queue email in the `mail` collection, which the Firebase "Trigger Email from Firestore" extension sends: a confirmation to `contact.email` in the member's language, and a Japanese notice to the hotel's reservation addresses so staff can enter the booking into 支配人くん. Hotel addresses live in the server-only `hotelBookingContacts/{hotelId}` (`emails: string[]`), set by managers in the app's hotel tools. Until the extension is installed, mail waits in the queue.

The functions live in `functions/src/booking.ts`. They require a verified email for booking, allow 10 upcoming reservations per member, and reuse `services/booking/booking-rules.ts`, which the build bundles into the server. `pointsAwardCompletedStays` runs daily at 06:00 Japan time: stays that checked out the day before become `completed` and earn points (1 per ¥100 × tier rate). Staff cancel a no-show before then.

## Stock and rates: 支配人くん

The hotels run 支配人くん, and an API for it is unlikely, so the app cannot read live stock. The plan is an **app allotment**:

1. Each hotel sets aside a number of rooms per room type per date for app sales, with the adult rate for that date, in a server-only collection `bookingInventory/{hotelId}__{roomId}__{date}` (`allotment`, `booked`, `adultRate`, `closed`). Staff maintain it in the app under Account → Hotel tools → 販売枠・料金 (`/account/admin/inventory`). A night with no allotment or no rate is not sold.
2. `bookingGetAvailability` returns `allotment − booked`; `bookingCreateReservation` increments `booked` in a transaction, so the app never sells more than its allotment.
3. The hotel notice email tells staff to enter the booking into 支配人くん and close those rooms there; cancellations work the other way.

If 支配人くん can export or import CSV, or connects to a site controller, the allotment can be synced instead of maintained by hand.
