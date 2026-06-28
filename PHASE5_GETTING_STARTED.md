# Phase 5: Getting Started Guide

## Overview

Phase 5 is the final phase of the React Native → Flutter migration. This guide walks through setting up the infrastructure for gradual rollout, monitoring, and eventual React Native deprecation.

**Timeline**: 4 weeks (28 days)
- Week 1: 10% rollout (beta)
- Week 2: 50% rollout (gradual)
- Week 3: 100% rollout (full)
- Week 4: Stabilization + deprecation plan

---

## Pre-Launch Setup (3-5 days)

### 1. Firebase Remote Config Setup

#### Create Feature Flags in Firebase Console

1. Navigate to: Firebase Console → Your Project → Remote Config
2. Create new parameters:

```
Parameter Name          | Type     | Default Value
------------------------|----------|----------------
flutter_rollout_percentage | Number | 0
use_flutter_browse_rides   | Boolean | false
use_flutter_my_rides       | Boolean | false
use_flutter_post_ride      | Boolean | false
use_flutter_chat           | Boolean | false
use_flutter_profile        | Boolean | false
min_app_version            | String  | "1.0.0"
enable_crash_reporting     | Boolean | true
enable_performance_monitoring | Boolean | true
```

3. **DO NOT** publish yet. These defaults will be used until manually updated.

#### Test Remote Config Locally

```dart
// flutter_app/lib/services/feature_flags_service.dart already has this
final flags = FeatureFlagsService();
await flags.initialize();
print('Rollout %: ${flags.getFlutterRolloutPercentage()}'); // Should print 0
```

### 2. Sentry Setup

#### Configure Sentry Project

1. Navigate to: https://sentry.io/organizations/your-org/
2. Create new project (if not already created)
3. Platform: **Dart**
4. Get your DSN: `https://xxxxx@o0.ingest.sentry.io/0`
5. Add to `.env.firebase`:
```
SENTRY_DSN=https://xxxxx@o0.ingest.sentry.io/0
SENTRY_ENVIRONMENT=production
SENTRY_SAMPLE_RATE=1.0
SENTRY_TRACE_SAMPLE_RATE=0.8
```

#### Test Sentry Integration

```bash
cd flutter_app
flutter test test/services/auth_service_test.dart -v
# Should see "Sentry initialized" in logs
```

### 3. Firebase Performance Monitoring

#### Enable in Firebase Console

1. Firebase Console → Your Project → Performance
2. Enable performance monitoring
3. No additional setup needed (automatic when Firebase initialized)

#### Verify in App

```dart
// flutter_app/lib/main.dart already has this
// Monitor will automatically track:
// - App startup time
// - Screen load times
// - API latency
// - Frame rate
```

### 4. GitHub Actions CI/CD

#### Add Secrets to Repository

1. GitHub → Your Repo → Settings → Secrets and variables → Actions
2. Add these secrets:

| Secret | Value | Where to Get |
|--------|-------|--------------|
| `FIREBASE_CREDENTIALS` | Service account JSON | Firebase Console → Project Settings → Service Accounts → Create new key (JSON) |
| `FIREBASE_APP_ID` | App ID | Firebase Console → Your Android App → App settings |
| `GOOGLE_PLAY_KEY` | Play Store signing key | Google Play Console → Setup → App Signing |
| `APPLE_SIGNING_KEY` | Apple signing cert | Apple Developer → Certificates, IDs & Profiles |

#### Test CI/CD Workflow

```bash
cd /home/user/ShareRide
git add .github/workflows/flutter-ci-cd.yml
git commit -m "Add Flutter CI/CD pipeline"
git push origin claude/kmp-vs-react-native-m51ceo
```

Workflow should automatically trigger. Monitor progress in GitHub → Actions tab.

**Expected output:**
- ✅ Unit & Widget Tests (75%+ coverage)
- ✅ Performance Benchmarks (all pass)
- ✅ Build Android APK
- ✅ Build iOS IPA
- ✅ Deploy to Firebase App Distribution (beta)

### 5. Firebase App Distribution (Beta Testing)

#### Upload First Build

1. GitHub Actions automatically builds and uploads
2. OR manually upload:
```bash
cd flutter_app/build/app/outputs/flutter-apk/
# Get firebase-cli
npm install -g firebase-tools
firebase login
firebase appdistribution:distribute app-release.apk \
  --app <FIREBASE_APP_ID> \
  --release-notes "Beta build from CI/CD" \
  --testers "beta-testers@example.com"
```

#### Invite Beta Testers

1. Firebase Console → App Distribution → Testers
2. Add email addresses
3. Testers receive email link → download Firebase App Tester app → install build

### 6. Manual QA (Pre-Launch)

Follow: `PHASE5_QA_CHECKLIST.md`

**Minimum requirements before launch:**
- ✅ All critical flows work on 4 devices (2x Android, 2x iOS)
- ✅ No crashes in 1 hour of use
- ✅ Performance targets met (startup <3s, queries <2s)
- ✅ Sentry captures crashes successfully
- ✅ Firebase Performance shows metrics

---

## Week 1: Soft Launch (10% Rollout)

