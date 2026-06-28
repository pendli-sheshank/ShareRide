# Phase 5: Flutter Launch & Cutover Guide

**Status:** Ready for Pre-Release QA  
**Timeline:** Week of [deployment date]  
**Approach:** Direct cutover (hard migration, all users)

---

## 1. Pre-Launch QA Checklist

### 1.1 Core Features (Real Devices Required)

**Authentication Flow**
- [ ] Email OTP login works on Android
- [ ] Email OTP login works on iOS
- [ ] OTP verification accepts valid code
- [ ] OTP verification rejects invalid code
- [ ] Logout clears session and returns to login screen
- [ ] App login persists after force-quit and restart
- [ ] Token refresh works silently (no login prompt during active use)

**Browse Rides Screen**
- [ ] Trip list loads within 3 seconds on 4G
- [ ] Trip cards display correct: origin, destination, cost, departure time
- [ ] Pagination loads next trips when scrolled to bottom
- [ ] Filtering by cost range works
- [ ] Filtering by departure date works
- [ ] Trip card tap opens trip detail screen
- [ ] Pull-to-refresh reloads trip list

**My Rides Screen**
- [ ] Posted offers display correctly
- [ ] Ride requests display correctly
- [ ] Matched riders/drivers show in each offer/request
- [ ] Cancel offer action works
- [ ] Edit offer opens form with pre-filled data

**Post Ride Screen**
- [ ] Form loads without errors
- [ ] Origin/destination location input works
- [ ] Departure time picker works
- [ ] Recurring rule selection works (daily, weekly, etc.)
- [ ] Cost calculation updates correctly when entered
- [ ] Seat availability input accepts 1-6
- [ ] Women-only toggle works
- [ ] Submit creates trip in Supabase
- [ ] Form validation shows errors for invalid input
- [ ] Cost cap (2× calculated per-rider cost) enforced server-side

**Chat Screen**
- [ ] Chat list loads with active conversations
- [ ] Chat list updates in real-time when new message arrives
- [ ] Tap conversation opens chat detail screen
- [ ] No error when chat list is empty

**Chat Detail Screen**
- [ ] Messages load with newest at bottom
- [ ] Send message appears immediately on sender's device
- [ ] Sent message appears on other user's device within 2 seconds
- [ ] Message text displays correctly (no truncation)
- [ ] Timestamps show correctly
- [ ] Long conversation scrolls smoothly
- [ ] Send button disabled until text entered

**Profile Screen**
- [ ] User avatar/initials display
- [ ] User name displays
- [ ] Average rating displays correctly
- [ ] Verification tier badge shows (Phone / Vouched / ID-Verified)
- [ ] Edit profile button works
- [ ] Vehicle management shows vehicles
- [ ] Add vehicle form works
- [ ] Settings/logout button works
- [ ] Logout clears all data and returns to login

**Trip Detail Screen**
- [ ] Trip info displays: origin, destination, cost, departure time, host info
- [ ] Host avatar and name clickable (future: profile view)
- [ ] Trip status shows correctly (active, completed, cancelled)
- [ ] "Join Ride" button visible and clickable
- [ ] Join request sends successfully
- [ ] Matched riders list shows after accepting join
- [ ] Trip share link can be copied

**Trip Sharing**
- [ ] Deep link `shareride://trip/[id]` opens trip detail
- [ ] Deep link `shareride://trip/share/[token]` opens shared trip
- [ ] Share link works from outside app (email, SMS, browser)

**Ratings & Reviews**
- [ ] After completed trip, rating modal appears
- [ ] 1-5 star rating works
- [ ] Optional review text input accepts text
- [ ] Submit saves rating to Supabase
- [ ] User's average rating updates after submission

### 1.2 Performance & Stability

**Launch & Startup**
- [ ] Cold start (force-quit) < 3 seconds on 4G
- [ ] Warm start < 1 second
- [ ] App doesn't crash on launch
- [ ] App doesn't show white screen or freeze during init

**Memory & CPU**
- [ ] App memory usage stable < 100MB on Android
- [ ] App memory usage stable < 150MB on iOS
- [ ] No memory leaks during 10-minute use session
- [ ] CPU usage normal (not >50% at rest)

