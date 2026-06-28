# Phase 5: Flutter Launch & Cutover — Status Tracker

**Last Updated:** 2026-06-28  
**Status:** Pre-Launch QA Preparation  
**Timeline:** Week of [deployment date]  

---

## Phase 5 Stages

### Stage 1: Pre-Launch QA ⏳ IN PROGRESS

**Objective:** Verify all features work on real devices before store submission.

**Checklist:**

#### 1.1 QA Environment Setup
- [ ] Android device/emulator with Android 11+ available
- [ ] iOS device/simulator with iOS 15+ available
- [ ] Firebase project with Sentry initialized
- [ ] Test Supabase project data (sample trips, users, matches)
- [ ] Wi-Fi and mobile (4G/3G) connectivity available

#### 1.2 Feature Testing (70+ test cases in PHASE5_LAUNCH_GUIDE.md)
- [ ] Auth (7 tests)
  - [ ] Email OTP login works
  - [ ] OTP verification accepts/rejects codes
  - [ ] Logout clears session
  - [ ] Session persists after app restart
  - [ ] Token refresh works silently
  - All passed: YES / NO / BLOCKED

- [ ] Browse Rides (7 tests)
  - [ ] Trip list loads <3 seconds
  - [ ] Trip cards display correctly
  - [ ] Pagination works
  - [ ] Filtering works (cost, date)
  - [ ] Trip detail opens on tap
  - [ ] Pull-to-refresh works
  - All passed: YES / NO / BLOCKED

- [ ] My Rides (3 tests)
  - [ ] Posted offers display correctly
  - [ ] Matched riders show
  - [ ] Cancel/edit actions work
  - All passed: YES / NO / BLOCKED

- [ ] Post Ride (8 tests)
  - [ ] Form loads without errors
  - [ ] Location input works
  - [ ] Time/recurrence picker works
  - [ ] Cost calculation correct
  - [ ] Seat availability input (1-6)
  - [ ] Submit creates trip
  - [ ] Validation shows errors
  - [ ] Cost cap enforced
  - All passed: YES / NO / BLOCKED

- [ ] Chat (2 tests)
  - [ ] Chat list loads with conversations
  - [ ] Real-time updates work
  - All passed: YES / NO / BLOCKED

- [ ] Chat Detail (7 tests)
  - [ ] Messages load correctly
  - [ ] Send message appears immediately
  - [ ] Message arrives on other device <2s
  - [ ] Timestamps correct
  - [ ] Long conversation scrolls smoothly
  - [ ] Send button disabled until text entered
  - All passed: YES / NO / BLOCKED

- [ ] Profile (9 tests)
  - [ ] Avatar/initials display
  - [ ] User name displays
  - [ ] Average rating displays
  - [ ] Verification tier badge shows
  - [ ] Edit profile works
  - [ ] Vehicle management works
  - [ ] Add vehicle form works
  - [ ] Logout works
  - All passed: YES / NO / BLOCKED

- [ ] Trip Detail (7 tests)
  - [ ] Trip info displays
  - [ ] Host info shows
  - [ ] Status shows correctly
  - [ ] Join button works
  - [ ] Matched riders list shows
  - [ ] Share link can be copied
  - All passed: YES / NO / BLOCKED

- [ ] Trip Sharing (2 tests)
  - [ ] Deep link `shareride://trip/[id]` works
  - [ ] Share link works from email/SMS
  - All passed: YES / NO / BLOCKED

- [ ] Ratings (4 tests)
  - [ ] Rating modal appears after trip
  - [ ] Star rating works
  - [ ] Review text input works
  - [ ] Submit saves rating
  - All passed: YES / NO / BLOCKED

#### 1.3 Performance & Stability
- [ ] Cold start <3 seconds
- [ ] Warm start <1 second
- [ ] Memory usage <100MB (Android), <150MB (iOS)
- [ ] No memory leaks after 10-minute session
- [ ] CPU usage normal at rest
- [ ] Works on 4G LTE
- [ ] Works on 3G (slower but functional)
- [ ] Graceful handling of network dropout
- [ ] Browse/Chat scrolls smoothly (60 FPS)
- **Performance Status:** PASS / FAIL / NEEDS_OPTIMIZATION

