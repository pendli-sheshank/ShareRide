# Phase 5: Local Testing Guide

## Prerequisites

✅ Firebase credentials configured in `firebase_options.dart`  
✅ Google Play Services installed on Android device/emulator  
✅ Firebase Remote Config parameters published  

## Test Cases

### Test 1: Feature Flag Disabled (Default)

**Setup:**
1. Ensure all feature flag parameters in Firebase are set to `false`
2. Build and deploy app:
   ```bash
   cd flutter_app
   flutter clean
   flutter pub get
   flutter run
   ```

**Expected Behavior:**
- After login, navigate to each tab (Browse, My Rides, Post, Chat, Profile)
- Each screen should show **"Coming Soon"** placeholder with schedule icon
- No errors in console logs

**Verification:**
```bash
# Check logs for feature flag loading
flutter logs | grep -i "feature_flag\|remote_config"
```

### Test 2: Feature Flag Enabled (One Screen)

**Setup:**
1. In Firebase Console, set `use_flutter_browse_rides` to `true`
2. Set all other flags to `false`
3. Force refresh app:
   ```bash
   flutter run --restart
   ```

**Expected Behavior:**
- Browse Rides screen should load and display trip list
- Other tabs (My Rides, Post, Chat, Profile) should still show "Coming Soon"
- No crashes

**Verification:**
- [ ] Browse tab shows real trip data from Supabase
- [ ] Other tabs show placeholders
- [ ] Sentry/console shows no errors

### Test 3: All Screens Enabled

**Setup:**
1. In Firebase Console, set all flags to `true`:
   - `use_flutter_browse_rides` → true
   - `use_flutter_my_rides` → true
   - `use_flutter_post_ride` → true
   - `use_flutter_chat` → true
   - `use_flutter_profile` → true
2. Publish and force refresh

**Expected Behavior:**
- All 5 tabs load with real Flutter screens
- Switching between tabs works smoothly
- Supabase data loads correctly

**Verification Checklist:**
- [ ] Browse Rides: Shows trip list, can tap to view details
- [ ] My Rides: Shows posted offers and ride requests
- [ ] Post Ride: Form displays, can enter trip details
- [ ] Chat: Lists conversations, can tap to open chat
- [ ] Profile: Shows user info, can edit

### Test 4: Feature Flag Toggle (Runtime)

**Setup:**
1. Start app with `use_flutter_browse_rides` = `true`
2. Navigate to Browse tab (verify it loads)
3. In Firebase Console, **change to `false`** (publish immediately)
4. Return to app, pull down to refresh (if implemented)
5. Navigate away and back to Browse tab

**Expected Behavior:**
- After Firebase Remote Config refresh interval (typically 12 hours, but can be configured for testing)
- Browse screen should eventually switch to "Coming Soon"

**Note:** Firebase Remote Config caches for 12 hours by default. For testing, you can:
```dart
// In feature_flags_service.dart, temporarily set cache expiration to seconds:
remoteConfig.setConfigSettings(RemoteConfigSettings(
  fetchTimeout: Duration(seconds: 10),
  minimumFetchInterval: Duration(seconds: 0), // Force immediate refresh
));
```

### Test 5: Network Offline Behavior

**Setup:**
1. Enable all feature flags
2. Build app with network-aware code
3. Simulate offline:
   ```bash
   # On Android
   adb shell cmd connectivity airplane-mode enable
   ```

**Expected Behavior:**
- App should use cached feature flags from last fetch
- Screens should display based on cached state
- No crashes

**Verification:**
- [ ] App handles network loss gracefully
- [ ] Cached flags work when offline
- [ ] Sentry logs any network errors

### Test 6: Min App Version Check

**Setup:**
1. Set `min_app_version` to `"2.0.0"` in Firebase
2. Run app with version `"1.0.0"` (from `pubspec.yaml`)

**Expected Behavior:**
- On startup, check if app version >= min version
- If not, show upgrade prompt
- All features show "Coming Soon"

**Verification:**
```bash
# Check app version
grep "version:" flutter_app/pubspec.yaml
```

### Test 7: Crash Reporting Enabled

**Setup:**
1. Set `crash_reporting_enabled` to `true`
2. Implement intentional crash in Browse tab:
   ```dart
   // In browse_rides_screen.dart, add test button
   FloatingActionButton(
     onPressed: () => throw Exception("Test crash"),
     child: const Icon(Icons.bug_report),
   )
   ```

