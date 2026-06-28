import 'package:firebase_remote_config/firebase_remote_config.dart';

class FeatureFlagsService {
  static final FeatureFlagsService _instance = FeatureFlagsService._internal();
  late FirebaseRemoteConfig _remoteConfig;

  FeatureFlagsService._internal();

  factory FeatureFlagsService() {
    return _instance;
  }

  Future<void> initialize() async {
    _remoteConfig = FirebaseRemoteConfig.instance;

    // Set default values (React Native fallback)
    await _remoteConfig.setDefaults({
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
    try {
      await _remoteConfig.fetchAndActivate();
    } catch (e) {
      print('Error fetching remote config: $e');
    }
  }

  /// Check if Flutter should be used for Browse Rides screen
  bool usesFlutterBrowseRides() => _remoteConfig.getBool('use_flutter_browse_rides');

  /// Check if Flutter should be used for My Rides screen
  bool usesFlutterMyRides() => _remoteConfig.getBool('use_flutter_my_rides');

  /// Check if Flutter should be used for Post Ride screen
  bool usesFlutterPostRide() => _remoteConfig.getBool('use_flutter_post_ride');

  /// Check if Flutter should be used for Chat screen
  bool usesFlutterChat() => _remoteConfig.getBool('use_flutter_chat');

  /// Check if Flutter should be used for Profile screen
  bool usesFlutterProfile() => _remoteConfig.getBool('use_flutter_profile');

  /// Get rollout percentage (0-100)
  int getFlutterRolloutPercentage() => _remoteConfig.getInt('flutter_rollout_percentage');

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
  String getMinAppVersion() => _remoteConfig.getString('min_app_version');

  /// Check if crash reporting is enabled
  bool isCrashReportingEnabled() => _remoteConfig.getBool('enable_crash_reporting');

  /// Check if performance monitoring is enabled
  bool isPerformanceMonitoringEnabled() => _remoteConfig.getBool('enable_performance_monitoring');

  /// Refresh remote config
  Future<void> refresh() async {
    try {
      await _remoteConfig.fetchAndActivate();
    } catch (e) {
      print('Error refreshing remote config: $e');
    }
  }
}