**Network Conditions**
- [ ] Works on 4G LTE
- [ ] Works on 3G (slower but functional)
- [ ] Graceful handling of network dropout (no crash, can retry)
- [ ] Offline mode shows cached data where applicable
- [ ] Reconnect after offline resumes normal operation

**Screen Performance**
- [ ] Browse rides screen scrolls smoothly (60 FPS)
- [ ] Chat list scrolls smoothly
- [ ] Chat messages scroll smoothly
- [ ] No jank when switching tabs

### 1.3 Push Notifications

**Setup & Registration**
- [ ] App requests notification permission on first launch
- [ ] User can grant/deny permission
- [ ] Device token registered in Supabase `users.push_token`

**Notification Delivery**
- [ ] Ride match notification arrives within 5 seconds
- [ ] New message notification arrives within 5 seconds
- [ ] Notification title/body display correctly
- [ ] Tapping notification opens correct screen (match → trip, message → chat)

**Permissions**
- [ ] App works fine even if user denies notification permission

### 1.4 Data Integrity

**Auth Token Handling**
- [ ] Token persists in secure storage after login
- [ ] Token cleared from storage on logout
- [ ] Token refreshes automatically (JWT expiry handled)
- [ ] User can't access protected screens without valid token

**Supabase RLS**
- [ ] Can't view other users' private data (trips, chats, ratings)
- [ ] Can only edit own profile/trips
- [ ] Can't delete other users' content
- [ ] Can't bypass cost cap via client-side manipulation (enforced server-side)

**Offline Data**
- [ ] Cached trip list displays when offline
- [ ] Cached chat messages display when offline
- [ ] Cached user profile displays when offline
- [ ] Actions queued/retried when connection restored

### 1.5 Edge Cases

**Auth Edge Cases**
- [ ] Multiple login attempts on same device works
- [ ] Rapid OTP verification attempts handled
- [ ] OTP expires after 10 minutes (or per Supabase config)
- [ ] Session refresh during network transition works

**UI Edge Cases**
- [ ] Very long trip origin/destination names don't break layout
- [ ] Very long user names display correctly
- [ ] Empty chat history shows "no messages"
- [ ] Empty trips list shows "no trips available"
- [ ] Large numbers (cost, seats) format correctly

**Concurrency**
- [ ] Multiple users joining same trip doesn't cause duplicates
- [ ] Chat message order preserved with rapid messaging
- [ ] No race conditions on trip creation/cancellation

### 1.6 Device Compatibility

**Android**
- [ ] Works on Android 11 (API 30)
- [ ] Works on Android 12 (API 31)
- [ ] Works on Android 13 (API 33)
- [ ] Works on Android 14 (API 34)

**iOS**
- [ ] Works on iOS 15
- [ ] Works on iOS 16
- [ ] Works on iOS 17

**Screen Sizes**
- [ ] Works on 5.0" phone (small)
- [ ] Works on 6.0" phone (medium)
- [ ] Works on 6.5"+ phone (large)
- [ ] Landscape orientation works (if supported)

### 1.7 Accessibility

- [ ] All text has sufficient contrast (WCAG AA minimum)
- [ ] Buttons have minimum 48x48 dp touch target
- [ ] Images have alt text (if used)
- [ ] Form labels associated with inputs
- [ ] Touch feedback visible on all interactive elements

---

## 2. Crash Reporting Verification

### 2.1 Sentry Setup Check

```bash
# 1. Verify Sentry DSN in firebase_options.dart
grep -r "sentry" flutter_app/lib/main.dart

# 2. Verify Sentry initialization
# Should see: Sentry.init() in main.dart before runApp()

# 3. Check that monitoring_service.dart exists
ls -la flutter_app/lib/services/monitoring_service.dart
```

### 2.2 Test Crash Reporting

**Intentional Crash Test:**
1. Add a test button to Browse Rides screen:
   ```dart
   FloatingActionButton(
     onPressed: () => throw Exception("Test crash for Sentry"),
     child: const Icon(Icons.bug_report),
   )
   ```
