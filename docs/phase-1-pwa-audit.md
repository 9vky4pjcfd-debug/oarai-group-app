# Phase 1 — Existing PWA audit

調査対象は隣接する `oarai-app` プロジェクトです。旧 PWA は参照専用とし、ファイルの変更・削除は行っていません。

## Existing structure

- Main app: `oarai-app/dist/index.html`
- JavaScript: `oarai-app/dist/app.js`
- Styles: `oarai-app/dist/styles.css`, `official-theme.css`, `language.css`
- Assets: official logo, hero, room, facility, floor-map and app icon images
- PWA: `manifest.webmanifest`, `sw.js`
- i18n: `i18n.js` with Japanese, Traditional Chinese and English; Japanese is the default

## Existing pages and behavior

- Home
- Rooms and room selection
- Booking form and demo confirmation
- Facilities and floor map
- Crowd status for the public bath and Dining Room Hinode
- Points
- Contact and Q&A
- Hash-based SPA navigation
- Default booking dates and client-side validation
- Local-storage demo points
- Demo crowd refresh
- PWA installation and service-worker registration
- WebMCP demo tools for starting reservations and reading crowd status

## Integration findings

- No Firebase configuration or Firebase SDK usage was found.
- No real reservation API was found.
- No real restaurant system connection was found; waiting-party and crowd values are demo data.
- No external data request through `fetch` or Axios was found.

## Migrated in Phase 1

- Brand colors, spacing character, rounded cards, buttons and header direction
- Official logo and selected hero, room, facility and floor-map images
- Information architecture and five-tab mobile navigation
- Static room and facility content models
- Japanese / Traditional Chinese / English language structure
- Crowd-status, member, support and settings screen skeletons

## Requires native reimplementation or a later phase

- DOM and hash navigation -> Expo Router (reimplemented in Phase 1)
- Browser localStorage -> native persistence / backend state
- Service worker and PWA install flow -> native release and update flow
- Browser forms and WebMCP tools -> native UI and service layer
- Real reservation, restaurant crowd, bath crowd, member, points and notification integrations
- Firebase authentication, Firestore / API / Cloud Functions, push notifications and AI support
