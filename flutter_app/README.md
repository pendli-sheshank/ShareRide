# ShareRide Flutter App

Flutter mobile app for ShareRide - Cost-sharing carpool coordination for Indian students.

## Project Structure

```
lib/
├── main.dart                    # App entry point
├── app/
│   ├── routes.dart             # Go Router configuration
│   ├── auth/                   # Authentication screens
│   │   ├── login_screen.dart
│   │   ├── otp_verification_screen.dart
│   │   └── _layout.dart
│   ├── screens/                # Tab screens (Phase 2)
│   ├── widgets/
│   │   └── app_shell.dart      # Bottom tab navigation
├── services/
│   ├── supabase_service.dart   # Supabase queries
│   └── auth_service.dart       # Authentication logic
├── providers/
│   └── auth_provider.dart      # Riverpod state management
├── models/                      # Data models (Phase 2)
├── constants/
│   └── theme.dart              # App colors, spacing, typography
└── utils/                       # Helpers and utilities
```

## Setup Instructions

### Prerequisites
- Flutter 3.16+ ([install](https://flutter.dev/docs/get-started/install))
- Dart 3.0+
- Android Studio / Xcode
- Supabase project (see .env.example)
- Firebase project (for notifications)

### 1. Install Dependencies

```bash
cd flutter_app
flutter pub get
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Then update `.env` with your Supabase and Firebase credentials:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
FIREBASE_PROJECT_ID=your-firebase-project-id
```

### 3. Firebase Configuration

Run FlutterFire CLI to configure Firebase:

```bash
flutter pub global activate flutterfire_cli
flutterfire configure
```

This generates platform-specific Firebase configurations.

### 4. Code Generation

Generate code for Riverpod and JSON serialization:

```bash
flutter pub run build_runner build
```

### 5. Run the App

#### Android
```bash
flutter run -d <device-id>
# or
flutter run --device-id=emulator-5554
```

#### iOS
```bash
flutter run -d <device-id>
# or
flutter run --device-id=iPhone
```

#### Web (optional)
```bash
flutter run -d chrome
```

## Development Workflow

### Type Checking
```bash
flutter analyze
dart analyze
```

### Running Tests
```bash
# Unit tests
flutter test

# Integration tests
flutter test integration_test/
```

### Build Commands

#### Android
```bash
# Debug APK
flutter build apk --debug

# Release AAB (for Play Store)
flutter build appbundle --release
```

#### iOS
```bash
# Debug IPA
flutter build ios --debug

# Release IPA (for App Store)
flutter build ios --release
```

## Architecture

### State Management
- **Riverpod** - Reactive state management with code generation
- **Providers** - Dependency injection and async state
- **Notifiers** - Mutable state for actions (login, logout, etc.)

### Navigation
- **Go Router** - Type-safe routing with deep linking
- **File-based routes** - Similar to Expo Router

### Backend
- **Supabase** - PostgreSQL + RLS policies
- **Realtime** - WebSocket subscriptions for chat
- **Auth** - Email OTP via Supabase Auth

### Services
- **SupabaseService** - Queries and mutations
- **AuthService** - OTP flow and session management
- **NotificationsService** - Firebase messaging

## Project Status

**Current Phase:** Phase 5 (Gradual Rollout) — Feature flag infrastructure complete ✅

### Phases Completed

**Phase 1: Auth Foundation** ✅
- Email OTP authentication
- Session persistence (secure token storage)
- Auth state management with Riverpod
- Navigation guards (redirect to login if not authenticated)
- Tab navigation shell

**Phase 2: Core Screens** ✅
- Browse Rides (trip listings with filtering)
- My Rides / Requests (user's posted offers and ride requests)
- Post Ride (form to create new trips)
- Chat (real-time messaging via Supabase Realtime)
- Profile (user info, vehicle management, settings)
- Trip Detail Screen (full trip info with join action)
- Chat Detail Screen (real-time message thread)

**Phase 3: Supporting Features** ✅
- Ratings & Reviews (post-trip feedback)
- Push Notifications (Firebase Cloud Messaging)
- Trip Sharing via Link (deep linking)
- No-show Tracking (indicator on profiles)
- Report Modal (flag inappropriate behavior)
- UI Polish (Material 3 theme, dark mode support)

**Phase 4: Testing & Optimization** ✅
- Unit tests for services (query logic, data transformation)
- Widget tests for complex components
- Integration tests (end-to-end flows)
- Performance profiling and optimization
- Crash reporting setup (Firebase Crashlytics)

**Phase 5: Gradual Rollout** ✅ (Infrastructure Complete)
- Feature flag routing system (Firebase Remote Config)
- Conditional screen rendering (Flutter vs "Coming Soon")
- Comprehensive testing guides
- CI/CD pipeline fixes (Flutter action architecture mismatch resolved)
- Ready for Firebase configuration and user testing

## Phase 5: Gradual Rollout with Feature Flags

Each screen is controlled by a Firebase Remote Config feature flag, enabling gradual rollout without app updates:

### Feature Flags

| Flag | Default | Purpose |
|------|---------|---------|
| `use_flutter_browse_rides` | false | Enable/disable Browse Rides screen |
| `use_flutter_my_rides` | false | Enable/disable My Rides screen |
| `use_flutter_post_ride` | false | Enable/disable Post Ride screen |
| `use_flutter_chat` | false | Enable/disable Chat screen |
| `use_flutter_profile` | false | Enable/disable Profile screen |
| `flutter_rollout_percentage` | 0 | User rollout percentage (0-100) |
| `min_app_version` | "1.0.0" | Minimum app version required |
| `enable_crash_reporting` | true | Enable/disable Firebase crash reporting |
| `enable_performance_monitoring` | true | Enable/disable performance tracking |

### How It Works

1. **App Startup:** Firebase Remote Config is fetched and cached
2. **Screen Render:** Each tab checks its feature flag
3. **Conditional UI:**
   - **Flag = true:** Show Flutter screen with real data
   - **Flag = false:** Show "Coming Soon" placeholder
4. **Instant Abort:** Can disable any screen in Firebase Console without app update

### Rollout Schedule

- **Week 1:** Enable 1 screen to 10% of users, monitor for crashes
- **Week 2:** Enable more screens to 50% of users
- **Week 3:** Enable all screens to 100% of users
- **Week 4+:** Deprecate React Native version

### Setup Instructions

See `PHASE5_FIREBASE_SETUP.md` in project root for:
1. Create Firebase project
2. Obtain credentials (google-services.json, GoogleService-Info.plist)
3. Update `firebase_options.dart`
4. Enable Remote Config in Firebase Console
5. Create the 8 parameters above
6. Configure rollout targeting

### Local Testing

See `PHASE5_LOCAL_TESTING.md` for 10 detailed test cases:
1. Feature flag disabled (default)
2. Single screen enabled
3. All screens enabled
4. Runtime toggle simulation
5. Network offline behavior
6. Min app version check
7. Crash reporting verification
8. Performance monitoring
9. Deep linking
10. Auth session persistence

Each test includes setup, expected behavior, and verification checklist.

## Deployment

### Firebase App Distribution (Beta Testing)
```bash
firebase appdistribution:distribute build/app/outputs/bundle/release/app-release.aab
```

### Play Store
1. Build release AAB: `flutter build appbundle --release`
2. Upload to Google Play Console

### App Store
1. Build release IPA: `flutter build ios --release`
2. Upload via Xcode or Transporter

## Monitoring

### Crash Reporting (Firebase Crashlytics)
- Configured in `main.dart`
- All exceptions are captured and reported
- Dashboard: Firebase Console → Crashlytics

### Analytics (Firebase)
- Track user events and flows
- Monitor feature usage

## Troubleshooting

### iOS Build Fails
```bash
cd ios
rm -rf Pods
rm Podfile.lock
cd ..
flutter pub get
flutter run
```

### Android Build Fails
```bash
flutter clean
flutter pub get
flutter run
```

### Supabase Connection Issues
- Check `.env` file has correct URL and anon key
- Verify Supabase project is active
- Check network connectivity

### Firebase Configuration
- Ensure FlutterFire CLI was run: `flutterfire configure`
- Check `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)

## Contributing

- Follow Dart style guide: `dart format lib/`
- Run tests before committing: `flutter test`
- Keep commits atomic and well-documented

## Resources

- [Flutter Docs](https://flutter.dev/docs)
- [Riverpod Docs](https://riverpod.dev)
- [Supabase Docs](https://supabase.com/docs)
- [Go Router Docs](https://pub.dev/packages/go_router)

## CI/CD Pipeline

Automated builds, tests, and deployments via GitHub Actions (`.github/workflows/flutter-ci-cd.yml`):

### Jobs

| Job | Status | Purpose |
|-----|--------|---------|
| **test** | ✅ Fixed | Unit & widget tests with coverage reporting |
| **performance** | ✅ Fixed | Performance benchmarks |
| **build-android** | ✅ Fixed | Release APK build for testing |
| **build-ios** | ⚠️ Optional | Release IPA build (continue-on-error) |
| **deploy-beta** | ✅ Ready | Firebase App Distribution (beta testers) |
| **notify** | ✅ Ready | Build status notifications |

### Recent Fixes

- **Fixed:** Flutter action arm64 architecture mismatch
  - Added `architecture: x64` to all subosito/flutter-action steps
  - Resolved: "Unable to determine Flutter version for channel: stable architecture: arm64"
  - Now all builds use x64 Flutter SDK for ubuntu-latest and macos-latest runners

### Triggering Builds

Builds run automatically on:
- Push to `main` branch
- Push to `claude/kmp-vs-react-native-m51ceo` branch
- Pull requests to `main`

View build status and logs:
```
GitHub → Actions → flutter-ci-cd.yml → [run]
```

## Documentation

See project root for comprehensive guides:

- **PHASE5_COMPLETION_SUMMARY.md** — Full architecture, rollout schedule, success criteria
- **PHASE5_FIREBASE_SETUP.md** — Step-by-step Firebase configuration
- **PHASE5_LOCAL_TESTING.md** — 10 test cases with verification checklists
- **MIGRATION_STATUS.md** — Complete project overview and current status
- **LOCAL_BUILD_GUIDE.md** — Step-by-step build instructions
- **BUILD_FIXES_SUMMARY.md** — Detailed explanation of all build issues and fixes
- **FLUTTER_BUILD_TROUBLESHOOTING.md** — Common issues and solutions guide