2. Tap button to trigger crash
3. Wait 10 seconds
4. Log in to Sentry.io
5. Verify crash appears in Sentry dashboard with full stack trace
6. Remove test button after verification

### 2.3 Error Tracking

- [ ] Exception thrown in service is captured by Sentry
- [ ] Network error from Supabase is captured
- [ ] Unhandled Flutter error is captured
- [ ] User breadcrumbs show action before crash (e.g., "Opened browse screen")

---

## 3. Performance Benchmarks

Test on a real Android device on 4G network:

```bash
cd flutter_app
flutter run --profile  # Run in profile mode for accurate metrics
```

**Expected Metrics:**

| Screen | Cold Start | Warm Load | Memory |
|--------|-----------|-----------|--------|
| Browse Rides | <3s | <1s | <50MB |
| My Rides | <3s | <1s | <40MB |
| Post Ride | <2s | <500ms | <30MB |
| Chat | <2s | <500ms | <35MB |
| Chat Detail | <2s | <1s | <40MB |
| Profile | <2s | <500ms | <25MB |

**Measure with DevTools:**
```bash
flutter pub global activate devtools
devtools
# Open localhost:9100 → select device → Memory tab
```

---

## 4. Pre-Deployment Checklist

### 4.1 Code Review
- [ ] All TODOs removed (or tracked as issues)
- [ ] No debug print() statements in production code
- [ ] No hardcoded credentials or API keys
- [ ] All imports used (no dead code)
- [ ] No Flutter warnings: `flutter analyze`
- [ ] Code formatted: `dart format lib/`

### 4.2 Dependencies
- [ ] No deprecated packages: `flutter pub outdated`
- [ ] All dependencies locked in pubspec.lock
- [ ] iOS pods up to date: `cd ios && pod repo update && pod install`
- [ ] No security vulnerabilities: `flutter pub global activate pana && pana .`

### 4.3 Secrets & Env
- [ ] .env file NOT committed (in .gitignore)
- [ ] .env.example has dummy values only
- [ ] firebase_options.dart has REAL credentials for production
- [ ] Supabase URL and anon key are production values
- [ ] Sentry DSN points to production project

### 4.4 CI/CD
- [ ] GitHub Actions workflow runs successfully
- [ ] All tests pass: `flutter test --coverage`
- [ ] Coverage > 70% for critical services
- [ ] APK builds successfully: `flutter build apk --release`
- [ ] IPA builds successfully: `flutter build ios --release` (requires macOS)

---

## 5. Building Release Artifacts

### 5.1 Android Release Build

```bash
cd flutter_app

# Clean previous builds
flutter clean

# Get dependencies
flutter pub get

# Build release APK
flutter build apk --release

# Build release AAB (for Play Store)
flutter build appbundle --release

# Output locations:
# APK: build/app/outputs/flutter-apk/app-release.apk
# AAB: build/app/outputs/bundle/release/app-release.aab
```

**Sign APK/AAB:**
- If using Play Store, it handles signing automatically for AAB
- For APK distribution via Firebase, sign manually:
  ```bash
  jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
    -keystore ~/shareride.keystore \
    build/app/outputs/flutter-apk/app-release.apk \
    shareride_key
  ```

### 5.2 iOS Release Build

*Requires macOS with Xcode*

```bash
cd flutter_app

# Build release IPA
flutter build ios --release

# Output: build/ios/iphoneos/Runner.app

# Create IPA:
cd build/ios/iphoneos
mkdir -p Payload
mv Runner.app Payload/
zip -r ../../../app-release.ipa Payload
```

**Sign & Notarize:**
- Use Xcode to create signing certificates
- Xcode handles signing automatically if provisioning profile configured
- For App Store, use Transporter app to upload

### 5.3 Verify Build Integrity

```bash
# Android: Check APK contents
unzip -l build/app/outputs/flutter-apk/app-release.apk | grep -E "\.so|\.dart"

# iOS: Check IPA contents
unzip -l app-release.ipa | head -20

# Both: Test on device before submitting to store
adb install build/app/outputs/flutter-apk/app-release.apk  # Android
```

