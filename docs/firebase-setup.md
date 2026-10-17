# Firebase setup

No Firebase project was created and no Project ID was invented in Phase 2. The owner must create three separate projects corresponding to:

- development (`oarai-development` naming target)
- staging (`oarai-staging` naming target)
- production (`oarai-production` naming target)

Actual availability determines the final project IDs.

## Manual setup checklist

1. Create the three Firebase projects and register the iOS bundle ID and Android package from `app.json`.
2. Copy `.env.example` to an untracked environment-specific local file and add each project's Firebase Client Config.
3. Set `EXPO_PUBLIC_BACKEND_MODE=firebase` only after all client fields are present.
4. Enable selected Auth providers only when Email, Apple and Google credentials are approved. Configure Sign in with Apple when another third-party sign-in is offered on iOS.
5. Deploy indexes and default-deny rules to development; run emulator and integration tests before promotion.
6. Configure App Check: Play Integrity for Android and App Attest with DeviceCheck fallback for iOS.
7. For local development builds, generate the platform debug token at runtime and register it in the Firebase console. Never commit a debug token and never enable debug providers in production.
8. Configure server credentials only in Cloud Functions / server secret management.

The current App Check code is an integration point, not real attestation. Native App Check requires Expo development builds, platform registration and real Firebase projects. Production enforcement must be enabled only after valid clients are deployed, but must never be disabled merely for development convenience.
