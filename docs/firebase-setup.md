# Firebase setup

One Firebase project serves the app (web and, later, the store apps). Region: `asia-northeast1` for Firestore and Cloud Functions.

## Owner steps (Firebase console, owner's Google account)

1. Create the project. Analytics is not needed.
2. Upgrade to the Blaze plan (Cloud Functions require it) and set a budget alert.
3. Authentication → Sign-in method → enable Email/Password. Authentication → Settings → Authorized domains → add the web site's domain (`9vky4pjcfd-debug.github.io`).
4. Optional, for email: Extensions → install "Trigger Email from Firestore" with collection `mail` and the SMTP account that sends mail. The SMTP password is entered there by the owner and never stored in this repository.

## Deploy (Firebase CLI, signed in as the owner)

```powershell
npx firebase-tools login
npx firebase-tools use <project-id>
npx firebase-tools firestore:databases:create "(default)" --location asia-northeast1   # first time only
Set-Content functions/.env.<project-id> "OWNER_EMAILS=<owner email>"                    # not committed
npx firebase-tools deploy --only firestore,functions
npx firebase-tools apps:create web oarai-web                                          # first time only
npx firebase-tools apps:sdkconfig web                                                 # values for .env.production
```

`.env.production` holds only the public web config (`EXPO_PUBLIC_*`), `EXPO_PUBLIC_APP_ENV=production` and `EXPO_PUBLIC_BACKEND_MODE=firebase`; the GitHub Pages build picks it up. Service account keys, SMTP passwords and other secrets are never committed.

## First sign-in

1. Create an account in the app with an owner email and open the verification link.
2. Open `/account/admin` and choose "Set up as owner". This works only for addresses in `OWNER_EMAILS`.
3. Load the initial content (hotels, rooms, facilities, FAQ, notices, tiers), then set booking contacts and the app allotment and rates per hotel. Staff accounts are given access under Staff.

## Before the store release

- Restrict the web API key to the site domain and the app IDs (`jp.co.oaraihotel.guestapp`).
- Register App Check (reCAPTCHA Enterprise for web, Play Integrity, App Attest), then set the `ENFORCE_APP_CHECK` param to `true` and redeploy functions.
- Add Sign in with Apple if Google sign-in is offered on iOS.

`EXPO_PUBLIC_FIREBASE_EMULATOR_HOST` points a development build at local emulators; it is ignored in production.