---

## 6. Store Submissions

### 6.1 Google Play Store

**Preparation:**
1. Create Google Play Developer account (one-time $25 fee)
2. Generate keystore if not already created:
   ```bash
   keytool -genkey -v -keystore shareride.keystore \
     -keyalg RSA -keysize 2048 -validity 10000 \
     -alias shareride_key
   ```
3. Add keystore location to `android/local.properties`:
   ```properties
   storeFile=/path/to/shareride.keystore
   storePassword=***
   keyAlias=shareride_key
   keyPassword=***
   ```

**Submission Steps:**
1. Go to Google Play Console → Create App
2. Fill in app details:
   - App name: "ShareRide"
   - Category: "Travel"
   - Rating: Rate your app (content guidelines)
3. Create release:
   - Upload AAB (build/app/outputs/bundle/release/app-release.aab)
   - Add release notes: "Flutter migration - improved performance and reliability"
4. Add app details:
   - Short description (80 chars max)
   - Full description (4000 chars max)
   - Screenshots (5-8, show key features)
   - Feature graphic (1024x500)
5. Set pricing & distribution:
   - Free app
   - Select countries
6. Submit for review (typically 3-24 hours)

**Store Listing Screenshot Ideas:**
1. Login screen
2. Browse Rides with trip cards
3. Trip detail with "Join" button
4. Chat screen with real-time messages
5. Profile with ratings and vehicle info

### 6.2 Apple App Store

**Preparation:**
1. Create Apple Developer account ($99/year)
2. Create App ID in Apple Developer Console
3. Create signing certificates and provisioning profiles
4. Add app signing config to Xcode

**Submission Steps:**
1. Go to App Store Connect → Create App
2. Fill in app details:
   - App name: "ShareRide"
   - Bundle ID: "com.shareride.app"
   - Sku: "shareride"
3. Add app screenshots:
   - 5 screens per device type (iPhone 6.5", 5.5", etc.)
   - Each in English or native language
4. Add app preview video (optional but recommended)
5. Fill in app information:
   - Description
   - Keywords
   - Support URL
   - Privacy Policy URL
6. Set app pricing (Free)
7. Select app category (Travel)
8. Submit for review (typically 24-48 hours)

---

## 7. Post-Launch Monitoring

### 7.1 First 24 Hours

**Every Hour:**
- [ ] Check Sentry dashboard for new crashes
- [ ] Monitor app store reviews (new 1-star reviews indicate issues)
- [ ] Check support email for urgent issues

**Metrics to Watch:**
- Crash rate (should be <1 per 10,000 sessions)
- Session length (if available)
- Screen load times (should match pre-launch benchmarks)
- User retention (did users try app again?)

### 7.2 First Week

**Daily Checks:**
- [ ] Sentry crash summary
- [ ] App store ratings trend
- [ ] User feedback/support tickets
- [ ] Performance metrics (if using Analytics)

**Critical Response Plan:**
- If crash rate > 5%: Investigate root cause immediately
- If network errors > 50%: Check Supabase backend status
- If users can't log in: Check Supabase Auth service
- If app rejected from store: Address policy violations ASAP

**Issue Prioritization:**
1. **P0 (Critical):** App crashes on launch, can't log in, data loss
   - Response: Hotfix within 1-2 hours
2. **P1 (High):** Major feature broken (chat doesn't work, trips won't load)
   - Response: Hotfix within 4-8 hours
3. **P2 (Medium):** Minor bug or UI issue
   - Response: Fix in next planned release (1-2 weeks)
4. **P3 (Low):** Cosmetic or edge case issue
   - Response: Track and fix in future updates

### 7.3 Hotfix Procedure

If critical issue discovered post-launch:

```bash
# 1. Create emergency branch
git checkout -b hotfix/issue-name

# 2. Fix the issue
# - Make minimal changes
# - Test thoroughly
# - Don't refactor or add features

# 3. Increment version
# pubspec.yaml: version: 1.0.1+2 (patch.minor.build)

# 4. Build and test
flutter clean
flutter pub get
flutter build apk --release

# 5. Push to main and tag
git commit -m "Hotfix: [issue description]"
git push origin hotfix/issue-name
# Create PR, merge to main

# 6. Build release and submit to stores
# Follow build steps from section 5

# 7. Monitor new version for improvements
```

