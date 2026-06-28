# Phase 5: Manual QA Checklist

## Pre-Launch QA (Before 10% Rollout)

### Environment Setup
- [ ] Staging environment with test Supabase project
- [ ] Test Firebase project configured (Remote Config, Messaging, Performance)
- [ ] Test Sentry project configured
- [ ] Test devices prepared:
  - Android: 2 devices (Android 11, Android 13+)
  - iOS: 2 devices (iOS 15, iOS 17+)
- [ ] Network simulation tools available (Charles Proxy or similar)

### Critical Flow: Login → Browse → Join → Chat → Rate

#### Test 1: Android Device 1 (Android 11)
- [ ] **Login Flow**
  - [ ] App launches without crash
  - [ ] Login screen displays correctly
  - [ ] Enter email address
  - [ ] Tap "Send Code" button
  - [ ] OTP email received
  - [ ] Enter 6-digit OTP code
  - [ ] Tap "Verify"
  - [ ] Successfully redirected to Browse Rides screen
  - [ ] Session persists (close app, reopen → still logged in)

- [ ] **Browse Rides Screen**
  - [ ] Tab navigation shows 5 tabs
  - [ ] Browse tab is selected
  - [ ] Trip list loads within 2 seconds
  - [ ] Trips display: route, cost, departure time, host avatar
  - [ ] Scroll through list smoothly (>50fps)
  - [ ] Pull-to-refresh works
  - [ ] Tap trip → navigates to trip detail

- [ ] **Trip Detail Screen**
  - [ ] Shows full trip info (host, route, cost, seats, description)
  - [ ] "Join Trip" button is clickable
  - [ ] Tap "Join Trip"
  - [ ] Confirmation dialog appears
  - [ ] Confirm join
  - [ ] Match created successfully (status shows "Joined")

- [ ] **Chat Flow**
  - [ ] Navigate to Chat tab
  - [ ] New conversation appears in list
  - [ ] Tap conversation to open chat detail
  - [ ] Message list is empty (no prior messages)
  - [ ] Type test message: "Hello"
  - [ ] Send message
  - [ ] Message appears in list
  - [ ] Message shows timestamp and status (sent)

- [ ] **Rating Flow**
  - [ ] Trip marked as "completed" (simulate in backend)
  - [ ] Rating modal appears
  - [ ] 5-star selection works (tap stars)
  - [ ] Optional review text input
  - [ ] Submit rating
  - [ ] Rating saved successfully
  - [ ] Profile shows updated rating average

- [ ] **Logout**
  - [ ] Navigate to Profile tab
  - [ ] Tap "Logout" button
  - [ ] Redirected to login screen
  - [ ] App state cleared (no cached data visible)

#### Test 2: Android Device 2 (Android 13+)
- Repeat all tests from Test 1

#### Test 3: iOS Device 1 (iOS 15)
- Repeat all tests from Test 1

#### Test 4: iOS Device 2 (iOS 17+)
- Repeat all tests from Test 1

---

### Secondary Features QA

#### Post Ride Screen
- [ ] Navigate to Post tab
- [ ] Form displays correctly:
  - [ ] Route input (map or text)
  - [ ] Departure date picker
  - [ ] Departure time picker
  - [ ] Cost input
  - [ ] Seats available input
  - [ ] Women-only toggle
- [ ] Fill form with test data
- [ ] Tap "Post Ride"
- [ ] Validation works (reject if empty required fields)
- [ ] Trip created and appears in database
- [ ] Appear in "My Offers" tab

#### My Rides Screen
- [ ] Shows two tabs: "Offers" and "Joined"
- [ ] Offers tab shows posted trips
- [ ] Joined tab shows matched trips
- [ ] Can cancel offer (swipe or button)
- [ ] Can cancel match (swipe or button)
- [ ] Cancellation syncs to database

#### Push Notifications
- [ ] Device tokens registered in Supabase
- [ ] Send test notification from Firebase Console
- [ ] Notification received (badge on app icon)
- [ ] Tap notification → opens relevant screen
- [ ] Works in foreground and background

#### Real-Time Chat
- [ ] Open chat on two devices with different users
- [ ] Send message from Device 1
- [ ] Message instantly appears on Device 2 (<500ms)
- [ ] Send message from Device 2
- [ ] Message instantly appears on Device 1
- [ ] Typing indicator appears (if implemented)

#### Deep Linking
- [ ] Generate trip share link
- [ ] Copy link to clipboard
- [ ] Share via SMS/WhatsApp
- [ ] Tap link on device
- [ ] App launches and shows trip detail
- [ ] "Join" button works

---

### Performance QA

#### App Startup Time
- [ ] Cold start (first app launch): measure time to show browse screen
  - Target: <3 seconds
  - Tool: Logcat or Xcode profiler
- [ ] Warm start (app in background, brought to foreground): <1 second

#### Screen Navigation
- [ ] Browse → Detail: <500ms
- [ ] Detail → Chat: <500ms
- [ ] Chat → Profile: <500ms
- [ ] Profile → Browse: <500ms
- [ ] All transitions smooth (no jank)

