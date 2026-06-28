# Phase 5: React Native Deprecation & Cleanup

## Timeline & Milestones

### Week 1: Soft Launch (Days 1-7)
**Status: Preparing for rollout**

#### Pre-Launch Checklist
- [ ] All Phase 4 tests passing (75%+ coverage)
- [ ] Manual QA on 4+ real devices (Android 11, 13+; iOS 15, 17+)
- [ ] Sentry crash reporting configured and tested
- [ ] Firebase Performance Monitoring enabled
- [ ] Feature flags configured in Firebase Remote Config (rollout_percentage = 0)
- [ ] Metrics dashboard ready (crash rate, session time, feature adoption)
- [ ] User feedback channel active (in-app "Send Feedback" button)
- [ ] Release notes prepared for App Store / Play Store

#### Launch Activities (Day 1)
1. Set `flutter_rollout_percentage = 10` in Firebase Remote Config
2. Deploy Flutter build to Firebase App Distribution (beta testers)
3. Monitor crash rate every 2 hours (alert if >0.5%)
4. Check Sentry dashboard for error patterns
5. Monitor Firebase Performance metrics:
   - App startup time
   - Screen load times
   - API latency
   - Memory usage

#### Daily Monitoring (Days 2-7)
- [ ] Crash rate stable (< 0.1% of sessions)
- [ ] Zero critical bugs reported
- [ ] Performance metrics within targets (startup <3s, queries <2s)
- [ ] User feedback: No severe issues
- [ ] Conversions tracking: 10% of users successfully login → browse → join

#### End of Week 1 Review
- [ ] Approve rollout expansion to 50%
- [ ] OR pause rollout if crash rate spikes or critical bugs found

---

### Week 2: Gradual Expansion (Days 8-14)
**Status: Expanding to 50%**

#### Expansion Activities (Day 8)
1. Set `flutter_rollout_percentage = 50` in Firebase Remote Config
2. Push new build to Play Store / App Store (production)
3. Update release notes: "ShareRide is now running on Flutter for better performance!"
4. Increase monitoring frequency (check metrics every hour)

#### Daily Monitoring (Days 9-14)
- [ ] Crash rate remains stable or improves
- [ ] No increase in error rate at 50% milestone
- [ ] Performance metrics still within targets
- [ ] User retention: Tracked via Firebase Analytics
- [ ] Review user feedback daily for patterns

#### Engagement Metrics
- Login completion rate (% of users who complete auth)
- Browse-to-join conversion (% of users who browse → join trip)
- Chat engagement (% of users who send/receive messages)
- Session duration (should be ≥ React Native baseline)

#### End of Week 2 Review
- [ ] Approve full rollout to 100%
- [ ] OR pause and investigate if issues detected

---

### Week 3: Full Rollout (Days 15-21)
**Status: 100% of users on Flutter**

#### Rollout Activities (Day 15)
1. Set `flutter_rollout_percentage = 100` in Firebase Remote Config
2. All new installs default to Flutter version
3. Existing React Native users updated on next app open
4. Keep React Native binary as fallback (still available in older builds)

#### Daily Monitoring (Days 16-21)
- [ ] Crash rate monitoring (alert if exceeds production threshold)
- [ ] Performance metrics verification (all targets met)
- [ ] User feedback channels (actively triage issues)
- [ ] Conversion funnel tracking (ensure no drop-off)

#### Contingency: Rollback Procedure
If crash rate exceeds 1% or critical feature breaks:
1. Set `flutter_rollout_percentage = 50` (immediate rollback to half)
2. Investigate root cause via Sentry
3. Create hotfix on Flutter side or revert to React Native

---

### Week 4: Stabilization & Deprecation (Days 22-28)
**Status: React Native Fallback Ready**

#### Activities (Day 22)
1. React Native still available as fallback
2. New crash patterns should have subsided
3. User satisfaction survey (in-app prompt)
4. Performance optimization pass if needed

#### React Native Deprecation Decision
- [ ] Zero critical issues from Flutter 1 week post-100% rollout
- [ ] User retention equals or exceeds React Native baseline
- [ ] Crash rate stable at <0.5% of sessions

#### If All Metrics Green (Day 25+)
1. Set `use_react_native_fallback = false` in Firebase Remote Config
2. Stop building new React Native releases
3. Remove React Native from GitHub Actions CI/CD
4. Archive React Native code:
   ```bash
   git checkout -b archive/react-native-legacy
   # Keep for reference but stop active development
   ```