**Expected Behavior:**
- When button is tapped, app crashes
- Sentry automatically captures crash
- Crash appears in Sentry dashboard within 10 seconds

**Verification:**
- [ ] Log in to Sentry
- [ ] Check Dashboard → Issues
- [ ] Verify crash is listed with correct stack trace

### Test 8: Performance Monitoring Enabled

**Setup:**
1. Set `performance_monitoring_enabled` to `true`
2. Navigate through screens, observing load times

**Expected Behavior:**
- Performance metrics are tracked
- Screen load times are monitored
- Firebase Performance Monitoring dashboard shows data

**Verification:**
- [ ] Open Firebase Console → Performance
- [ ] Screen load times should appear
- [ ] Typical Browse Rides load: <2s on 4G, <5s on 3G

### Test 9: Deep Linking to Trip

**Setup:**
1. Enable `use_flutter_browse_rides`
2. Get a trip ID from Supabase
3. Use deep link: `shareride://trip/abc123`

**Test Method:**
```bash
# Android
adb shell am start -a android.intent.action.VIEW \
  -d "shareride://trip/abc123" \
  com.shareride.app

# iOS
xcrun simctl openurl booted "shareride://trip/abc123"
```

**Expected Behavior:**
- App opens and navigates directly to trip detail
- Trip data loads correctly
- Can join/interact with trip

### Test 10: Auth Session Persistence

**Setup:**
1. Log in with OTP
2. Verify logged-in state shows Flutter screens
3. Force kill app
4. Reopen app

**Expected Behavior:**
- Session is restored from secure storage
- User remains logged in
- Navigates directly to home (Browse tab)
- Feature flags are loaded on startup

## Automated Test Suite

Run Flutter widget/integration tests:

```bash
# Unit tests
flutter test

# Integration tests (requires running device/emulator)
flutter test integration_test/

# With coverage
flutter test --coverage
```

Expected coverage:
- Services: >80%
- Providers: >70%
- Models: >90%

## Performance Benchmarks

Target metrics:

| Screen | Cold Start | Warm Load | Memory (MB) |
|--------|-----------|-----------|------------|
| Browse Rides | <3s | <1s | <50 |
| My Rides | <3s | <1s | <40 |
| Post Ride | <2s | <500ms | <30 |
| Chat | <2s | <500ms | <35 |
| Profile | <2s | <500ms | <25 |

Measure with:
```bash
# Enable profiling
flutter run -v --profile 2>&1 | grep "Frame time"

# Memory usage
flutter pub global activate devtools
devtools
# Then open http://localhost:9100 and select Memory tab
```

## Rollout Checklist

Before proceeding to gradual user rollout:

- [ ] All 5 screens load correctly with feature flag enabled
- [ ] No crashes in Sentry over 24-hour test period
- [ ] Screen load times within benchmarks
- [ ] Deep linking works
- [ ] Auth session persists
- [ ] Offline mode handles gracefully
- [ ] Firebase Remote Config updates work (verify in console)
- [ ] Network conditions tested (4G, 3G, poor connectivity)
- [ ] Real device testing (Android 11+, iOS 15+)
- [ ] QA sign-off on feature parity with React Native

## Debugging Tips

### View Firebase Remote Config Values
```dart
// Add to main.dart or debug screen
final remoteConfig = FirebaseRemoteConfig.instance;
await remoteConfig.ensureInitialized();
print('Browse Rides: ${remoteConfig.getBool("use_flutter_browse_rides")}');
print('Chat: ${remoteConfig.getBool("use_flutter_chat")}');
// ... etc
```

### Force Clear Cache
```bash
# Clear app cache
adb shell pm clear com.shareride.app

# Clear Firebase Remote Config cache
# (In app, call: remoteConfig.setConfigSettings(RemoteConfigSettings(minimumFetchInterval: Duration.zero)))
```

### Verbose Logging
```bash
# Enable verbose Flutter logs
flutter run -v | grep -i "firebase\|remote\|flag"

# Enable Sentry debug
// In main.dart initialization
```

### Sentry Issues
- Check Sentry project is configured in `firebase_options.dart`
- Verify app has internet permission in `AndroidManifest.xml`
- For iOS, ensure privacy settings allow crash reporting