#### Memory Usage
- [ ] Monitor memory with DevTools
- [ ] Initial load: <100MB
- [ ] After browsing 50 trips: <150MB
- [ ] No memory leaks after 1 hour of use
- [ ] <200MB peak usage

#### Battery Impact
- [ ] Run app for 30 minutes (browsing + chat)
- [ ] Monitor battery drain vs React Native (if available)
- [ ] Real-time chat should not cause excessive wake-ups

#### Network Conditions
- [ ] Test on slow 3G (Charles Proxy throttle)
  - [ ] Queries timeout gracefully (timeout <5s)
  - [ ] Error messages display
  - [ ] Retry works
- [ ] Test offline mode
  - [ ] Cached data displays
  - [ ] Offline actions queue
  - [ ] Sync on reconnect

---

### Crash & Error Handling

#### Crash Reporting
- [ ] Manually trigger null reference (force crash)
- [ ] Crash logged to Sentry within 30 seconds
- [ ] Stack trace is readable (not minified)
- [ ] Breadcrumbs are logged before crash

#### Error Handling
- [ ] Network timeout: graceful error message
- [ ] Auth token expired: force re-login
- [ ] Database query fails: show error + retry button
- [ ] File upload fails: show error + retry option

#### Permission Handling
- [ ] Notification permission: prompt and respect user choice
- [ ] Location permission (if using): prompt appropriately
- [ ] Camera/gallery (if profile photo): request and handle denial

---

### Accessibility QA

#### Screen Reader (TalkBack / VoiceOver)
- [ ] Enable TalkBack (Android) or VoiceOver (iOS)
- [ ] All buttons have labels
- [ ] Form fields are labeled
- [ ] Images have alt text
- [ ] Icon-only buttons have accessibility labels

#### Text Size
- [ ] Scale text to 200% (in device settings)
- [ ] UI doesn't break (no overflow)
- [ ] Text remains readable
- [ ] Buttons remain tappable

#### Contrast
- [ ] All text has sufficient contrast ratio (WCAG AA)
- [ ] No color-only indicators

---

### UI/UX QA

#### Layout Consistency
- [ ] All screens follow Material 3 design guidelines
- [ ] Colors match approved palette (Indigo primary, Emerald secondary)
- [ ] Spacing and padding consistent throughout
- [ ] Font sizes match design spec

#### Responsiveness
- [ ] Works on devices from 4.5" to 6.7" screens
- [ ] Landscape orientation supported (or gracefully handled)
- [ ] Tab navigation doesn't overflow

#### Empty States
- [ ] No trips available → show "No trips found" message
- [ ] No chat messages → show "No messages yet"
- [ ] No my offers → show "No offers posted"
- [ ] Loading states show spinner

#### Error States
- [ ] Failed to load trips → show error + reload button
- [ ] Failed to send message → show error + retry button
- [ ] Failed to join trip → show specific error message

---

### Platform-Specific QA

#### Android
- [ ] Back button behavior (navigation stack correct)
- [ ] Hardware back button closes app (from browse screen)
- [ ] Soft keyboard hides on page navigation
- [ ] Status bar color matches theme
- [ ] Notch handling (devices with notch)

#### iOS
- [ ] Safe area insets respected (notch, Dynamic Island)
- [ ] Swipe back gesture works
- [ ] Status bar is readable against background
- [ ] iOS 15+ features work (if used)
- [ ] Share sheet works for trip links

---

### Database Integrity

#### Data Sync
- [ ] Create trip on Device 1
- [ ] Appears on Device 2 within 3 seconds
- [ ] Join trip on Device 2
- [ ] Match appears on Device 1 within 3 seconds
- [ ] Send message on Device 1
- [ ] Appears on Device 2 within 500ms

#### Data Consistency
- [ ] No duplicate trips in list
- [ ] Trip details always match database
- [ ] User profiles show correct info
- [ ] Ratings calculate correctly

#### Offline Capability
- [ ] Browse cached trips offline
- [ ] Compose message offline (queued)
- [ ] Send queued messages when online
- [ ] No data loss on reconnect

---

## Issues Tracking

### Bug Report Template
```
**Device**: [Android 13, iOS 16, etc.]
**App Version**: [1.0.0]
**Steps to Reproduce**:
1. Do X
2. Do Y
3. Expected: Z
4. Actual: A

**Logs**:
```
logcat output or Xcode console output
```

**Severity**: Critical / High / Medium / Low
**Suggested Fix**: (optional)
```

---

## Sign-Off

- [ ] QA Engineer Name: _________________ Date: _____
- [ ] Tech Lead Review: _________________ Date: _____
- [ ] Product Owner Approval: __________ Date: _____

### Notes:
```
[Add any notes about known issues, workarounds, or follow-ups]
```

---

## Phase 5 Launch Approval

Once all QA checks pass:
- [ ] Approved for 10% rollout to beta testers
- [ ] Approved for 50% rollout (Week 2)
- [ ] Approved for 100% rollout (Week 3)