#### 1.4 Push Notifications
- [ ] App requests permission on first launch
- [ ] User can grant/deny
- [ ] Device token registered in Supabase
- [ ] Ride match notification arrives <5s
- [ ] New message notification arrives <5s
- [ ] Tapping notification opens correct screen
- **Notification Status:** PASS / FAIL / BLOCKED

#### 1.5 Data Integrity
- [ ] Auth token persists in secure storage
- [ ] Token cleared on logout
- [ ] Token refreshes automatically (JWT)
- [ ] RLS policies prevent unauthorized access
- [ ] Can't edit other users' content
- [ ] Cost cap enforced server-side
- [ ] Offline data cached correctly
- **Data Integrity Status:** PASS / FAIL / BLOCKED

#### 1.6 Edge Cases
- [ ] Multiple login attempts work
- [ ] OTP expires after 10 minutes
- [ ] Rapid OTP verification handled
- [ ] Long names don't break layout
- [ ] Empty lists show "no data" messages
- [ ] Multiple users joining same trip (no duplicates)
- [ ] Chat message order preserved
- **Edge Cases Status:** PASS / FAIL / BLOCKED

#### 1.7 Device Compatibility
- [ ] Android 11 (API 30): PASS / FAIL / UNTESTED
- [ ] Android 12 (API 31): PASS / FAIL / UNTESTED
- [ ] Android 13 (API 33): PASS / FAIL / UNTESTED
- [ ] Android 14 (API 34): PASS / FAIL / UNTESTED
- [ ] iOS 15: PASS / FAIL / UNTESTED
- [ ] iOS 16: PASS / FAIL / UNTESTED
- [ ] iOS 17: PASS / FAIL / UNTESTED

#### 1.8 Accessibility
- [ ] Text has sufficient contrast
- [ ] Buttons have 48x48 dp touch target
- [ ] Images have alt text
- [ ] Form labels associated with inputs
- [ ] Touch feedback visible
- **Accessibility Status:** PASS / FAIL / BLOCKED

#### 1.9 Crash Reporting
- [ ] Sentry DSN in firebase_options.dart
- [ ] Sentry.init() in main.dart
- [ ] monitoring_service.dart exists
- [ ] Intentional crash test: PASS / FAIL
- [ ] Crash appears in Sentry dashboard: YES / NO
- [ ] Stack trace is readable: YES / NO
- **Sentry Status:** CONFIGURED / NEEDS_SETUP / BROKEN

#### 1.10 Code Quality
- [ ] No TODOs in production code
- [ ] No debug print() statements
- [ ] No hardcoded credentials
- [ ] All imports used
- [ ] `flutter analyze` passes
- [ ] Code formatted: `dart format lib/`
- [ ] No deprecated packages
- [ ] iOS pods updated: `pod repo update && pod install`
- **Code Quality Status:** PASS / FAIL

**Stage 1 Completion Criteria:**
- All core features tested and passing on real devices
- Performance within benchmarks
- Sentry crash reporting verified working
- Code quality checks passed
- No P0/P1 blockers remaining

**Stage 1 Status:** 🔴 NOT STARTED / 🟡 IN PROGRESS / 🟢 COMPLETE
**Est. Completion:** [date when QA finishes]
**Notes:** 
```
[Document any issues found and resolutions]
```

---

### Stage 2: Build Release 📦 NOT STARTED

**Objective:** Generate production-ready APK, AAB, and IPA artifacts.

**Checklist:**
- [ ] Stage 1 QA passed
- [ ] All blockers resolved
- [ ] Version number decided (e.g., 1.0.0)
- [ ] pubspec.yaml version updated
- [ ] Release notes written
- [ ] Android keystore configured (if custom signing)
- [ ] iOS provisioning profiles configured (if custom signing)
- [ ] Run `./scripts/build_release.sh --all --version 1.0.0`
- [ ] APK built: `build/app/outputs/flutter-apk/app-release.apk`
- [ ] AAB built: `build/app/outputs/bundle/release/app-release.aab`
- [ ] IPA built: `build/ios/iphoneos/Runner.app`
- [ ] All artifacts copied to `releases/` directory
- [ ] Checksums generated and verified
- [ ] Test APK on Android device: `adb install releases/app-release.apk`
- [ ] Test IPA on iOS device (via Xcode or TestFlight)

