# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ShareRide — a cost-sharing carpool coordination app for Indian students in the US. The platform facilitates cost-sharing only (no payments, no commission). Cash is exchanged in person between riders and hosts.

## Tech Stack

- **Mobile app:** Flutter (cross-platform), Android-first, iOS second
- **Backend:** Supabase (Postgres + PostGIS, Auth, Realtime, Edge Functions, Storage)
- **Admin panel:** Next.js on Vercel
- **Feature flags & monitoring:** Firebase Remote Config, Sentry
- **Build/deploy:** GitHub Actions (Flutter), Vercel (web), Supabase (backend), Firebase App Distribution (beta)

## Architecture

### Three execution boundaries

1. **Client (Flutter):** UI and optimistic updates via Riverpod. All CRUD goes through Supabase Dart client, guarded by Row Level Security. Never enforce business rules client-side only.
   - **Feature flags:** Firebase Remote Config controls which screens render Flutter vs "Coming Soon"
   - **State management:** Riverpod with code generation for type-safe async state
   - **Navigation:** Go Router with deep linking support (mirrors Expo Router patterns)

2. **Edge Functions (Supabase, trusted):** Cost cap enforcement (2× calculated per-rider cost), invite-code validation, matching queries, recurring trip materialization. These are the trust boundary — anything a user must not bypass lives here.

3. **Vercel:** Next.js admin panel + Vercel Cron jobs (recurring trip generation, chat purge).

### Data model key points

- `trip_offers` (host-created) and `ride_requests` (rider-created) are separate entities joined by `trip_matches`
- All `_geo` columns use PostGIS `geography` types with GiST indexes
- `recurring_rule` stored as RRULE strings; a scheduled job materializes trip instances 7 days ahead
- RLS policies on every table — plan policies before building features
- Phone auth managed by Supabase Auth (JWT + OTP)
- Chat built on Supabase Realtime, scoped to accepted matches, purged 30 days post-trip

### User model

Single account with two switchable modes (Rider / Host). Host mode requires vehicle details. Three verification tiers: Phone-only → Vouched (invite) → ID-Verified (manual review).

## Development

```bash
cd flutter_app
flutter pub get              # install dependencies
flutter run                  # run on default device/emulator
flutter run -d android       # run on Android emulator/device
flutter run -d ios           # run on iOS simulator (macOS only)
flutter analyze              # type check
flutter test                 # run tests
```

Environment setup: copy `flutter_app/.env.example` to `flutter_app/.env` and fill in your Supabase project URL, anon key, and Firebase credentials.

### Project structure

```
flutter_app/
├── lib/
│   ├── main.dart                    # app entry point, Firebase/Supabase init
│   ├── app/
│   │   ├── routes.dart              # Go Router with feature flag gating
│   │   ├── feature_flag_routes.dart # feature-flag-gated screen wrappers
│   │   ├── auth/                    # login, OTP verification screens
│   │   └── widgets/
│   │       └── app_shell.dart       # bottom tab navigation
│   ├── screens/
│   │   ├── tabs/                    # 5 main screens (Browse, MyRides, Post, Chat, Profile)
│   │   ├── trip/                    # trip detail screen
│   │   └── chat/                    # chat detail screen
│   ├── services/                    # business logic (Supabase, Auth, Chat, Trips, etc.)
│   ├── providers/                   # Riverpod state management
│   ├── models/                      # data models (TripOffer, RideRequest, etc.)
│   ├── constants/
│   │   └── theme.dart               # Material 3 theme, colors, spacing
│   └── utils/                       # helpers and utilities
├── firebase_options.dart            # Firebase platform configuration
├── pubspec.yaml                     # Flutter dependencies
└── .env                             # environment variables (Supabase, Firebase)
```

## Migration Status: React Native → Flutter

**Current:** Phase 5 (Gradual Rollout) — Infrastructure complete, ready for Firebase configuration and user testing

### Phases Completed

- **Phase 1 (Foundation & Auth):** ✅ Flutter project scaffold, Supabase integration, email OTP auth, session persistence
- **Phase 2 (Core Screens):** ✅ All 5 main tab screens (Browse Rides, My Rides, Post Ride, Chat, Profile) + trip/chat detail screens
- **Phase 3 (Supporting Features):** ✅ Ratings & reviews, push notifications, deep linking, no-show tracking, report modal
- **Phase 4 (Testing & Optimization):** ✅ Unit/widget/integration tests, performance audit, crash reporting with Sentry
- **Phase 5 (Gradual Rollout):** ✅ Feature flag routing system, Firebase Remote Config integration, comprehensive testing guides

### Gradual Rollout Strategy

Feature flags via Firebase Remote Config control which screens show Flutter vs "Coming Soon":
- **Week 1:** 10% of users see Flutter Browse Rides screen
- **Week 2:** 50% of users see Flutter (Browse + My Rides)
- **Week 3:** 100% of users see Flutter (all screens)

Each screen can be toggled independently. Instant abort via Remote Config if critical issues discovered.

### Key Infrastructure Files

- `flutter_app/lib/app/feature_flag_routes.dart` — Conditional screen rendering based on feature flags
- `flutter_app/lib/services/feature_flags_service.dart` — Firebase Remote Config wrapper
- `flutter_app/lib/services/monitoring_service.dart` — Sentry crash reporting
- `PHASE5_FIREBASE_SETUP.md` — Step-by-step Firebase credential configuration
- `PHASE5_LOCAL_TESTING.md` — 10 test cases with verification checklists
- `PHASE5_COMPLETION_SUMMARY.md` — Full architecture, rollout schedule, success criteria

### Next Steps

1. Obtain Firebase credentials (google-services.json, GoogleService-Info.plist)
2. Update `firebase_options.dart` with real project IDs and API keys
3. Enable Remote Config in Firebase Console and create 8 parameters
4. Run local tests to verify feature flags work
5. Deploy beta build to Firebase App Distribution
6. Begin gradual user rollout with monitoring on Sentry

## Key Constraints

- Cost contributions are capped at 2× the calculated per-rider cost, enforced server-side
- No language implying "income" or "earnings" anywhere in UI or code — use "cost recovery" framing
- Phone number is the only mandatory PII; home locations stored at neighborhood granularity, not exact addresses
- Exact trip locations purged 30 days after trip completion
- In-app chat opens only after join request accepted; closes 24h after trip completion

## Reference

- Full PRD: `docs/PRD-v1.1.md`
- **Migration Guides:**
  - `MIGRATION_STATUS.md` — Complete project overview and current status
  - `PHASE5_COMPLETION_SUMMARY.md` — Full architecture, rollout schedule, success criteria
  - `PHASE5_FIREBASE_SETUP.md` — Step-by-step Firebase credential configuration
  - `PHASE5_LOCAL_TESTING.md` — 10 test cases with verification checklists
  - `LOCAL_BUILD_GUIDE.md` — Step-by-step build instructions
  - `BUILD_FIXES_SUMMARY.md` — Detailed explanation of all build issues and fixes
  - `FLUTTER_BUILD_TROUBLESHOOTING.md` — Common issues and solutions guide
- **CI/CD Pipeline:** `.github/workflows/flutter-ci-cd.yml` (test, build, deploy automation)
- **Flutter Docs:** https://flutter.dev/docs
- **Riverpod:** https://riverpod.dev
- **Go Router:** https://pub.dev/packages/go_router
