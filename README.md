# 大洗グループ App

大洗グループ（大洗ホテル・思い出浪漫館・ドギーズコースト 大洗・魚来庵）の iOS / Android 共用アプリ。React Native、Expo、TypeScript、Expo Router を使用し、Firebase へ安全に接続できる Service / Repository 境界を備えています。

Firebase モードでは会員登録・ログイン（メール認証）、グループ共通の会員ランクとポイント、アプリ予約（Cloud Functions）、お知らせ、館スタッフ用の管理画面（販売枠・料金、お知らせ、予約一覧、通知メール先、スタッフ権限）が動きます。レストラン待ち・決済・Push 配信・AI は未接続です。

## Setup

```powershell
npm install
Copy-Item .env.example .env.local
npm start
```

初期値は `development` + `mock` なので Firebase 未設定でも起動します。Staging / production で Mock mode は使用できません。

Firebase を使用するときは、実際のプロジェクトを作成した後で `.env.local` に Firebase Client Config を設定し、`EXPO_PUBLIC_BACKEND_MODE=firebase` に変更します。`EXPO_PUBLIC_*` はアプリへ埋め込まれる公開値です。Service Account、Private Key、Admin SDK Credential、Server Secret は絶対に保存しないでください。

## Architecture

```text
UI
  -> Service
    -> Repository / Server Gateway
      -> Firebase Client SDK / Cloud Functions / Server API
```

Feature component から Firebase SDK、Firestore `collection()` / `doc()` を直接利用しません。公開読み取り、本人データ読み取り、server-only command の境界は [backend-architecture.md](docs/backend-architecture.md) に記載しています。

## Verification

```powershell
npm run typecheck
npm run lint
npm test
npm run test:rules
npm run test:backend   # Cloud Functions end to end on the Auth / Firestore / Functions emulators
npm run doctor
npx expo export --platform all
```

`test:rules` は一時的な ASCII パスから Firestore Emulator を起動します。これは Windows の Unicode パスに対する Emulator の制約を回避するためで、ルール内容は `firebase/firestore.rules` と同一です。

## Documentation

- [Backend architecture](docs/backend-architecture.md)
- [Room booking](docs/booking.md)
- [Firestore schema](docs/firestore-schema.md)
- [Firestore security](docs/firestore-security.md)
- [Backend security](docs/backend-security.md)
- [Privacy data map](docs/privacy-data-map.md)
- [Firestore cost strategy](docs/firestore-cost-strategy.md)
- [Firebase setup](docs/firebase-setup.md)
- [Phase 1 PWA audit](docs/phase-1-pwa-audit.md)
