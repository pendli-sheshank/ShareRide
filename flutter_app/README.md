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
SENTRY_DSN=https://your-sentry-dsn
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

## Features (Phase 1: Auth Foundation)

- ✅ Email OTP authentication
- ✅ Session persistence (secure token storage)
- ✅ Auth state management with Riverpod
- ✅ Navigation guards (redirect to login if not authenticated)
- ✅ Tab navigation shell

## Upcoming (Phase 2: Core Screens)

- Browse Rides
- My Rides / Requests
- Post Ride
- Chat (real-time messaging)
- Profile
- Ratings & Reviews

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

### Crash Reporting (Sentry)
- Configured in `main.dart`
- All exceptions are captured and reported
- Dashboard: [https://sentry.io](https://sentry.io)

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

## Migration Status

See `/root/.claude/plans/status.json` for current phase and progress.
