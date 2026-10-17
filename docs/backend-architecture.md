# Backend architecture

## Runtime flow

```text
Screen / feature
  -> Service contract
    -> Repository contract or server gateway
      -> Firebase Client SDK (safe reads/auth) or Cloud Functions / server API
        -> Firestore and external hotel systems
```

Feature components must not import Firebase Auth, Firestore, `collection()` or `doc()`. Firebase imports are restricted to `services/firebase` and `repositories/firebase`.

## Trust boundary

| Operation | Boundary |
|---|---|
| Published hotel, room, facility and FAQ content | Client read through repository |
| Restaurant and bath public summary | Client read through repository |
| User-owned reservation, member and point views | Authenticated client read, owner only |
| Create, modify or cancel reservation | Server / Cloud Functions |
| Join, cancel or change restaurant queue | Server / Cloud Functions |
| Verify member QR | Server / Cloud Functions |
| Earn, redeem, expire or adjust points | Server transaction only |
| Coupon redemption | Server transaction only |
| Push sending and administration | Server only |
| Role assignment and system configuration | Trusted server only |

Client code never accepts a caller-supplied role as authorization. `staff`, `manager` and `admin` must come from verified Custom Claims and server authorization.

## Environment and dependency selection

Development defaults to Mock repositories. Firebase repositories are selected only when `EXPO_PUBLIC_BACKEND_MODE=firebase` and all Firebase Client Config fields are present. Staging and production reject Mock mode. Firebase project identifiers are intentionally absent until the owner creates the projects.
