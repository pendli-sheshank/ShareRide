# iOS Setup Checklist for ShareRide

Complete iOS project generation and Firebase configuration on a macOS machine.

## Prerequisites
- ✅ macOS 12.0 or later
- ✅ Xcode 15.0 or later
- ✅ Flutter SDK installed
- ✅ CocoaPods installed (`sudo gem install cocoapods`)
- ✅ Internet connection

## Step 1: Generate iOS Project Files

**Location:** ShareRide/flutter_app/

```bash
cd flutter_app
flutter clean
flutter pub get
flutter create . --platforms=ios --org com.sawaarishare
```

**What this generates:**
- `ios/Runner.xcodeproj/` - Xcode project file (binary)
- `ios/Runner/` - iOS app source files
- `ios/Flutter/` - Flutter configuration
- `ios/Pods/` - CocoaPods dependencies
- Updated `ios/Podfile` with proper configuration

**Expected output:**
```
Creating project...
✓ Created Flutter project
✓ iOS files created
```

## Step 2: Open Project in Xcode

```bash
open ios/Runner.xcodeproj
```

Or in Xcode:
1. File > Open
2. Select `flutter_app/ios/Runner.xcodeproj`

## Step 3: Add GoogleService-Info.plist to Xcode

**File Location:** `flutter_app/ios/GoogleService-Info.plist` (already provided)

**In Xcode:**

1. In the Project Navigator (left panel), right-click on **Runner**
2. Select **Add Files to "Runner"**
3. Navigate to `flutter_app/ios/GoogleService-Info.plist`
4. ✅ Check: **"Copy items if needed"**
5. ✅ Check: **Runner** is selected as target
6. Click **Add**

**Verify:**
- GoogleService-Info.plist appears in Runner folder in Xcode
- It's listed under "Runner" target in Build Phases > Copy Bundle Resources

## Step 4: Add Firebase via Swift Package Manager

**In Xcode:**

1. Go to **File > Add Packages...**
2. Enter Firebase iOS SDK URL:
   ```
   https://github.com/firebase/firebase-ios-sdk
   ```
3. Select version: **Latest (default)** or specific version
4. Click **Add Package**

### Select Firebase Libraries

When Xcode prompts, select these packages:

- ✅ **FirebaseCore** (required)
- ✅ **FirebaseAnalytics**
- ✅ **FirebaseCrashlytics**
- ✅ **FirebaseMessaging**
- ✅ **FirebaseRemoteConfig**
- ✅ **FirebaseAuth**

**For each package:**
- Select **Runner** as target
- Click **Finish**

**Repeat for all 6 packages above.**

Xcode will show progress: "Resolving package versions..."

Wait for completion (can take 2-5 minutes).

## Step 5: Verify Firebase Installation

**In Xcode Build Phases:**

1. Select **Runner** project (left panel)
2. Select **Runner** target
3. Go to **Build Phases** tab
4. Expand **Link Binary With Libraries**
5. Verify these frameworks are present:
   - FirebaseCore.framework
   - FirebaseCrashlytics.framework
   - FirebaseAnalytics.framework
   - FirebaseMessaging.framework
   - FirebaseRemoteConfig.framework
   - FirebaseAuth.framework

## Step 6: Build and Test

```bash
cd flutter_app

# Clean and rebuild
flutter clean
flutter pub get
flutter build ios --release --no-codesign
```

**Expected output:**
```
Running Xcode build...
✓ Built for device
✓ Build complete
```

## Step 7: Commit iOS Files to Repository

**After successful build, commit:**

```bash
# From ShareRide root directory
git add flutter_app/ios/

git status
# Should show new files:
# - ios/Runner.xcodeproj/
# - ios/Runner/
# - ios/Flutter/
# - ios/Pods/ (if included)
# - Updated ios/Podfile.lock

git commit -m "Generate iOS project files and add Firebase integration

- Generated Runner.xcodeproj with Xcode 15
- Created Runner app source files
- Added Firebase libraries via Swift Package Manager
- Configured GoogleService-Info.plist
- iOS app ready for development and testing

Firebase SDKs included:
- FirebaseCore (base SDK)
- FirebaseAnalytics (event tracking)
- FirebaseCrashlytics (crash reporting)
- FirebaseMessaging (push notifications)
- FirebaseRemoteConfig (feature flags)
- FirebaseAuth (authentication)

The app initializes Firebase automatically via main.dart."

git push origin claude/supabase-mcp-setup-46mygk
```

## Step 8: Verify Everything Works

```bash
# Run on iOS simulator
flutter run -d ios

# Or on physical device
flutter run -d <device-id>
```

**Check in console:**
```
[firebase] Firebase initialized successfully
Launching app...
✓ App started on iOS
```

## Troubleshooting

### "Cannot find GoogleService-Info.plist"
- Verify file is in `flutter_app/ios/`
- Add it to Xcode using File > Add Files
- Ensure it's under Runner target

### "Module not found: FirebaseCore"
- Run `flutter clean && flutter pub get`
- Delete `ios/Pods` and `ios/Podfile.lock`
- Rebuild: `flutter build ios`

### "Pods could not be integrated"
```bash
cd ios
pod install --repo-update
cd ..
flutter pub get
```

### Xcode build fails
1. Product > Clean Build Folder
2. Close Xcode
3. Run: `flutter clean`
4. Reopen: `open ios/Runner.xcodeproj`
5. Rebuild

### GoogleService-Info.plist not recognized
- Right-click on file in Xcode
- File Inspector (right panel)
- Verify Target Membership shows **Runner** ✅

## File Structure After Setup

```
flutter_app/
├── ios/
│   ├── GoogleService-Info.plist       ✅ (Firebase config)
│   ├── Podfile                        ✅ (CocoaPods setup)
│   ├── Podfile.lock                   ✅ (Dependency lock)
│   ├── Runner.xcodeproj/              ✅ (Xcode project - NEW)
│   │   ├── project.pbxproj
│   │   └── xcshareddata/
│   ├── Runner/                        ✅ (App source - NEW)
│   │   ├── GeneratedPluginRegistrant.swift
│   │   ├── AppDelegate.swift
│   │   └── Main.storyboard
│   ├── Flutter/                       ✅ (Flutter config - NEW)
│   │   ├── Generated.xcconfig
│   │   └── Release.xcconfig
│   └── Pods/                          ✅ (Dependencies - NEW)
│       ├── Podfile.lock
│       └── <Firebase frameworks>
├── lib/
│   └── main.dart                      ✅ (Firebase initialization)
└── pubspec.yaml
```

## Next Steps After iOS Setup

1. ✅ iOS project generated and committed
2. Test iOS app with Firebase
3. Verify Crashlytics receives test crashes
4. Test Firebase Remote Config feature flags
5. Test Firebase Cloud Messaging notifications

## Summary

- **Time Required:** 15-30 minutes
- **Requires:** macOS with Xcode
- **Result:** Fully configured iOS app with Firebase
- **Commit:** Single commit with all iOS files

---

**Need help?** Refer to:
- FIREBASE_IOS_SETUP.md - Detailed Firebase setup guide
- Flutter iOS Documentation: https://flutter.dev/docs/deployment/ios
- Firebase iOS Setup: https://firebase.google.com/docs/ios/setup
