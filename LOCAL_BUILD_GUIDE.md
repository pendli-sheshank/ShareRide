# Local Flutter Build Guide for ShareRide

## Quick Start

This guide helps you build and test the Flutter app locally before worrying about CI/CD.

### Prerequisites
- **Flutter**: >= 3.0 (Install from https://flutter.dev/docs/get-started/install)
- **Dart**: Included with Flutter
- **Android SDK**: Required for Android builds
- **Xcode**: Required for iOS builds (macOS only)

## Step 1: Verify Your Environment

Run the included verification script:

```bash
bash verify_flutter_setup.sh
```

This checks:
- ✅ Flutter and Dart installation
- ✅ Android SDK configuration  
- ✅ Project structure
- ✅ Dependency resolution
- ✅ Dart analysis

If everything passes, proceed to Step 2.

## Step 2: Get Dependencies

```bash
cd flutter_app
flutter pub get
```

**Expected output**: Should download and resolve all dependencies (may take 2-3 minutes on first run).

**If it fails**: 
```bash
flutter pub get --verbose  # Shows detailed error output
```

Common errors:
- `Could not find SDK version...` → Update Flutter: `flutter upgrade`
- `Failed to resolve dependency` → Check internet connection
- `plugin not found` → Run `flutter clean` then try again

## Step 3: Analyze Code

```bash
flutter analyze
```

**Expected output**: Should show no errors (only warnings are okay for now).

**If it fails**: The error message will show which file has the issue. Common fixes:
- Missing imports → Add to pubspec.yaml
- Circular dependencies → Refactor imports
- Type errors → Fix the Dart code

## Step 4: Run Tests

```bash
flutter test
```

**Expected output**: All tests pass (currently placeholder tests).

```
Performance Benchmarks: All tests passed
✅ 10 tests passed in X seconds
```

## Step 5: Build Android APK

### For Debug Build (Fast, Larger)
```bash
flutter build apk --debug
```

**Output file**: `flutter_app/build/app/outputs/flutter-apk/app-debug.apk`

### For Release Build (Slow, Smaller, Optimized)
```bash
flutter build apk --release
```

**Output file**: `flutter_app/build/app/outputs/flutter-apk/app-release.apk`

### Verbose Output (For Debugging)
```bash
flutter build apk --debug -v  # Shows detailed Gradle output
```

**If it fails**:
1. Check error message from Gradle (usually at the end)
2. Common issues:
   - `SDK not found` → Set `ANDROID_SDK_ROOT` environment variable
   - `Gradle sync failed` → Run `flutter clean` then try again
   - `Build tools not installed` → Install via Android Studio SDK Manager

## Step 6: Build iOS IPA (macOS only)

### For Debug Build
```bash
flutter build ios --debug
```

### For Release Build
```bash
flutter build ios --release
```

### Run on Simulator
```bash
flutter run -d all  # Runs on all available simulators
# Or specifically:
flutter run -d iPhone\ 14  # Runs on iPhone 14 simulator
```

## Step 7: Run on Physical Device

### Android
```bash
flutter devices  # Lists connected devices

flutter run -d <device-id>
# Example: flutter run -d emulator-5554
```

### iOS
```bash
flutter run -d <device-id>
```

## Troubleshooting

### Build Succeeds Locally But Fails in CI/CD

This usually means:
1. Different Flutter/Dart versions
2. Missing environment variables
3. Different SDK versions

**Solution**: Check CI/CD workflow uses same versions:
- `flutter --version`
- `dart --version`  
- `flutter doctor -v` (full diagnostic)

Then update `.github/workflows/flutter-ci-cd.yml` if needed.

### "Flutter SDK not found"

```bash
# Option 1: Set environment variable
export FLUTTER_ROOT=~/flutter  # or wherever Flutter is installed
export PATH="$FLUTTER_ROOT/bin:$PATH"

# Option 2: Use absolute path
~/flutter/bin/flutter build apk
```

### "Android SDK not found"

```bash
# Check where SDK is installed
flutter doctor -v  # Shows SDK path

# Set environment variable
export ANDROID_SDK_ROOT=~/Android/sdk
# Or Windows:
set ANDROID_SDK_ROOT=%USERPROFILE%\Android\sdk
```

### Gradle Daemon Hangs

```bash
# Kill hanging Gradle processes
pkill -f gradle  # macOS/Linux
taskkill /F /IM java.exe  # Windows

# Retry build
flutter build apk --debug
```

### "Dart files out of sync"

```bash
# Clean and rebuild everything
flutter clean
flutter pub get
flutter build apk --debug
```

## Performance Notes

- **First build**: 3-5 minutes (downloads all dependencies)
- **Subsequent builds**: 30 seconds - 1 minute (incremental)
- **Release builds**: Slower than debug (optimizations)
- **iOS builds**: Generally slower than Android

## Success Indicators

When everything works:
1. ✅ `flutter analyze` shows no errors
2. ✅ `flutter test` all tests pass
3. ✅ `flutter build apk --debug` produces an APK file
4. ✅ APK can be installed: `flutter install`
5. ✅ App launches and shows login screen

## CI/CD vs Local

If builds work locally but fail in CI/CD:

**Check these in your CI/CD environment:**
1. Flutter version matches: `flutter --version`
2. Dart version matches: `dart --version`
3. SDK versions match: `flutter doctor -v`
4. Environment variables are set
5. Cache is cleared before building

**Update CI/CD if needed** in `.github/workflows/flutter-ci-cd.yml`

## Next Steps

Once local builds succeed:
1. Commit your working state
2. Push to branch
3. Verify CI/CD builds complete
4. Review test results
5. Deploy to staging

## Getting Help

When posting issues, include:
1. Full error message (last 20 lines of output)
2. `flutter --version`
3. `flutter doctor -v` output
4. Command you ran: e.g., `flutter build apk --release -v`
5. OS and version: macOS 12, Ubuntu 20.04, Windows 11, etc.

---

**Last updated**: 2026-06-28