### 7.4 First Month Review

**Metrics to Analyze:**
- Total installs
- Active daily/monthly users
- Crash rate and top crash signatures
- Average session length
- Feature usage (which screens used most)
- User retention (D1, D7, D30)

**Feedback Collection:**
- Review app store comments
- Check support email backlog
- Run user survey if possible
- Identify common pain points

**Planning for Next Release:**
- Priority fixes from crash data
- Feature requests from users
- Performance improvements
- Security updates (if needed)

---

## 8. Rollback Procedure

If unrecoverable critical issue discovered post-launch:

**Immediate (1 hour):**
1. Pull app from stores (if possible)
   - Google Play: Pause release
   - App Store: Remove from sale (takes 24-48 hours)
2. Post on support channels: "Known issue, please use old version"
3. Guide users to previous app version if available

**Within 24 Hours:**
1. Analyze root cause with full team
2. Fix issue thoroughly
3. Test extensively before re-release

**Prevent Future Occurrences:**
1. Add automated test for this issue
2. Review QA process to catch similar issues
3. Improve monitoring to alert on this type of crash

---

## 9. Success Criteria

Phase 5 is successful when:

✅ All manual QA tests pass on real devices  
✅ Crash rate < 1 per 10,000 sessions in first 24 hours  
✅ No P0/P1 issues reported in first week  
✅ Positive user reception (app store rating ≥ 4.0)  
✅ Users able to perform core actions (login, browse, post, chat, rate)  
✅ Performance meets benchmarks (screen load < 3 seconds)  
✅ Supabase backend handling full user load without errors  

---

## Timeline

**Day 1:** Pre-Launch QA
- [ ] Run full manual QA checklist
- [ ] Verify Sentry setup
- [ ] Performance benchmarking
- [ ] Address any blockers

**Day 2:** Build Release
- [ ] Code review and final checks
- [ ] Build release APK/AAB
- [ ] Build release IPA
- [ ] Test on real devices before submission

**Day 3:** Store Submission
- [ ] Submit to Google Play Store
- [ ] Submit to Apple App Store
- [ ] Set up store monitoring alerts
- [ ] Prepare launch communication

**Day 4-7:** Post-Launch Monitoring
- [ ] Daily crash/error review
- [ ] Monitor app store reviews
- [ ] Respond to user feedback
- [ ] Deploy hotfixes if needed

**Week 2:** Stabilization
- [ ] Continue daily monitoring
- [ ] Analyze usage metrics
- [ ] Plan next update based on feedback
- [ ] Close out migration (deprecate React Native documentation)

---

## Contact & Escalation

**On-Call Availability:**
- First 48 hours: Developer available for urgent issues
- Week 1: Daily check-ins at 9am, 12pm, 6pm
- Week 2+: Normal business hours

**Escalation Path:**
1. Support email: support@shareride.app
2. In-app feedback widget
3. Sentry alerts (auto-notify on high crash rate)
4. GitHub issues for tracked bugs

---

## Appendix: Testing Devices

**Recommended Real Devices for QA:**

| Device | OS | API Level | Notes |
|--------|-----|-----------|-------|
| Samsung Galaxy S23 | Android 13/14 | 33/34 | Common budget phone |
| Pixel 6 | Android 13 | 33 | Reference device |
| iPhone 14 | iOS 17 | - | Latest iPhone |
| iPhone 12 | iOS 16 | - | Common iOS version |

**Simulator/Emulator (Secondary):**
- Android Emulator (API 34) - fast, good for quick iteration
- iOS Simulator (macOS only) - fast but missing native features

**Device Access:**
- Personal devices if available
- Borrow from team members
- Firebase Test Lab (paid, cloud-based) for additional coverage

---

**Phase 5 Launch Guide Complete**

Ready to begin pre-launch QA. Print this checklist and start testing on real devices!