**Artifact Verification:**
- [ ] APK size reasonable (<100MB)
- [ ] AAB size reasonable (<100MB)
- [ ] IPA size reasonable (<200MB)
- [ ] Checksums match expected values
- [ ] APK/IPA installed successfully
- [ ] App launches without crashing
- [ ] Login works
- [ ] Can browse trips
- [ ] Can send chat message

**Stage 2 Status:** 🔴 NOT STARTED / 🟡 IN PROGRESS / 🟢 COMPLETE
**Est. Completion:** [date when builds complete]
**Built Artifacts:**
```
- app-release.apk:   [size, checksum]
- app-release.aab:   [size, checksum]
- app-release.ipa:   [size, checksum]
```

---

### Stage 3: Store Submission 🛒 NOT STARTED

**Objective:** Submit Flutter app to Google Play Store and Apple App Store.

#### 3.1 Google Play Store
- [ ] Developer account created ($25 one-time fee)
- [ ] Keystore generated or configured
- [ ] Create new app in Google Play Console
- [ ] Fill app details:
  - [ ] App name: "ShareRide"
  - [ ] Category: "Travel"
  - [ ] Content rating: Rated
- [ ] Upload AAB: `releases/app-release.aab`
- [ ] Add release notes (≤500 chars)
- [ ] Create 5-8 screenshots (1080x1920 pixels):
  - [ ] Login screen
  - [ ] Browse rides
  - [ ] Trip detail
  - [ ] Chat
  - [ ] Profile
  - [ ] Ratings (optional)
  - [ ] Verification badges (optional)
  - [ ] No-show indicator (optional)
- [ ] Add feature graphic (1024x500)
- [ ] Add short description (≤80 chars)
- [ ] Add full description (≤4000 chars)
- [ ] Set pricing: Free
- [ ] Select target countries
- [ ] Submit for review
- **Play Store Status:** NOT_SUBMITTED / SUBMITTED / APPROVED / REJECTED
- **Review Time:** ~3-24 hours
- **Submission Date:** [date]
- **Approval Date:** [date]

#### 3.2 Apple App Store
- [ ] Developer account created ($99/year)
- [ ] App ID created in Apple Developer Console
- [ ] Signing certificates generated
- [ ] Provisioning profiles configured
- [ ] Create new app in App Store Connect
- [ ] Fill app details:
  - [ ] App name: "ShareRide"
  - [ ] Bundle ID: "com.shareride.app"
  - [ ] Sku: "shareride"
- [ ] Upload IPA: `releases/app-release.ipa`
- [ ] Add release notes
- [ ] Create 5 screenshots per device type:
  - [ ] iPhone 6.5" (2796x1290)
  - [ ] iPhone 5.5" (1242x2208)
  - [ ] iPad (2048x1536) [optional]
- [ ] Add app preview video [optional but recommended]
- [ ] Add short description (≤170 chars)
- [ ] Add full description (≤4000 chars)
- [ ] Add keywords (≤100 chars)
- [ ] Add support URL
- [ ] Add privacy policy URL
- [ ] Set pricing: Free
- [ ] Select category: "Travel"
- [ ] Submit for review
- **App Store Status:** NOT_SUBMITTED / SUBMITTED / APPROVED / REJECTED
- **Review Time:** ~24-48 hours
- **Submission Date:** [date]
- **Approval Date:** [date]

**Store Submission Status:** 🔴 NOT STARTED / 🟡 IN PROGRESS / 🟢 COMPLETE
**Play Store Link:** https://play.google.com/store/apps/details?id=com.shareride.app
**App Store Link:** https://apps.apple.com/app/shareride/...

---

### Stage 4: Post-Launch Monitoring 👀 NOT STARTED

**Objective:** Monitor app performance, crashes, and user feedback post-launch.

#### 4.1 First 24 Hours
- [ ] App available in stores
- [ ] Sentry dashboard configured with alerts
- [ ] Support email monitored
- [ ] Team on-call for urgent issues

