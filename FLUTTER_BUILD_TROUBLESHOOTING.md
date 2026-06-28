# Flutter Build Troubleshooting Guide

## Quick Diagnosis: Check CI/CD Logs

The most important first step is to view the actual error messages from the GitHub Actions CI/CD:

1. Go to: https://github.com/pendli-sheshank/ShareRide/actions
2. Click the failing workflow run
3. Click the "Build Android APK" or "Build iOS IPA" job
4. Scroll to the error section (usually near the bottom)
5. Look for error messages like:
   - `error: Could not resolve...` (dependency issue)
   - `FAILURE: Build failed...` (Gradle configuration issue)
   - `Exception: ...` (plugin or setup issue)

## Local Testing (Most Reliable)

Test the build locally before expecting CI/CD to work:

```bash
cd flutter_app

# Install dependencies
flutter pub get

# Check for analysis errors
flutter analyze

# Run tests
flutter test

# Build Android (requires Android SDK)
flutter build apk --debug -v  # Add -v for verbose output to see errors

# Build iOS (requires macOS + Xcode)
flutter build ios --debug -v
```

The `-v` flag shows detailed output that reveals the actual problem.

## Common Issues and Solutions

### Issue 1: "Flutter SDK not found"
**Error**: `Flutter SDK not found. Define location with flutter.sdk in the local.properties file.`

**Solution**:
```bash
# Locally, run:
flutter doctor -v  # Shows Flutter SDK location

# In CI/CD, ensure `flutter` command is available:
# - Use Flutter action (GitHub Actions)
# - Or install Flutter explicitly before running build
```

### Issue 2: "Gradle sync failed"
**Error**: `failed to resolve dependency` or `Unable to find:...`

**Solution**:
- Check internet connection in CI/CD
- Add google() and mavenCentral() repositories
- Clear Gradle cache: `rm -rf ~/.gradle/caches`
- Update Gradle: `flutter clean` then `flutter pub get`

### Issue 3: "Android SDK/NDK not found"
**Error**: `failed to find Build Tools` or `Android SDK not found`

**Solution in CI/CD**:
```yaml
# In .github/workflows/flutter-ci-cd.yml
- name: Setup Android SDK
  uses: android-actions/setup-android@v2
  with:
    api-levels: 34
    ndk-version: 25.2.9519653
```

### Issue 4: "Plugin not found: dev.flutter.flutter-gradle-plugin"
**Error**: `Plugin [id: 'dev.flutter.flutter-gradle-plugin'] was not found`

**Solution**:
- Ensure `pluginManagement` section in `android/settings.gradle` correctly loads Flutter Gradle plugin
- Flutter version must be >= 3.0
- Run `flutter pub get` before building

### Issue 5: "Kotlin compilation error"
**Error**: `w: ... please specify a JVM target version`

**Already fixed**: `kotlinOptions { jvmTarget = '1.8' }` is set in `android/app/build.gradle`

### Issue 6: "Version name or code not found"
**Error**: `flutterVersionCode and flutterVersionName not defined`

**Solution**:
- Ensure Flutter Gradle plugin is properly loaded
- Add to `android/app/build.gradle`:
  ```gradle
  def flutterVersionCode = localProperties.getProperty('flutter.versionCode')
  def flutterVersionName = localProperties.getProperty('flutter.versionName')
  if (flutterVersionCode == null) { flutterVersionCode = '1' }
  if (flutterVersionName == null) { flutterVersionName = '1.0.0' }
  ```

## Current Repository State

✅ **What's fixed**:
- Dart code compiles (no import errors)
- All Phase 1-4 screens and services present
- Phase 5 infrastructure in place (disabled)
- Android manifest and entry point configured
- App icon resources created
- Gradle build scripts present

❌ **What's unknown**:
- Exact native build failure (need CI/CD logs)
- iOS XCode project status (minimal Podfile only)
- Specific dependency version conflicts
- Platform-specific build tool versions

## Regeneration Option

If local debugging shows the native files are the issue, regenerate them:

```bash
cd flutter_app

# Backup your work
cp -r lib lib.backup

# Regenerate native files (this overwrites android/ and ios/)
flutter create . --project-name shareride

# Restore any customizations
# Compare lib.backup with lib to ensure nothing was lost
```

**Warning**: This may overwrite custom Android/iOS configuration. Use only if existing files are broken beyond repair.

## Next Steps

1. **Check CI/CD Logs**: View actual error messages from GitHub Actions
2. **Run Locally**: Build on your machine with `-v` flag to see detailed errors
3. **Post Error Details**: Share the exact error message when asking for help
4. **Try Minimal Rebuild**: If needed, regenerate native files as described above

## CI/CD Workflow Review

Current workflow file: `.github/workflows/flutter-ci-cd.yml`

Jobs that must pass:
- `test` - Unit & Widget Tests (marked `continue-on-error: true`, scaffold phase)
- `performance` - Performance Benchmarks (marked `continue-on-error: true`, scaffold phase)
- `build-android` - Must succeed for deployment
- `build-ios` - Marked `continue-on-error: true`, Android-first priority

The workflow depends on:
1. Flutter SDK being available
2. Android SDK/NDK available (for APK build)
3. XCode/macOS (for iOS build on macOS runner)

## Key Files to Check

If debugging locally, verify these exist:
```
flutter_app/
├── android/
│   ├── settings.gradle ✅
│   ├── build.gradle ✅
│   ├── gradle.properties ✅
│   └── app/
│       ├── build.gradle ✅
│       └── src/main/
│           ├── AndroidManifest.xml ✅
│           └── kotlin/com/shareride/app/MainActivity.kt ✅
├── ios/
│   └── Podfile ✅ (but XCode files missing)
├── lib/ ✅ (complete)
├── pubspec.yaml ✅
└── .env (created, placeholder values)
```

## Getting Help

When asking for help with build issues, provide:
1. Full error message from CI/CD or local build
2. Flutter version: `flutter --version`
3. Android SDK info: `flutter doctor -v`
4. Command that failed (e.g., `flutter build apk --release`)
5. Last 20 lines of error output

---

**Last updated**: 2026-06-28  
**Status**: Dart compilation fixed, native build requires detailed error analysis
