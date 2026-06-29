# iOS Setup via GitHub Actions (No macOS Required)

Automatically generate iOS project files using GitHub Actions on a macOS runner.

## How It Works

The workflow `.github/workflows/ios-setup.yml` runs on GitHub's macOS infrastructure to:
1. Generate iOS project files with `flutter create`
2. Install CocoaPods dependencies
3. Verify the iOS build setup
4. Commit files back to your repository
5. Create downloadable artifacts

## Step-by-Step Usage

### 1. Trigger the Workflow

Go to your GitHub repository:
1. Click **Actions** tab
2. Find **"Generate iOS Project Files"** workflow
3. Click **Run workflow**
4. Keep branch as **claude/supabase-mcp-setup-46mygk**
5. Click **Run workflow** button

### 2. Wait for Completion

The workflow will:
- ⏱️ Run for ~10-15 minutes
- 🔄 Show progress in real-time
- ✅ Complete with generated iOS files

**Estimated time:** 15 minutes total

### 3. Download Generated Files (Optional)

After workflow completes:
1. Go to the workflow run
2. Scroll to **Artifacts** section
3. Download **ios-project-files** (tar.gz archive)
4. Extract: `tar -xzf ios-project-files.tar.gz`

### 4. Verify Files in Repository

The workflow automatically commits iOS files:
1. Go to **Code** tab
2. Navigate to `flutter_app/ios/`
3. Verify these folders exist:
   - ✅ `Runner.xcodeproj/` (Xcode project)
   - ✅ `Runner/` (App source)
   - ✅ `Flutter/` (Configuration)
   - ✅ `Pods/` (Dependencies)
   - ✅ `Podfile.lock` (Dependency lock)

### 5. Next: Manual Xcode Configuration

Once iOS files are in the repository, you have two options:

**Option A: Continue with Xcode on macOS**
If you can access a Mac:
1. Clone the updated repository
2. Open `ios/Runner.xcodeproj` in Xcode
3. Follow steps in FIREBASE_IOS_SETUP.md:
   - Add GoogleService-Info.plist
   - Add Firebase libraries via Swift Package Manager
   - Build and test

**Option B: Use EAS Build (Recommended)**
Use Expo Application Services (no macOS needed):
1. Create account at https://expo.dev
2. Install EAS CLI: `npm install -g eas-cli`
3. Run: `eas build --platform ios --release`
4. EAS handles all Xcode/macOS compilation
5. Get IPA file for testing/deployment

## What Files Are Generated

```
flutter_app/ios/
├── Runner.xcodeproj/              (Xcode project - binary)
│   ├── project.pbxproj            (Project configuration)
│   ├── xcshareddata/
│   └── xcuserdata/
├── Runner/                        (App source files)
│   ├── AppDelegate.swift
│   ├── GeneratedPluginRegistrant.swift
│   ├── Main.storyboard
│   └── Assets.xcassets
├── Flutter/                       (Flutter configuration)
│   ├── Generated.xcconfig
│   ├── Release.xcconfig
│   └── Debug.xcconfig
├── Pods/                          (CocoaPods dependencies)
│   ├── Target Support Files/
│   └── <all Flutter and Firebase SDKs>
├── GoogleService-Info.plist       (Already provided)
├── Podfile                        (Updated)
├── Podfile.lock                   (Dependency lock)
└── .gitignore
```

## Troubleshooting

### Workflow Failed to Run
- Check GitHub Actions tab for error messages
- Common issues:
  - Repository access token missing
  - Workflow syntax error

### iOS Files Not Committed
- Check git permissions in workflow
- Verify branch protection rules don't block auto-commits

### Build Failed
- Check workflow logs for specific error
- May need specific iOS/CocoaPods versions

## Alternative: EAS Build (Simplest Option)

If you just want to build and test iOS without managing Xcode:

### Install EAS CLI
```bash
npm install -g eas-cli
```

### Create EAS Config
Create `eas.json` in project root:
```json
{
  "cli": {
    "version": ">= 0.0.1"
  },
  "build": {
    "production": {
      "ios": {
        "image": "latest"
      }
    }
  }
}
```

### Build for iOS
```bash
eas build --platform ios --release
```

**Advantages:**
- ✅ No macOS required
- ✅ Automatic Xcode/certificate handling
- ✅ Cloud-based compilation
- ✅ IPA download for distribution
- ✅ App Store submission ready

**Disadvantages:**
- Requires EAS account (free tier available)
- Build takes longer on cloud (5-15 min)
- Need to push code to GitHub

## Status After Setup

After iOS files are generated (via GitHub Actions or EAS):

✅ iOS project files committed
✅ Firebase configuration ready (GoogleService-Info.plist)
⏳ Firebase libraries need to be added to Xcode (if using GitHub Actions)
✅ App ready to build with EAS or local Xcode
✅ All Firebase services available

## Recommended Path

**Without macOS access:**
1. ✅ Run iOS-setup.yml workflow (GitHub Actions)
2. ✅ Files auto-commit to repository
3. ✅ Use EAS Build for compiling and testing
4. ✅ Get IPA for distribution

**With macOS access later:**
1. ✅ iOS files already in repo
2. Open Xcode and complete Firebase setup
3. Build locally or via CI/CD

## Next Steps

1. Run the iOS-setup.yml workflow from GitHub Actions
2. Wait for completion and verification
3. Choose build method:
   - **EAS Build** (recommended, no macOS needed)
   - **Local Xcode** (when macOS available)
4. Test on iOS simulator/device
5. Deploy to App Store

---

**Status: iOS project generation via GitHub Actions - No macOS Required!** ✨