### Day 1: Launch

#### Step 1: Update Firebase Remote Config

1. Firebase Console → Remote Config
2. Click "flutter_rollout_percentage"
3. Set value to: **10**
4. Publish (hit "Publish changes")

```
This means:
- 10% of users will use Flutter screens
- 90% of users will see React Native fallback
- Deterministic based on user ID hash (same user always gets same experience)
```

#### Step 2: Monitor Dashboards

1. **Sentry Dashboard**: https://sentry.io/projects/shareride/
   - Watch crash rate (should be <0.1%)
   - Set alert for >0.5% crash rate

2. **Firebase Performance**: Firebase Console → Performance
   - Check app startup time (target: <3s)
   - Check screen load times

3. **GitHub Actions**: Watch build status
   - All tests passing?
   - APK size reasonable (<100MB)?

#### Step 3: Notify Beta Testers

Send message:
```
"ShareRide Flutter Beta Week 1 is live!

10% of beta testers now testing Flutter version.
Please report any crashes or issues.

Send feedback via: Settings → Send Feedback

Thank you for testing!"
```

### Days 2-7: Daily Monitoring

#### Daily Checklist
- [ ] 09:00 AM: Check Sentry crash rate
- [ ] 09:15 AM: Check Firebase Performance metrics
- [ ] 12:00 PM: Review user feedback
- [ ] 06:00 PM: Final check of all metrics
- [ ] Alert on: Crash rate >0.5% or critical feature broken

#### What to Watch For
```
🔴 RED FLAGS (Immediate Action):
- Crash rate >1% of sessions
- Login completely broken
- Chat not working
- Memory leak (memory keeps growing)

🟡 YELLOW FLAGS (Investigate):
- Crash rate 0.5-1%
- High latency (queries >3s)
- Performance regression (vs React Native baseline)
- Unusual error patterns

✅ GREEN FLAGS (Continue):
- Crash rate <0.3%
- All metrics within targets
- Positive user feedback
- No increase in error rate
```

#### Contingency: Emergency Rollback
If RED FLAGS detected:
1. Set `flutter_rollout_percentage = 0` immediately
2. All new users routed to React Native
3. Investigate root cause in Sentry
4. Create GitHub issue with detailed repro steps
5. Don't re-enable until issue fixed + tested

### End of Week 1 Review

**Go / No-Go Decision:**
- [ ] Crash rate <0.3%?
- [ ] No critical bugs?
- [ ] Performance targets met?
- [ ] Positive user feedback?

**If YES**: Proceed to Week 2 (50% rollout)
**If NO**: Stay at 10% or rollback to 0%

---

## Week 2: Gradual Expansion (50% Rollout)

### Day 8: Expand to 50%

#### Step 1: Update Remote Config

1. Firebase Console → Remote Config
2. Set `flutter_rollout_percentage = 50`
3. Publish

#### Step 2: Deploy to Production

1. GitHub Actions → Latest build → Deploy to Play Store / App Store
2. Release notes: "ShareRide is now running on Flutter for better performance!"

#### Step 3: Increase Monitoring Frequency

- Check dashboards every 1-2 hours (instead of daily)
- Be prepared for rapid escalation

#### Step 4: Notify All Users

```
"ShareRide is now running on Flutter!

Your device is running the new Flutter version 
for better performance and stability.

If you experience any issues, tap Settings → Send Feedback.
We're monitoring everything closely."
```

### Days 9-14: Monitor at 50%

#### Daily Checklist
- [ ] Crash rate stable or improving?
- [ ] Performance metrics within targets?
- [ ] New error patterns?
- [ ] User retention OK (not dropping)?

#### Watch These Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Crash rate | <0.3% | >0.5% |
| App startup | <3s | >4s |
| Query latency | <2s | >3s |
| Message latency | <500ms | >1s |
| Memory | <200MB | >250MB |
| Session length | ≥RN baseline | -10% drop |

#### User Feedback
- [ ] Any patterns in feedback?
- [ ] Feature requests vs bugs?
- [ ] Priority on fixing issues?

### End of Week 2 Review

**Go / No-Go Decision:**
- [ ] Still at <0.3% crash rate?
- [ ] Performance stable?
- [ ] No new critical issues?
- [ ] User engagement increasing or stable?

**If YES**: Proceed to Week 3 (100% rollout)
**If NO**: Stay at 50% for another week

---

## Week 3: Full Rollout (100%)

### Day 15: Rollout to 100%

#### Step 1: Update Remote Config

1. Firebase Console → Remote Config
2. Set `flutter_rollout_percentage = 100`
3. Publish

#### Step 2: Monitor Intensively

- First 24 hours: Check metrics every hour
- Days 2-7: Check metrics every 4 hours
- Be ready for immediate rollback if needed

#### Step 3: User Communication

```
"ShareRide is now Flutter-powered!

All users are now running the new Flutter version.
Enjoy better performance, reliability, and stability.

Questions? Settings → Send Feedback"
```

### Days 16-21: 100% Production Rollout

#### Daily Checklist
- [ ] Crash rate <0.3%?
- [ ] All performance targets met?
- [ ] No new error patterns?
- [ ] Conversions/engagement metrics?