#### Final Cleanup (Day 28)
- [ ] React Native code deleted from main branch
- [ ] Documentation updated (Flutter-only)
- [ ] All RN-related CI/CD workflows removed
- [ ] Issues/PRs referencing RN closed

---

## Monitoring Dashboard Setup

### Metrics to Track

#### Crash Reporting (Sentry)
```
Dashboard: https://sentry.io/projects/shareride/

Key Metrics:
- Overall crash rate (% of sessions)
- Top 10 crash types
- Crash rate by screen
- Crash rate by OS version (Android 11, 12, 13+)
- New crash patterns (alert on spike)

Alerts:
- Crash rate > 1%: Page Ops
- Crash rate > 0.5%: Notify team Slack
- New crash with 10+ occurrences: Auto-create GitHub issue
```

#### Performance Monitoring (Firebase)
```
Dashboard: https://firebase.google.com/console/

Metrics:
- App startup time (target: <3s, alert if >4s)
- Screen load times:
  - Browse Rides: <2s
  - Post Ride: <3s
  - Chat: <2s
  - Profile: <1s
- API latency (queries: <2s, chat: <500ms)
- Frame rate (target: >50fps during scroll)
- Memory usage (target: <200MB)
- Battery impact (vs React Native baseline)

Alerting:
- Startup time regression detected
- Screen latency spike (>2x baseline)
- Memory growth trend
```

#### User Analytics (Firebase)
```
Dashboard: https://firebase.google.com/console/

Funnel Tracking:
1. App Launch → 2. Login Attempt → 3. Login Success → 
4. Browse Screen → 5. View Trip Details → 6. Join Trip → 
7. Chat Open → 8. Message Send

Goals:
- 90%+ completion at each step
- Compare Flutter vs React Native (if parallel testing)

Retention:
- Day 1 retention (% users who open app next day): >70%
- Day 7 retention: >50%
- Day 30 retention: >30%
```

#### Version Metrics
```
Daily Reports:
- % of users on Flutter version
- % of users still on React Native
- Average version age (days)
```

---

## CI/CD Pipeline Configuration

### GitHub Actions Workflow
See: `.github/workflows/flutter-ci-cd.yml`

Runs on every push and PR:
1. ✅ Unit & Widget Tests (target: 75%+ coverage)
2. ✅ Performance Benchmarks (all must pass)
3. ✅ Build Android APK
4. ✅ Build iOS IPA
5. ✅ Deploy to Firebase App Distribution (beta channel)
6. ✅ Notify team of build status

### Required Secrets (GitHub)
```
FIREBASE_CREDENTIALS    # Service account JSON from Firebase
FIREBASE_APP_ID         # App ID from Firebase Console
GOOGLE_PLAY_KEY         # Google Play signing key (for Play Store)
APPLE_SIGNING_KEY       # Apple signing certificate (for App Store)
SENTRY_AUTH_TOKEN       # Token for source maps upload
```

### Deployment Steps

#### Deploy to Beta (Firebase App Distribution)
```bash
# Automatic on commit to claude/kmp-vs-react-native-m51ceo
# Testers: beta-testers@example.com
# Download via Firebase App Tester app
```

#### Deploy to Production (App Store / Play Store)
```bash
# Manual trigger via GitHub Actions
# OR automatic when tag created: git tag v1.0.0 && git push origin v1.0.0
```

---

## User Communication Plan

### Week 1 (Soft Launch)
**Target: Beta testers only**

Message: "We're testing a new version of ShareRide built with Flutter for better performance and reliability. Thank you for helping us test!"

### Week 2 (Gradual Expansion)
**Target: All users (50% rollout)**

Message: "ShareRide now runs on Flutter! This new foundation provides better performance, stability, and features. Update your app to get the best experience."

### Week 3 (Full Rollout)
**Target: 100% of users**

Message: "All ShareRide users are now on the new Flutter version. If you experience any issues, please use the feedback button in Settings."

### Week 4+ (Deprecation)
**Target: Users still on old React Native version**

Message: "Your version of ShareRide is outdated. Please update from the App Store / Play Store to continue using the app."

---

## Rollback Procedure

### Immediate Rollback (Crash Rate >1%)
1. Set `flutter_rollout_percentage = 0` in Firebase Remote Config
2. All new users routed back to React Native
3. Existing Flutter users see "Please update" prompt + option to downgrade
4. Investigate root cause in Sentry
5. Create hotfix or revert problematic change

