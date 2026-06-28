# Phase 5: React Native Deprecation & Flutter Launch

This README summarizes Phase 5 of the ShareRide migration from React Native to Flutter.

## 📋 Quick Overview

| Item | Value |
|------|-------|
| **Status** | Ready for launch |
| **Timeline** | 4 weeks (28 days) |
| **Rollout Strategy** | Gradual (10% → 50% → 100%) |
| **Key Files** | See [Phase 5 Files](#-phase-5-files) |
| **Getting Started** | Read [PHASE5_GETTING_STARTED.md](./PHASE5_GETTING_STARTED.md) |

## 🎯 Phase 5 Goals

1. ✅ Launch Flutter app to 10% of users (Week 1)
2. ✅ Expand to 50% of users (Week 2)
3. ✅ Full 100% rollout to all users (Week 3)
4. ✅ Stabilize and deprecate React Native (Week 4)

## 📁 Phase 5 Files

### Infrastructure & Services
- **`flutter_app/lib/services/feature_flags_service.dart`** - Feature flag logic with Firebase Remote Config integration
- **`flutter_app/lib/services/monitoring_service.dart`** - Crash reporting & performance monitoring (Sentry + Firebase)
- **`flutter_app/lib/providers/feature_flags_provider.dart`** - Riverpod providers for feature flags

### Configuration
- **`flutter_app/.env.firebase.example`** - Firebase configuration template
- **`flutter_app/lib/config/firebase_remote_config.dart`** - Remote Config defaults and setup guide
- **`flutter_app/pubspec.yaml`** - Updated with firebase_performance dependency

### CI/CD
- **`.github/workflows/flutter-ci-cd.yml`** - Automated testing, building, and deployment pipeline
  - Unit & widget tests (coverage tracking)
  - Performance benchmarks
  - Android APK build
  - iOS IPA build
  - Deploy to Firebase App Distribution (beta)

### Documentation
- **`PHASE5_GETTING_STARTED.md`** - Step-by-step setup and launch guide (START HERE!)
- **`PHASE5_DEPRECATION.md`** - Detailed timeline, monitoring, user communication
- **`PHASE5_QA_CHECKLIST.md`** - Comprehensive manual QA test cases
- **`PHASE5_README.md`** - This file

## 🚀 Quick Start (TL;DR)

### Before Launch (Do This First)
1. Read `PHASE5_GETTING_STARTED.md` completely
2. Set up Firebase Remote Config (defaults in `.env.firebase.example`)
3. Configure Sentry project
4. Add GitHub Secrets (Firebase credentials, etc.)
5. Run full QA suite (`PHASE5_QA_CHECKLIST.md`)

### Week 1: Soft Launch
```bash
# 1. Publish to Firebase Remote Config:
flutter_rollout_percentage = 10

# 2. Monitor dashboards daily:
- Sentry: https://sentry.io/projects/shareride/
- Firebase: Firebase Console → Performance
- GitHub: Actions tab (build status)

# 3. Watch for crashes, errors, performance issues
# If crash rate >0.5%, rollback immediately
```

### Week 2: Expand to 50%
```bash
# 1. Publish to Firebase Remote Config:
flutter_rollout_percentage = 50

# 2. Deploy to production App Stores (via CI/CD or manual)

# 3. Continue monitoring (more intensively)
```

### Week 3: Full Rollout
```bash
# 1. Publish to Firebase Remote Config:
flutter_rollout_percentage = 100

# 2. All users now on Flutter!
# 3. Intensive monitoring (first 24h: check every hour)
```

### Week 4+: Stabilization & Cleanup
```bash
# 1. Keep monitoring for 7 days at 100%
# 2. If stable (crash rate <0.3%):
#    - Set use_react_native_fallback = false in Remote Config
#    - Delete React Native code from main branch
#    - Archive to archive/react-native-legacy branch

# 3. Celebrate! 🎉
```

## 🔍 Feature Flags System

### How Feature Flags Work

Feature flags are stored in **Firebase Remote Config** and control which screens use Flutter vs React Native.

```dart
// In your code, check feature flags:
final flags = FeatureFlagsService();
if (flags.usesFlutterBrowseRides()) {
  // Show Flutter Browse Rides screen
} else {
  // Show React Native fallback
}
```

### Remote Config Parameters

| Parameter | Type | Purpose |
|-----------|------|---------|
| `flutter_rollout_percentage` | Number (0-100) | Main rollout percentage |
| `use_flutter_browse_rides` | Boolean | Force Flutter for Browse screen |
| `use_flutter_chat` | Boolean | Force Flutter for Chat screen |
| `enable_crash_reporting` | Boolean | Enable Sentry reporting |
| `enable_performance_monitoring` | Boolean | Enable Firebase Performance |

### Deterministic Rollout

The `isUserInRollout(userId)` function ensures:
- **Consistent behavior**: Same user always gets same experience
- **Fair distribution**: Hash-based, so 10% means exactly 10% of users
- **Easy scaling**: Just increase percentage to expand rollout

## 📊 Monitoring Dashboard

### Sentry (Crash Reporting)
- **URL**: https://sentry.io/projects/shareride/
- **Watch**: Overall crash rate, top crash types, error patterns
- **Alert**: >0.5% crash rate

### Firebase Performance
- **URL**: Firebase Console → Performance
- **Watch**: App startup time, screen load times, API latency, memory
- **Targets**:
  - Startup: <3s
  - Queries: <2s
  - Chat: <500ms latency
  - Memory: <200MB

### GitHub Actions
- **URL**: GitHub → Actions tab
- **Watch**: Build status, test coverage, deployment logs
- **Should see**: All tests passing, coverage >75%, APK <100MB

## 🚨 Rollback Procedure

If something goes wrong:

### Immediate Rollback (Crash Rate >1%)
```bash
# Set in Firebase Remote Config:
flutter_rollout_percentage = 0

# This immediately routes all new users back to React Native
```

### Gradual Rollback (Crash Rate 0.5-1%)
```bash
# Reduce rollout:
flutter_rollout_percentage = 25  # (or 50 if at 100%)

# Monitor for 6-12 hours
# If stable, can try expanding again
# If still issues, rollback to 0
```

### Investigate Root Cause
1. Check Sentry crash details
2. Check Firebase logs
3. Create GitHub issue with full details
4. Push fix or revert problematic change
5. Test on beta before re-enabling

## 📱 Device Testing Requirements

Before launch, test on:
- [ ] Android device, Android 11 or older
- [ ] Android device, Android 13 or newer
- [ ] iOS device, iOS 15 or older
- [ ] iOS device, iOS 17 or newer

Test each device with complete flow:
- Login → Browse → Join → Chat → Rate → Logout

## 💬 User Communication

### Week 1 (Beta)
"We're testing a new version of ShareRide built with Flutter for better performance!"

### Week 2 (50% Rollout)
"ShareRide is now running on Flutter! Update your app for better performance."

### Week 3 (100% Rollout)
"All ShareRide users are now on the new Flutter version. Enjoy better performance!"

### Week 4+ (Deprecation)
"Your version of ShareRide is outdated. Please update from App Store/Play Store."

## 🔧 Troubleshooting

### Crashes Not Appearing in Sentry
- Check DSN is correct in `.env`
- Ensure Sentry initialized before app runs
- Wait 1-5 minutes for events to appear

### Feature Flags Not Updating
- Check Firebase Remote Config "Published" tab
- Force refresh: `await FeatureFlagsService().refresh()`
- Clear app cache and restart

### CI/CD Build Failing
- Check GitHub Actions logs
- Verify all secrets are added (Firebase credentials, etc.)
- Check Flutter version compatibility

### Performance Metrics Missing
- Wait 24-48 hours for initial data
- Check Firebase Performance is enabled
- Ensure app is sending metrics (automatic if Firebase initialized)

## ✅ Success Criteria

Phase 5 is complete when:
- ✅ 100% of users on Flutter (>99% actually running it)
- ✅ Crash rate <0.3% (stable or improving)
- ✅ All performance targets met (startup <3s, queries <2s)
- ✅ No critical bugs or regressions
- ✅ User satisfaction high (positive feedback)
- ✅ React Native code archived/deleted
- ✅ Monitoring in place for long-term

## 📞 Support & Escalation

**Questions or issues?**
1. Check `PHASE5_GETTING_STARTED.md` troubleshooting section
2. Review relevant monitoring dashboard (Sentry/Firebase/Actions)
3. Check GitHub issues for similar problems
4. Post in #shareride-dev Slack channel
5. Create GitHub issue if needed

**On-Call Team**: @shareride-devops
**Sentry Alerts**: Team Slack #errors channel
**Critical Issues**: Immediate escalation to tech lead

## 📚 Reference Materials

### Documentation
- Full migration plan: `/root/.claude/plans/does-this-project-in-tender-anchor.md`
- Test coverage guide: `flutter_app/TEST_README.md`
- Architecture guide: `CLAUDE.md`

### Code
- Feature flags: `flutter_app/lib/services/feature_flags_service.dart`
- Monitoring: `flutter_app/lib/services/monitoring_service.dart`
- CI/CD: `.github/workflows/flutter-ci-cd.yml`

### External Tools
- Sentry: https://sentry.io/
- Firebase Console: https://console.firebase.google.com/
- GitHub Actions: https://github.com/settings/actions

## 🎯 Next Steps

1. **Right Now**: Read `PHASE5_GETTING_STARTED.md` (10 min read)
2. **Today**: Set up Firebase Remote Config and Sentry
3. **Tomorrow**: Run full manual QA (`PHASE5_QA_CHECKLIST.md`)
4. **This Week**: Monitor beta rollout at 10%
5. **Next Week**: Expand to 50%
6. **Following Week**: Full 100% rollout

## 📝 Notes

- All Phase 1-4 (Foundation, Core Screens, Secondary Features, Testing) are **complete**
- All tests should pass before launch (`flutter test --coverage`)
- React Native version remains available as fallback for 2-4 weeks
- Easy rollback via feature flag if critical issues found
- Monitoring dashboards track everything automatically

---

**Last updated**: 2026-06-28  
**Status**: Ready for Phase 5 Launch  
**Version**: 1.0

