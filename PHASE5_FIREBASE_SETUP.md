# Phase 5: Firebase Configuration Guide

## Overview

Phase 5 enables gradual Flutter rollout using Firebase Remote Config for feature flags. This guide walks through obtaining Firebase credentials and configuring them.

## Step 1: Create/Obtain Firebase Project

### Option A: Create New Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Create a project**
3. Enter project name: `ShareRide`
4. Accept/configure billing settings (Remote Config is free tier)
5. Create project

### Option B: Use Existing Project
If ShareRide already has a Firebase project (e.g., for existing notifications), you can reuse it.

## Step 2: Get Firebase Credentials

### For Android:
1. In Firebase Console, go to **Project Settings** (gear icon)
2. Click **Android** tab
3. Register app with package name: `com.shareride.app`
4. Download `google-services.json`
5. Place at: `flutter_app/android/app/google-services.json`

### For iOS:
1. In Firebase Console, click **iOS** tab
2. Register app with bundle ID: `com.shareride.app`
3. Download `GoogleService-Info.plist`
4. Place at: `flutter_app/ios/Runner/GoogleService-Info.plist`

### For Web/API Access:
1. In Firebase Console, go to **Project Settings**
2. Copy these values:

```
apiKey:             [Web API Key]
appId:              [Web App ID]
messagingSenderId:  [Sender ID]
projectId:          [Project ID]
authDomain:         [Project ID].firebaseapp.com
databaseURL:        https://[Project ID].firebaseio.com
storageBucket:      [Project ID].appspot.com
measurementId:      [Analytics ID - optional]
```

## Step 3: Update firebase_options.dart

Replace the placeholder values in `flutter_app/lib/firebase_options.dart`:

```dart
static const FirebaseOptions android = FirebaseOptions(
  apiKey: 'AIzaSy...YOUR_ACTUAL_KEY...',           // from google-services.json
  appId: '1:123456789012:android:...',             // from google-services.json
  messagingSenderId: '123456789012',               // from google-services.json
  projectId: 'shareride-project-real-id',          // your real project ID
  databaseURL: 'https://shareride-project-real-id.firebaseio.com',
  storageBucket: 'shareride-project-real-id.appspot.com',
);

static const FirebaseOptions ios = FirebaseOptions(
  apiKey: 'AIzaSy...YOUR_ACTUAL_KEY...',           // from GoogleService-Info.plist
  appId: '1:123456789012:ios:...',                 // from GoogleService-Info.plist
  messagingSenderId: '123456789012',               // from GoogleService-Info.plist
  projectId: 'shareride-project-real-id',          // your real project ID
  databaseURL: 'https://shareride-project-real-id.firebaseio.com',
  storageBucket: 'shareride-project-real-id.appspot.com',
  iosBundleId: 'com.shareride.app',
);
```

## Step 4: Enable Firebase Services

In Firebase Console:
1. **Messaging** (already enabled for push notifications)
2. **Remote Config** (required for feature flags)
   - Click **Remote Config** in left menu
   - Click **Create Configuration**
   - This initializes Remote Config for the project

3. **Crashlytics** (optional, for Sentry-based crash reporting)
   - Click **Crashlytics** in left menu

## Step 5: Configure Remote Config Parameters

Once Remote Config is enabled, create these parameters in Firebase Console:

### Browse Rides Flag
- **Parameter Key:** `use_flutter_browse_rides`
- **Type:** Boolean
- **Default Value:** `false`
- **Description:** Enable Flutter Browse Rides screen for gradual rollout

### My Rides Flag
- **Parameter Key:** `use_flutter_my_rides`
- **Type:** Boolean
- **Default Value:** `false`

### Post Ride Flag
- **Parameter Key:** `use_flutter_post_ride`
- **Type:** Boolean
- **Default Value:** `false`

### Chat Flag
- **Parameter Key:** `use_flutter_chat`
- **Type:** Boolean
- **Default Value:** `false`

### Profile Flag
- **Parameter Key:** `use_flutter_profile`
- **Type:** Boolean
- **Default Value:** `false`

### Flutter Rollout Percentage
- **Parameter Key:** `flutter_rollout_percentage`
- **Type:** Number
- **Default Value:** `0`
- **Description:** 0-100, percentage of users to enable Flutter for (not yet used, for future user-targeting)

### Min App Version
- **Parameter Key:** `min_app_version`
- **Type:** String
- **Default Value:** `"1.0.0"`
- **Description:** Minimum app version required to use Flutter

### Crash Reporting Enabled
- **Parameter Key:** `crash_reporting_enabled`
- **Type:** Boolean
- **Default Value:** `true`

### Performance Monitoring Enabled
- **Parameter Key:** `performance_monitoring_enabled`
- **Type:** Boolean
- **Default Value:** `true`

## Step 6: Create Rollout Schedule

For gradual rollout, create **Targeting** conditions in Remote Config:

### Week 1: 10% Rollout
1. In Firebase Console, go to Remote Config
2. Click on `use_flutter_browse_rides` parameter
3. Click **Add Targeting** under "Conditions"
4. Set condition: `Custom attribute` → `rollout_group` → matches regex → `^0|1$`
5. Set value: `true`
6. Set **Rollout %**: 10% (affects which users see this condition)
7. Click **Publish**

### Week 2: 50% Rollout
- Edit condition from Week 1, change to 50%

### Week 3: 100% Rollout
- Edit condition from Week 1, change to 100%

## Step 7: Test Locally

1. Update `firebase_options.dart` with real credentials
2. Ensure Firebase app distribution is configured:
   ```bash
   cd flutter_app
   flutter pub get
   flutter run
   ```
3. The app should now:
   - Load feature flags from Firebase Remote Config on startup
   - Show "Coming Soon" screens for disabled features
   - Show Flutter screens for enabled features

## Step 8: Monitor Rollout

Once deployed:

1. **Firebase Console:**
   - Go to **Analytics** → **Real-time** to see active users
   - Go to **Remote Config** to verify parameter values are being used

2. **Crash Reporting (Sentry):**
   - Monitor [Sentry Dashboard](https://sentry.io) for crashes
   - Set alerting threshold if crashes spike above baseline

3. **Performance:**
   - Monitor app startup time and screen load times
   - Use Firebase Performance Monitoring or APM tools

## Troubleshooting

### Remote Config not updating
- Ensure app has internet connection
- Check Firebase Console for publishing status
- Verify `projectId` matches in `firebase_options.dart`

### Feature flags always return false
- Check that parameters are published in Firebase Console
- Clear app cache: Settings → Apps → ShareRide → Storage → Clear Cache
- Restart app

### Crashes on init
- Verify `google-services.json` is at correct path
- Check `Firebase Core` version in `pubspec.yaml` matches docs
- Run: `flutter clean && flutter pub get`

## Rollout Abort Procedure

If issues arise during rollout:

1. In Firebase Console, go to Remote Config
2. Edit the feature flag parameter (e.g., `use_flutter_browse_rides`)
3. Set value back to `false`
4. Click **Publish**
5. Users will see "Coming Soon" screen within seconds
6. Investigate root cause before re-enabling

## Next Steps

Once Firebase is configured:
1. Run local tests with feature flags enabled
2. Deploy beta build to Firebase App Distribution
3. Test with internal team (10 users)
4. Monitor crashes for 1-2 days
5. If stable, roll out to 10% of users via Remote Config
6. Monitor for 1 week, then increase percentage