### Gradual Rollback (Crash Rate 0.5-1%)
1. Set `flutter_rollout_percentage = 25` (reduce rollout)
2. Monitor for next 6-12 hours
3. If stable, escalate to 50% again
4. If still issues, continue with immediate rollback

### Metrics That Trigger Rollback
- Crash rate increases by >50% from baseline
- Critical feature entirely broken (auth, chat, browsing)
- Memory leak causing OOM crashes
- Battery drain >2x React Native baseline
- Uncontrolled error logging

---

## Post-Launch Monitoring (Weeks 4+)

### Daily Checks
- Sentry: Any new crash patterns?
- Firebase: Performance metrics trending?
- Analytics: Retention metrics OK?
- User feedback: Patterns or themes?

### Weekly Reports
- Crash rate trend
- Performance metrics summary
- User retention & engagement
- Feature adoption (which screens most used)
- Feedback themes (what do users want?)

### Monthly Review (30 days post-launch)
- Is Flutter version production-ready? YES → Deprecate React Native
- Any long-term performance issues? If yes → Optimize
- Should any features be rolled back? If yes → Plan hotfix
- User satisfaction score from survey

---

## Final Cleanup Tasks

Once Flutter is stable (30+ days in production with <0.3% crash rate):

### 1. Remove React Native Code
```bash
cd /home/user/ShareRide
# Archive React Native for history
git checkout -b archive/react-native-legacy
# Delete from main
rm -rf app/
git commit -m "Remove React Native (archived in archive/react-native-legacy)"
git push origin main
```

### 2. Update Documentation
- [ ] README.md: Flutter-only setup instructions
- [ ] CLAUDE.md: Remove React Native references
- [ ] docs/: Update all architecture diagrams
- [ ] Delete: docs/REACT_NATIVE_SETUP.md (if exists)

### 3. Clean Up CI/CD
- [ ] Delete: `.github/workflows/react-native-*.yml`
- [ ] Delete: Expo EAS builds configuration
- [ ] Keep: Flutter CI/CD only (`.github/workflows/flutter-ci-cd.yml`)

### 4. Close Stale Issues/PRs
- [ ] Find all RN-related issues: `label:react-native`
- [ ] Close with message: "Closing as React Native version has been deprecated"

### 5. Notify Users (In-App)
Add one-time notification:
```
"ShareRide is now Flutter-only. You must update your app. 
[Update Now] button links to App Store/Play Store"
```

---

## Success Criteria

✅ **Phase 5 is complete when:**

1. **Adoption**: 99%+ of users on Flutter version
2. **Stability**: Crash rate <0.3% (lower than React Native baseline)
3. **Performance**: All metrics within targets (startup <3s, queries <2s, memory <200MB)
4. **Manual QA**: All flows tested on real Android + iOS devices
5. **User Satisfaction**: No mass user churn; feedback is positive
6. **Code**: React Native deleted; Flutter-only codebase
7. **Infrastructure**: CI/CD optimized for Flutter only

---

## Estimated Timeline Summary

| Phase | Duration | Rollout % | Status |
|-------|----------|-----------|--------|
| Soft Launch | 7 days | 10% | Week 1 |
| Gradual Expansion | 7 days | 50% | Week 2 |
| Full Rollout | 7 days | 100% | Week 3 |
| Stabilization | 7 days | 100% | Week 4 |
| Deprecation Complete | N/A | 100% | Day 28+ |

**Total: 4 weeks (28 days) for full rollout + stabilization**

---

## References

- Test Coverage: `flutter_app/TEST_README.md`
- Architecture: `docs/PRD-v1.1.md`
- Monitoring: `flutter_app/lib/services/monitoring_service.dart`
- Feature Flags: `flutter_app/lib/services/feature_flags_service.dart`
- Remote Config: `flutter_app/lib/config/firebase_remote_config.dart`
- CI/CD: `.github/workflows/flutter-ci-cd.yml`

---

## Contact & Escalation

**On-Call Team**: @shareride-devops
**Sentry Alerts**: Team Slack #errors channel
**Performance Issues**: Discuss in #performance-review weekly
**User Feedback**: Triage daily from in-app feedback form

---

Last updated: 2026-06-28
Status: Ready for Phase 5 Launch
