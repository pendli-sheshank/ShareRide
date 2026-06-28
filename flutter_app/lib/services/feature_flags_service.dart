import 'package:firebase_remote_config/firebase_remote_config.dart';

class FeatureFlagsService {
  static final FeatureFlagsService _instance = FeatureFlagsService._internal();
  FirebaseRemoteConfig? _remoteConfig;
  bool _initialized = false;

  FeatureFlagsService._internal();

  factory FeatureFlagsService() {
    return _instance;
  }

  /// Initialize remote config (can be called multiple times safely)
  Future<void> initialize() async {
    if (_initialized) return;

    try {
      _remoteConfig = FirebaseRemoteConfig.instance;

      // Set default values (React Native fallback)
      await _remoteConfig!.setDefaults({
        'use_flutter_browse_rides': false,
        'use_flutter_my_rides': false,
        'use_flutter_post_ride': false,
        'use_flutter_chat': false,
        'use_flutter_profile': false,
        'flutter_rollout_percentage': 0,
        'min_app_version': '1.0.0',
        'enable_crash_reporting': true,
        'enable_performance_monitoring': true,
      });

      // Fetch remote config with 1 hour cache
      await _remoteConfig!.fetchAndActivate();
      _initialized = true;
    } catch (e) {
      print('Warning: Feature flags initialization failed: $e');
      // Continue with defaults even if initialization fails
      _initialized = true;
    }
  }

  /// Get remote config instance (initializes lazily if needed)
  FirebaseRemoteConfig get remoteConfig {
    if (_remoteConfig == null) {
      _remoteConfig = FirebaseRemoteConfig.instance;
    }
    return _remoteConfig!;
  }

  /// Check if Flutter should be used for Browse Rides screen
  bool usesFlutterBrowseRides() =>
      remoteConfig.getBool('use_flutter_browse_rides');

  /// Check if Flutter should be used for My Rides screen
  bool usesFlutterMyRides() => remoteConfig.getBool('use_flutter_my_rides');

  /// Check if Flutter should be used for Post Ride screen
  bool usesFlutterPostRide() => remoteConfig.getBool('use_flutter_post_ride');

  /// Check if Flutter should be used for Chat screen
  bool usesFlutterChat() => remoteConfig.getBool('use_flutter_chat');

  /// Check if Flutter should be used for Profile screen
  bool usesFlutterProfile() => remoteConfig.getBool('use_flutter_profile');

  /// Get rollout percentage (0-100)
  int getFlutterRolloutPercentage() =>
      remoteConfig.getInt('flutter_rollout_percentage');

  /// Check if user is in rollout percentage (based on user ID hash)
  bool isUserInRollout(String userId) {
    final percentage = getFlutterRolloutPercentage();
    if (percentage >= 100) return true;
    if (percentage <= 0) return false;

    // Deterministic rollout based on user ID
    final hash = userId.hashCode.abs();
    return (hash % 100) < percentage;
  }

  /// Get minimum app version required
  String getMinAppVersion() => remoteConfig.getString('min_app_version');

  /// Check if crash reporting is enabled
  bool isCrashReportingEnabled() =>
      remoteConfig.getBool('enable_crash_reporting');

  /// Check if performance monitoring is enabled
  bool isPerformanceMonitoringEnabled() =>
      remoteConfig.getBool('enable_performance_monitoring');

  /// Refresh remote config
  Future<void> refresh() async {
    try {
      await remoteConfig.fetchAndActivate();
    } catch (e) {
      print('Error refreshing remote config: $e');
    }
  }
}
