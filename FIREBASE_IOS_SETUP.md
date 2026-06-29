# Firebase iOS Setup Guide

This guide covers setting up Firebase for iOS using Swift Package Manager in Xcode.

## Current Status

✅ **GoogleService-Info.plist** - Placed in `flutter_app/ios/`
- Project ID: rideshare-499501
- Bundle ID: com.sawaarishare.app
- GCM Sender ID: 512546373040

⚠️ **iOS Project Files** - Need to be generated
- The Runner.xcodeproj was auto-generated in CI
- Must be committed to the repository before Xcode setup can begin

## Prerequisites

1. **macOS with Xcode 15+** installed
2. **iOS project files generated** from `flutter create .`
3. **GoogleService-Info.plist** in Runner project (provided)

## Step-by-Step Firebase iOS Setup

### 1. Generate iOS Project Files

If iOS project files don't exist yet:

```bash
cd flutter_app
flutter create . --platforms=ios
```

This will create:
- `ios/Runner.xcodeproj` (Xcode project)
- `ios/Runner/` (app source files)
- `ios/Pods/` (CocoaPods dependencies)

### 2. Add GoogleService-Info.plist to Xcode

1. Open `ios/Runner.xcodeproj` in Xcode:
   ```bash
   open ios/Runner.xcodeproj
   ```

2. In Xcode, drag `GoogleService-Info.plist` from `flutter_app/ios/` into the Runner project:
   - Right-click **Runner** > **Add Files to "Runner"**
   - Select `GoogleService-Info.plist`
   - ✅ Check "Copy items if needed"
   - ✅ Select "Runner" as target
   - Click **Add**

### 3. Add Firebase via Swift Package Manager

1. With Xcode open, go to **File > Add Packages**

2. In the search box, enter the Firebase iOS SDK repository:
   ```
   https://github.com/firebase/firebase-ios-sdk
   ```

3. Select the latest stable version (recommended) or specific version

4. Click **Add Package**

5. Choose Firebase libraries to add:
   - ✅ **FirebaseCore** (required base)
   - ✅ **FirebaseAnalytics** (event tracking)
   - ✅ **FirebaseCrashlytics** (crash reporting)
   - ✅ **FirebaseMessaging** (push notifications)
   - ✅ **FirebaseRemoteConfig** (feature flags)
   - ✅ **FirebaseAuth** (authentication)

6. Select **Runner** as the target

7. Click **Finish** and wait for Xcode to download and resolve dependencies

### 4. Configure Podfile (Already Done)

The Podfile is already configured with:
- CocoaPods dependency management
- GCC preprocessor definitions for camera and location permissions
- Proper post_install hooks

No additional changes needed.

### 5. Build and Run

```bash
cd flutter_app
flutter pub get
flutter run -d ios
```

Or build for release:
```bash
flutter build ios --release --no-codesign
```

## Troubleshooting

### "Cannot find GoogleService-Info.plist"
- Verify the file is in the Runner project in Xcode
- Check that it's selected for the Runner target

### Swift Package Manager download fails
- Check internet connection
- Try using a VPN if GitHub is blocked
- Use a specific version instead of latest

### Build fails with "Missing Firebase framework"
- Ensure all selected Firebase libraries are installed
- Run `flutter clean && flutter pub get`
- Rebuild the project

### CocoaPods conflicts
- Run `cd ios && pod update && cd ..`
- Then `flutter pub get && flutter run`

## File Locations

```
flutter_app/
├── ios/
│   ├── GoogleService-Info.plist      (Firebase configuration)
│   ├── Podfile                       (CocoaPods configuration)
│   ├── Runner.xcodeproj/             (Xcode project - auto-generated)
│   ├── Runner/                       (App source - auto-generated)
│   └── Pods/                         (CocoaPods dependencies)
└── lib/
    └── main.dart                     (Firebase initialization)
```

## Environment Configuration

**main.dart** already includes Firebase initialization:
```dart
await Firebase.initializeApp(
  options: DefaultFirebaseOptions.currentPlatform,
);
```

This uses the GoogleService-Info.plist configuration automatically.

## Firebase Services Enabled

✅ Firebase Crashlytics - Crash reporting
✅ Firebase Analytics - Event tracking  
✅ Firebase Cloud Messaging - Push notifications
✅ Firebase Remote Config - Feature flags
✅ Firebase Auth - User authentication
✅ Firebase App Distribution - Beta builds

## Next Steps

1. Generate iOS project files on a macOS machine
2. Add GoogleService-Info.plist to Xcode project
3. Add Firebase libraries via Swift Package Manager
4. Commit ios/Runner.xcodeproj and related files to repository
5. Test Firebase integration with iOS builds

## References

- [Firebase iOS Setup Documentation](https://firebase.google.com/docs/ios/setup)
- [Swift Package Manager in Xcode](https://developer.apple.com/documentation/xcode/adding-package-dependencies-to-your-app)
- [Flutter iOS Build Guide](https://flutter.dev/docs/deployment/ios)
