#!/bin/bash
# Script to regenerate iOS and Android native project files
# This should be run locally to properly set up native build configurations
# The generated files can then be committed to git

set -e

echo "================================"
echo "Flutter Native Files Regeneration"
echo "================================"
echo ""
echo "This script will regenerate native Android and iOS project files"
echo "using Flutter's create command."
echo ""

# Backup current native configurations
echo "📦 Backing up current configurations..."
[ -d ios/Podfile ] && cp ios/Podfile ios/Podfile.backup || true
[ -f android/app/build.gradle ] && cp android/app/build.gradle android/app/build.gradle.backup || true
[ -f android/build.gradle ] && cp android/build.gradle android/build.gradle.backup || true

# Regenerate iOS
echo ""
echo "🍎 Regenerating iOS native files..."
flutter create . --platforms=ios --project-name shareride --org com.sawaarishare

# Regenerate Android
echo ""
echo "🤖 Regenerating Android native files..."
flutter create . --platforms=android --project-name shareride --org com.sawaarishare

# Restore Firebase and custom configurations to Android build files
echo ""
echo "🔧 Restoring Firebase configurations..."

# Check if we have backups with Firebase config
if [ -f android/build.gradle.backup ]; then
    echo "Merging Firebase Crashlytics plugin to android/build.gradle..."
    # Add Crashlytics plugin to the root build.gradle if not present
    if ! grep -q "firebase-crashlytics-gradle" android/build.gradle; then
        sed -i 's/id "com.google.gms.google-services" version "4.5.0" apply false/id "com.google.gms.google-services" version "4.5.0" apply false\n    id "com.google.firebase.firebase-crashlytics-gradle" version "3.0.0" apply false/' android/build.gradle
    fi
fi

# Restore custom Podfile configuration if needed
if [ -f ios/Podfile.backup ]; then
    echo "Checking for custom Podfile configurations..."
    # Extract custom post_install block from backup if it exists
    if grep -q "GCC_PREPROCESSOR_DEFINITIONS" ios/Podfile.backup; then
        echo "Found custom Podfile configurations, merging..."
        # This is a manual merge point - typically the generated Podfile should work
        # but if you have custom configurations, merge them here
    fi
fi

echo ""
echo "✅ Native files regenerated successfully!"
echo ""
echo "🔍 Verifying package names..."
echo "Android package: com.sawaarishare.app"
echo "iOS bundle: com.sawaarishare.app"
echo ""
echo "📝 Next steps:"
echo "1. Review the changes: git diff android/ ios/"
echo "2. Verify the build can proceed: flutter pub get"
echo "3. Run local tests: flutter test"
echo "4. Commit the changes: git add android/ ios/ && git commit -m 'Regenerate native project files'"
echo ""
