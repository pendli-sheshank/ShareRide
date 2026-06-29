#!/bin/bash

# iOS Setup Script for ShareRide
# Run this on macOS with Xcode and Flutter installed
# Usage: bash ios_setup.sh

set -e

echo "🚀 ShareRide iOS Setup Script"
echo "=============================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v flutter &> /dev/null; then
    echo "❌ Flutter not found. Please install Flutter first."
    exit 1
fi

if ! command -v xcode-select &> /dev/null; then
    echo "❌ Xcode not found. Please install Xcode from App Store."
    exit 1
fi

if ! command -v pod &> /dev/null; then
    echo "❌ CocoaPods not found. Run: sudo gem install cocoapods"
    exit 1
fi

echo "✅ Flutter: $(flutter --version | head -1)"
echo "✅ Xcode: $(xcode-select -p)"
echo "✅ CocoaPods: $(pod --version)"
echo ""

# Navigate to flutter_app
echo "📁 Navigating to flutter_app..."
cd "$(dirname "$0")/flutter_app"

# Clean and prepare
echo "🧹 Cleaning previous builds..."
flutter clean
flutter pub get

# Generate iOS files
echo ""
echo "🔨 Generating iOS project files..."
flutter create . --platforms=ios --org com.sawaarishare

# Install CocoaPods dependencies
echo ""
echo "📦 Installing iOS dependencies with CocoaPods..."
cd ios
pod install --repo-update
cd ..

# Open in Xcode
echo ""
echo "✅ iOS project generated successfully!"
echo ""
echo "📋 NEXT STEPS (Manual in Xcode):"
echo "================================"
echo ""
echo "1. Open project in Xcode:"
echo "   open ios/Runner.xcodeproj"
echo ""
echo "2. Add GoogleService-Info.plist:"
echo "   - Right-click Runner > Add Files to 'Runner'"
echo "   - Select: ios/GoogleService-Info.plist"
echo "   - ✅ Check 'Copy items if needed'"
echo "   - ✅ Check 'Runner' target is selected"
echo "   - Click Add"
echo ""
echo "3. Add Firebase libraries (File > Add Packages):"
echo "   - URL: https://github.com/firebase/firebase-ios-sdk"
echo "   - Version: Latest (default)"
echo "   - Select these packages:"
echo "     ✅ FirebaseCore"
echo "     ✅ FirebaseAnalytics"
echo "     ✅ FirebaseCrashlytics"
echo "     ✅ FirebaseMessaging"
echo "     ✅ FirebaseRemoteConfig"
echo "     ✅ FirebaseAuth"
echo "   - Target: Runner"
echo ""
echo "4. Build and test:"
echo "   flutter build ios --release --no-codesign"
echo ""
echo "5. Commit iOS files:"
echo "   git add flutter_app/ios/"
echo "   git commit -m 'Generate iOS project files and add Firebase integration'"
echo "   git push origin claude/supabase-mcp-setup-46mygk"
echo ""
echo "📖 Detailed guide: IOS_SETUP_CHECKLIST.md"
echo ""
echo "Press Enter to open Xcode..."
read

echo "🚀 Opening Xcode..."
open ios/Runner.xcodeproj
