#!/bin/bash

# Flutter Project Verification Script
# This script checks if your Flutter environment is ready to build ShareRide

echo "🔍 Flutter Setup Verification Script"
echo "===================================="
echo ""

# Check 1: Flutter installed
echo "1️⃣  Checking Flutter installation..."
if command -v flutter &> /dev/null; then
    FLUTTER_VERSION=$(flutter --version)
    echo "✅ Flutter found: $FLUTTER_VERSION"
else
    echo "❌ Flutter not found in PATH"
    echo "   Install from: https://flutter.dev/docs/get-started/install"
    exit 1
fi
echo ""

# Check 2: Dart version
echo "2️⃣  Checking Dart installation..."
if command -v dart &> /dev/null; then
    DART_VERSION=$(dart --version)
    echo "✅ Dart found: $DART_VERSION"
else
    echo "❌ Dart not found"
    exit 1
fi
echo ""

# Check 3: Android SDK
echo "3️⃣  Checking Android SDK..."
if [ -n "$ANDROID_SDK_ROOT" ]; then
    echo "✅ ANDROID_SDK_ROOT set: $ANDROID_SDK_ROOT"
else
    echo "⚠️  ANDROID_SDK_ROOT not set (needed for Android builds)"
    echo "   Set it: export ANDROID_SDK_ROOT=~/.android/sdk"
fi
echo ""

# Check 4: Project structure
echo "4️⃣  Verifying project structure..."
PROJECT_DIR="flutter_app"

if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Project directory '$PROJECT_DIR' not found"
    exit 1
fi

required_files=(
    "$PROJECT_DIR/pubspec.yaml"
    "$PROJECT_DIR/lib/main.dart"
    "$PROJECT_DIR/android/settings.gradle"
    "$PROJECT_DIR/android/app/build.gradle"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ Missing: $file"
    fi
done
echo ""

# Check 5: Dependencies resolution
echo "5️⃣  Checking dependency resolution..."
cd "$PROJECT_DIR" || exit

if flutter pub get --offline 2>&1 | grep -q "Could not find"; then
    echo "⚠️  Offline mode failed, trying online..."
    if flutter pub get; then
        echo "✅ Dependencies resolved online"
    else
        echo "❌ Failed to resolve dependencies"
        echo "   Run: flutter pub get --verbose"
        exit 1
    fi
else
    echo "✅ Dependencies available"
fi
echo ""

# Check 6: Dart analysis
echo "6️⃣  Running Dart analysis..."
if flutter analyze --no-pub; then
    echo "✅ No analysis errors"
else
    echo "⚠️  Analysis warnings or errors found"
    echo "   Review output above"
fi
echo ""

# Check 7: Test compilation
echo "7️⃣  Checking test files..."
if [ -f "test/performance_test.dart" ]; then
    echo "✅ Test files present"
else
    echo "❌ Test files missing"
fi
echo ""

# Summary
echo "Summary:"
echo "========"
if [ $? -eq 0 ]; then
    echo "✅ Environment looks ready for building"
    echo ""
    echo "Next steps:"
    echo "  • Android: flutter build apk --debug"
    echo "  • iOS: flutter build ios --debug"
    echo "  • Tests: flutter test"
else
    echo "⚠️  Some issues found - see above"
fi