#### Rollback Triggers

Immediately rollback to 50% if:
- Crash rate exceeds 1%
- Authentication completely broken
- Chat feature entirely unavailable
- Memory leak causing crashes

**Rollback procedure:**
```bash
# Set in Firebase Remote Config
flutter_rollout_percentage = 50

# Investigate root cause
# Create GitHub issue
# Push hotfix or revert change
# Re-test on beta before re-enabling
```

### End of Week 3: All-Clear

If 7 days at 100% with no critical issues:
- React Native is officially deprecated
- Proceed to Week 4

---

## Week 4: Stabilization & Cleanup

### Days 22-28: Stabilization Phase

#### Daily Monitoring

Continue monitoring all metrics. By now:
- Crash rate should be <0.2%
- Performance stable
- User satisfaction high
- No new error patterns

#### Week 4 Milestone: React Native Deprecation

Once Flutter stable for 7+ days:

1. **Stop building React Native releases**
   - Delete React Native workflow from GitHub Actions
   - Archive React Native code

2. **Mark React Native as deprecated**
   ```
   # In Firebase Remote Config, add new parameter:
   use_react_native_fallback = false
   
   # This stops routing to React Native completely
   ```

3. **Notify users of old React Native version**
   ```
   "Your version of ShareRide is outdated.
   Please update from the App Store/Play Store.
   
   New features and performance improvements await!"
   ```

### Day 28: Phase 5 Complete

- [ ] React Native code archived (not deleted, just archived)
- [ ] CI/CD updated (Flutter-only)
- [ ] Documentation updated (Flutter-only)
- [ ] Team celebration 🎉

---

## Post-Launch: Weeks 5-8+

### Ongoing Monitoring

#### Weekly Metrics Report
- Crash rate trend
- Performance metrics
- User retention
- Feature adoption

#### Monthly Deep-Dive Review
- Are we seeing regressions?
- Should we optimize anything?
- User satisfaction scores?
- Technical debt?

#### When to Delete React Native Code (Day 28+)

Once you're confident Flutter is stable:

```bash
cd /home/user/ShareRide

# Archive React Native code
git checkout -b archive/react-native-legacy
# (This branch preserves history if needed)

# Return to main and delete
git checkout main
rm -rf app/  # Remove React Native directory
git commit -m "Remove React Native (archived in archive/react-native-legacy)"
git push origin main
```

---

## Key Files to Reference

### Infrastructure
- `.github/workflows/flutter-ci-cd.yml` - CI/CD pipeline
- `flutter_app/lib/services/feature_flags_service.dart` - Feature flags logic
- `flutter_app/lib/services/monitoring_service.dart` - Monitoring & performance tracking
- `flutter_app/lib/providers/feature_flags_provider.dart` - Riverpod integration

### Configuration
- `flutter_app/.env.firebase.example` - Firebase configuration template
- `flutter_app/lib/config/firebase_remote_config.dart` - Remote Config defaults

### Documentation
- `PHASE5_DEPRECATION.md` - Detailed phase timeline and success criteria
- `PHASE5_QA_CHECKLIST.md` - Manual QA test cases
- `PHASE5_GETTING_STARTED.md` - **This file**

---

## Troubleshooting

### Firebase Remote Config Not Updating

```bash
# Check if values are published
# Firebase Console → Remote Config → Check "Published" tab

# In app, force refresh
await FeatureFlagsService().refresh();
```

### CI/CD Build Failing

Check GitHub Actions logs:
1. GitHub → Actions → Latest workflow
2. Click failed job
3. Expand step that failed
4. Read error message (usually missing secret)

**Common issues:**
- Missing GitHub Secret (Firebase credentials, etc.)
- Flutter version mismatch
- Dependency resolution failed

### Crashes Not Appearing in Sentry

1. Check Sentry DSN is correct in `.env`
2. Enable Sentry in Flutter (should be automatic)
3. Check Firebase Console → Crashlytics
4. May take 1-5 minutes to appear in Sentry

### Performance Metrics Missing

1. Firebase Console → Performance → Check if enabled
2. Wait 24-48 hours for data to accumulate
3. Ensure app is sending metrics (automatic if Firebase initialized)

---

## Success Checklist

✅ **Phase 5 is complete when:**
- [ ] 100% of users on Flutter (>99% actually running it)
- [ ] Crash rate <0.3% (stable)
- [ ] All performance targets met
- [ ] 7+ days of stable production operation
- [ ] React Native code archived/deleted
- [ ] Documentation updated
- [ ] Team trained on new Flutter codebase
- [ ] Monitoring dashboards in place for long-term
- [ ] No regression in user engagement or retention

---

## Contact & Support

**Questions?**
- Tech Lead: [@lead-name]
- DevOps: [@devops-name]
- Product: [@product-name]

**Escalation path:**
1. Check Sentry for crash details
2. Post in #shareride-dev Slack channel
3. Create GitHub issue if needed
4. Escalate to tech lead if critical

---

**Last updated:** 2026-06-28  
**Status:** Ready for Phase 5 Launch  
**Version:** 1.0