**Hourly Checks (first 24h):**
- Hour 1: [ ] App accessible, no obvious crashes
- Hour 2: [ ] Crash rate normal (<1 per 10k sessions)
- Hour 4: [ ] Continuing to monitor
- Hour 8: [ ] Still stable, sleep if safe
- Hour 12: [ ] Check once more after 12h
- Hour 24: [ ] Successful 24-hour milestone

**Metrics Monitored:**
- Crash rate: [target: <1 per 10,000 sessions]
- Critical errors: [target: 0]
- User feedback: [monitor app store reviews]
- Support tickets: [monitor email]

#### 4.2 First Week
- [ ] Daily crash summary review
- [ ] App store ratings trend
- [ ] Support ticket backlog
- [ ] Performance metrics stable
- [ ] No P1 issues requiring hotfix

**Weekly Metrics:**
- Total installs: [count]
- Crash rate (avg): [%]
- Top 3 crash signatures: [list]
- Average rating: [stars]
- New 1-star reviews: [count]
- Support tickets: [count]

#### 4.3 First Month
- [ ] Analyze usage patterns
- [ ] Identify feature usage
- [ ] Collect user feedback
- [ ] Plan improvements
- [ ] Release hotfixes if needed

**Monthly Analysis:**
- Daily active users (DAU): [count]
- Session length (avg): [time]
- Feature usage:
  - [ ] Browse Rides: [usage %]
  - [ ] Post Ride: [usage %]
  - [ ] Chat: [usage %]
  - [ ] Ratings: [usage %]
- Top improvement requests: [list]
- Top bugs: [list]

#### 4.4 Critical Issues (If Any)
- [ ] P0 (crashes on launch, can't login): Hotfix within 1-2 hours
- [ ] P1 (major feature broken): Hotfix within 4-8 hours
- [ ] P2 (minor bug): Fix in next release (1-2 weeks)

**Hotfix Log:**
```
[Record any hotfixes released]
```

**Post-Launch Rollback Procedure (if critical issue):**
- [ ] Pull app from stores (pause Play Store, remove from App Store)
- [ ] Post notice on support channels
- [ ] Guide users to previous version
- [ ] Fix issue thoroughly
- [ ] Re-test extensively
- [ ] Re-submit to stores

**Post-Launch Status:** 🔴 NOT STARTED / 🟡 IN PROGRESS / 🟢 STABLE (> 1 month)
**Est. Completion:** [1 month post-launch]

---

## Overall Phase 5 Progress

**Current Stage:** Stage 1 - Pre-Launch QA  
**Progress:** 0% → 25% → 50% → 75% → 100%  
**Est. Completion:** [1 week from QA start]  

**Stage Completion:**
- [ ] Stage 1 (Pre-Launch QA): 🔴 0%
- [ ] Stage 2 (Build Release): 🔴 0%
- [ ] Stage 3 (Store Submission): 🔴 0%
- [ ] Stage 4 (Post-Launch Monitoring): 🔴 0%

**Phase 5 Complete When:**
1. ✅ All QA tests pass on real devices
2. ✅ Release artifacts built and verified
3. ✅ Apps submitted to and approved by stores
4. ✅ Apps live in Play Store and App Store
5. ✅ Crash rate stable for 7 days
6. ✅ User feedback positive (≥4.0 rating)
7. ✅ No critical bugs requiring rollback

---

## Key Contacts & Escalation

| Role | Contact | Availability |
|------|---------|--------------|
| Tech Lead | [name] | 24/7 for P0 |
| QA Lead | [name] | 9am-6pm |
| Product Manager | [name] | 9am-6pm |
| Support | support@shareride.app | 9am-6pm |
| On-Call Hotline | [number] | First 48 hours post-launch |

---

## Notes & Issues Log

**Critical Blockers:**
```
[List any showstoppers found during QA]
```

**Known Issues (Non-blocking):**
```
[List bugs found but not critical for launch]
```

**Lessons Learned:**
```
[Captured after launch completion]
```

---

**Phase 5 Status Tracker — Last Updated:** 2026-06-28  
**Next Review:** [date when QA begins]
