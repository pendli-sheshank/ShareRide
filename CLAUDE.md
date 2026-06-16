# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SawaariShare — a cost-sharing carpool coordination app for Indian students in the US. The platform facilitates cost-sharing only (no payments, no commission). Cash is exchanged in person between riders and hosts.

## Tech Stack

- **Mobile app:** Kotlin Multiplatform (KMP), Android-first (Jetpack Compose), iOS planned
- **Backend:** Supabase (Postgres + PostGIS, Auth, Realtime, Edge Functions, Storage)
- **Admin panel:** Next.js on Vercel
- **Build/deploy:** Gradle (KMP) for mobile, Vercel for web, Supabase for backend

## Architecture

### Three execution boundaries

1. **Client (KMP/Android):** UI and optimistic updates. All CRUD via Supabase-kt client, guarded by Row Level Security. Never enforce business rules client-side only.
2. **Edge Functions (Supabase, trusted):** Cost cap enforcement (2× calculated per-rider cost), invite-code validation, matching queries, recurring trip materialization. These are the trust boundary — anything a user must not bypass lives here.
3. **Vercel:** Next.js admin panel + Vercel Cron jobs (recurring trip generation, chat purge).

### Data model key points

- `trip_offers` (host-created) and `ride_requests` (rider-created) are separate entities joined by `trip_matches`
- All `_geo` columns use PostGIS `geography` types with GiST indexes
- `recurring_rule` stored as RRULE strings; a scheduled job materializes trip instances 7 days ahead
- RLS policies on every table — plan policies before building features
- Auth managed by Supabase Auth (JWT + Magic Link email OTP)
- Chat built on Supabase Realtime, scoped to accepted matches, purged 30 days post-trip

### User model

Single account with two switchable modes (Rider / Host). Host mode requires vehicle details. Three verification tiers: Email-only → Vouched (invite) → ID-Verified (manual review).

## Module Layout

```
androidApp/          Android Jetpack Compose application
  src/main/
    kotlin/com/shareride/android/
      di/            Hilt dependency injection
      navigation/    Compose Navigation graph
      ui/
        auth/        Login screen + AuthViewModel
        trips/       Rides feed + TripsViewModel
        post/        Post trip screen
        chat/        Chat list screen
        profile/     Profile screen
    res/             Android resources

shared/              KMP shared business logic (no UI)
  src/
    commonMain/kotlin/com/shareride/
      model/         Serializable data classes
      repository/    AuthRepository, TripRepository
      SupabaseClientFactory.kt

admin/               Next.js admin panel (Vercel)
docs/                PRD and documentation
supabase/            DB migrations + Edge Functions
```

## Development

### Prerequisites

- JDK 21 (temurin recommended)
- Android Studio Ladybug or newer
- Gradle 8.11.1 (wrapper: run `gradle wrapper --gradle-version 8.11.1` on first clone)

### First-time setup

1. Add Supabase credentials to `local.properties` at the repo root:
   ```properties
   SUPABASE_URL=https://oqivckjpjtwishdnjumo.supabase.co
   SUPABASE_ANON_KEY=<your-anon-key>
   ```
2. Open the repo root in Android Studio → Gradle sync

### Common commands

```bash
# Build debug APK
./gradlew :androidApp:assembleDebug

# Build release APK
./gradlew :androidApp:assembleRelease

# Install on connected Android device
./gradlew :androidApp:installDebug

# Type check shared module
./gradlew :shared:compileKotlinAndroid

# Clean
./gradlew clean
```

## Key Constraints

- Cost contributions are capped at 2× the calculated per-rider cost, enforced server-side
- No language implying "income" or "earnings" anywhere in UI or code — use "cost recovery" framing
- Email is the only mandatory PII; home locations stored at neighborhood granularity
- Exact trip locations purged 30 days after trip completion
- In-app chat opens only after join request accepted; closes 24h after trip completion

## Auth Flow

Email magic link:
1. User enters email on `LoginScreen`
2. `AuthViewModel.sendMagicLink()` → `AuthRepository` → Supabase `gotrue.sendMagicLinkTo()`
3. User taps link in email → Android opens `com.shareride://auth#access_token=...&refresh_token=...`
4. `MainActivity.onNewIntent()` → `AuthViewModel.handleDeepLink()` → `setSession()`
5. `isLoggedIn` flips → `AppNavigation` navigates to Trips feed

Supabase redirect URL whitelist must include `com.shareride://auth`.

## Supabase Project

- URL: `https://oqivckjpjtwishdnjumo.supabase.co`
- Project ID: `oqivckjpjtwishdnjumo`

## Reference

- Full PRD: `docs/PRD-v1.1.md`
