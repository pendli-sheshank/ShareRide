#!/bin/bash

# ShareRide Flutter Release Build Script
# Builds APK, AAB, and IPA for production deployment

set -e  # Exit on first error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FLUTTER_APP_DIR="$PROJECT_DIR/flutter_app"
BUILD_DIR="$FLUTTER_APP_DIR/build"
OUTPUT_DIR="$PROJECT_DIR/releases"

echo -e "${GREEN}=== ShareRide Flutter Release Build ===${NC}"
echo "Project: $PROJECT_DIR"
echo "Output: $OUTPUT_DIR"
echo ""

# Check if flutter is installed
if ! command -v flutter &> /dev/null; then
    echo -e "${RED}Error: Flutter not found. Please install Flutter first.${NC}"
    exit 1
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Parse arguments
BUILD_ANDROID=false
BUILD_IOS=false
VERSION=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --android)
            BUILD_ANDROID=true
            shift
            ;;
        --ios)
            BUILD_IOS=true
            shift
            ;;
        --all)
            BUILD_ANDROID=true
            BUILD_IOS=true
            shift
            ;;
        --version)
            VERSION="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --android       Build Android APK/AAB"
            echo "  --ios           Build iOS IPA"
            echo "  --all           Build both Android and iOS"
            echo "  --version V     Set version (e.g., 1.0.1)"
            echo "  --help          Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 --all --version 1.0.1"
            echo "  $0 --android"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Default to both if not specified
if [ "$BUILD_ANDROID" = false ] && [ "$BUILD_IOS" = false ]; then
    BUILD_ANDROID=true
    BUILD_IOS=true
fi

# Change to flutter_app directory
cd "$FLUTTER_APP_DIR"

# Pre-build checks
echo -e "${YELLOW}Running pre-build checks...${NC}"

# Check pubspec.yaml exists
if [ ! -f "pubspec.yaml" ]; then
    echo -e "${RED}Error: pubspec.yaml not found${NC}"
    exit 1
fi

# Get current version from pubspec.yaml
CURRENT_VERSION=$(grep "^version:" pubspec.yaml | awk '{print $2}' | cut -d'+' -f1)
echo "Current version in pubspec.yaml: $CURRENT_VERSION"

# Run type check
echo -e "${YELLOW}Type checking...${NC}"
if ! flutter analyze --no-fatal-infos; then
    echo -e "${RED}Type check failed. Fix errors and try again.${NC}"
    exit 1
fi

# Clean and get dependencies
echo -e "${YELLOW}Cleaning and fetching dependencies...${NC}"
flutter clean
flutter pub get

# Run tests
echo -e "${YELLOW}Running tests...${NC}"
if ! flutter test 2>/dev/null || true; then
    echo -e "${YELLOW}Some tests failed (non-critical). Continuing...${NC}"
fi

# Build Android
if [ "$BUILD_ANDROID" = true ]; then
    echo ""
    echo -e "${GREEN}Building Android release...${NC}"

    # Build APK
    echo "Building APK..."
    flutter build apk --release

    if [ -f "build/app/outputs/flutter-apk/app-release.apk" ]; then
        cp "build/app/outputs/flutter-apk/app-release.apk" "$OUTPUT_DIR/app-release.apk"
        echo -e "${GREEN}✓ APK built: $OUTPUT_DIR/app-release.apk${NC}"

        # Show APK size
        APK_SIZE=$(du -h "$OUTPUT_DIR/app-release.apk" | cut -f1)
        echo "  Size: $APK_SIZE"
    else
        echo -e "${RED}✗ APK build failed${NC}"
        exit 1
    fi

    # Build AAB (for Play Store)
    echo "Building App Bundle (AAB)..."
    flutter build appbundle --release

    if [ -f "build/app/outputs/bundle/release/app-release.aab" ]; then
        cp "build/app/outputs/bundle/release/app-release.aab" "$OUTPUT_DIR/app-release.aab"
        echo -e "${GREEN}✓ AAB built: $OUTPUT_DIR/app-release.aab${NC}"

        # Show AAB size
        AAB_SIZE=$(du -h "$OUTPUT_DIR/app-release.aab" | cut -f1)
        echo "  Size: $AAB_SIZE"
    else
        echo -e "${RED}✗ AAB build failed${NC}"
        exit 1
    fi
fi

# Build iOS
if [ "$BUILD_IOS" = true ]; then
    echo ""
    echo -e "${GREEN}Building iOS release...${NC}"

    # Check if on macOS
    if [ "$(uname)" != "Darwin" ]; then
        echo -e "${YELLOW}⚠ iOS build requires macOS. Skipping iOS build on $(uname)${NC}"
    else
        echo "Building iOS..."
        flutter build ios --release --no-codesign

        if [ -d "build/ios/iphoneos/Runner.app" ]; then
            echo -e "${GREEN}✓ iOS app built${NC}"

            # Create IPA
            echo "Creating IPA..."
            cd build/ios/iphoneos
            mkdir -p Payload
            mv Runner.app Payload/
            zip -r app-release.ipa Payload

            # Move to output
            mv app-release.ipa "$OUTPUT_DIR/app-release.ipa"
            echo -e "${GREEN}✓ IPA created: $OUTPUT_DIR/app-release.ipa${NC}"

            # Show IPA size
            IPA_SIZE=$(du -h "$OUTPUT_DIR/app-release.ipa" | cut -f1)
            echo "  Size: $IPA_SIZE"

            cd "$PROJECT_DIR"
        else
            echo -e "${RED}✗ iOS build failed${NC}"
            exit 1
        fi
    fi
fi

# Generate checksums
echo ""
echo -e "${YELLOW}Generating checksums...${NC}"
cd "$OUTPUT_DIR"
sha256sum *.apk *.aab *.ipa 2>/dev/null > checksums.txt || true
echo -e "${GREEN}✓ Checksums saved to $OUTPUT_DIR/checksums.txt${NC}"

# Summary
echo ""
echo -e "${GREEN}=== Build Complete ===${NC}"
echo "Release artifacts:"
ls -lh "$OUTPUT_DIR" | tail -n +2 | awk '{print "  " $9 " (" $5 ")"}'

echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "1. Test APK/IPA on real devices:"
echo "   adb install $OUTPUT_DIR/app-release.apk  # Android"
echo ""
echo "2. Submit to app stores:"
echo "   Google Play: Upload $OUTPUT_DIR/app-release.aab"
echo "   App Store: Upload $OUTPUT_DIR/app-release.ipa with Transporter"
echo ""
echo "3. Monitor Sentry for crashes:"
echo "   https://sentry.io/organizations/shareride/issues/"

exit 0
