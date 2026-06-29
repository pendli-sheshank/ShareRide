# Dependency Update Guide

## Current Issue

The CI workflow shows:
```
122 packages have newer versions incompatible with dependency constraints.
```

This means some packages have updates available but can't be applied due to version constraints in `pubspec.yaml`.

## How to Check and Update Dependencies

### 1. Check Outdated Packages

```bash
cd flutter_app
flutter pub outdated
```

This shows:
- **Pub** - Current version in pubspec.lock
- **Upgradable** - Latest version compatible with constraints
- **Resolvable** - Latest version available (may require constraint update)
- **Latest** - Absolute latest version

### 2. Understand Version Constraints

In `pubspec.yaml`, versions are specified with constraints:
- `^1.2.3` - Compatible with 1.2.3 and up to < 2.0.0
- `~1.2.3` - Compatible with 1.2.3 and up to < 1.3.0
- `>=1.2.3, <2.0.0` - Explicit range
- `1.2.3` - Exact version (not recommended)

### 3. Update Specific Package

**Safe Update (within constraints):**
```bash
flutter pub get  # Gets latest compatible version
```

**Update with constraint change:**
```bash
# Edit pubspec.yaml manually, then:
flutter pub upgrade package_name
```

### 4. Full Dependency Upgrade

⚠️ **Use with caution** - may introduce breaking changes:

```bash
# Show what would change
flutter pub upgrade --dry-run

# Apply changes
flutter pub upgrade
```

### 5. Fix Dependency Conflicts

If you encounter conflicts:

```bash
flutter pub resolve
flutter pub get
flutter clean
flutter pub get
```

## Recommended Approach for ShareRide

Since the app is in active development, we recommend:

1. **Minor version updates** - Usually safe, bug fixes and features
2. **Major version updates** - Review changelog first, may require code changes

### Priority Updates

Check these critical packages:
- `flutter_riverpod` - State management
- `supabase_flutter` - Backend
- `firebase_core` - Firebase
- `go_router` - Navigation
- `flutter_dotenv` - Environment variables

### Steps to Update (Safe Method)

1. Run `flutter pub outdated` and review the list
2. For each package you want to update:
   ```bash
   # Check the changelog at pub.dev/packages/PACKAGE_NAME
   # Edit pubspec.yaml constraint if needed
   # Run pub get to update
   ```
3. Run tests to ensure nothing broke
4. Commit the changes

```bash
git add flutter_app/pubspec.yaml flutter_app/pubspec.lock
git commit -m "Update dependencies to latest compatible versions

Updated packages:
- [List changes here]

All tests passing, no breaking changes detected."
```

## Continuous Dependency Management

### GitHub Actions for Dependency Updates

You can set up automated dependency updates using:
- **Dependabot** (GitHub-native)
- **Renovate** (more features)

These create automated PRs for dependency updates.

### Enable Dependabot

Create `.github/dependabot.yml`:
```yaml
version: 2
updates:
  - package-ecosystem: "pub"
    directory: "/flutter_app"
    schedule:
      interval: "weekly"
    reviewers:
      - "pendli-sheshank"
```

## Current Action Items

### If you want to update dependencies now:

1. ```bash
   cd flutter_app
   flutter pub outdated
   ```

2. Review the output for critical updates

3. Update carefully:
   ```bash
   flutter pub upgrade
   flutter test
   ```

4. Commit if tests pass:
   ```bash
   git add pubspec.yaml pubspec.lock
   git commit -m "Update dependencies"
   ```

### Or skip for now:

The current setup works fine - dependency updates are optional for immediate needs.

## Impact on Build

- 122 outdated packages won't cause the iOS build to fail
- The iOS build failure is about missing project files (now fixed)
- Outdated dependencies are a "good to address when convenient" item, not critical

## Resources

- [Pub Versioning](https://dart.dev/tools/pub/versioning)
- [Flutter Dependency Management](https://flutter.dev/docs/development/packages-and-plugins/using-packages)
- [Each package's pub.dev page] - Check for changelogs and compatibility

---

**Recommendation:** For now, focus on getting the iOS build working. Dependency updates can be done separately when convenient.
