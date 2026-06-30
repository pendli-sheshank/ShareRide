/// Firebase Remote Config default parameters for Flutter rollout phases
///
/// Usage:
/// 1. Phase 1 (Day 1-5): Set flutter_rollout_percentage = 10
/// 2. Phase 2 (Day 6-10): Set flutter_rollout_percentage = 50
/// 3. Phase 3 (Day 11+): Set flutter_rollout_percentage = 100
///
/// Access via FeatureFlagsService singleton

const Map<String, dynamic> firebaseRemoteConfigDefaults = {
  // Gradual rollout control
  'flutter_rollout_percentage': 0,

  // Per-screen feature flags (for granular control)
  'use_flutter_browse_rides': false,
  'use_flutter_my_rides': false,
  'use_flutter_post_ride': false,
  'use_flutter_chat': false,
  'use_flutter_profile': false,

  // App version management
  'min_app_version': '1.0.0',
  'deprecated_app_version': '999.0.0', // Set to high number to force updates
  // Monitoring & crash reporting
  'enable_crash_reporting': true,
  'enable_performance_monitoring': true,

  // Feature toggles for secondary features
  'enable_notifications': true,
  'enable_deep_linking': true,
  'enable_chat_realtime': true,
  'enable_ratings': true,

  // Performance thresholds
  'max_allowed_startup_time_ms': 3000,
  'max_allowed_query_time_ms': 2000,
  'max_allowed_message_latency_ms': 500,

  // Fallback behavior
  'use_react_native_fallback': true,
  'react_native_fallback_screens': 'all', // 'all', 'some', 'none'
};

/// Firebase Remote Config for Phase 5 Gradual Rollout
///
/// This configuration object should be uploaded to Firebase Console:
/// Project Settings → Remote Config
///
/// Week 1: 10% rollout
/// {
///   "parameters": {
///     "flutter_rollout_percentage": {
///       "defaultValue": {
///         "value": "10"
///       }
///     }
///   },
///   "conditions": []
/// }
///
/// Week 2: 50% rollout
/// {
///   "parameters": {
///     "flutter_rollout_percentage": {
///       "defaultValue": {
///         "value": "50"
///       }
///     }
///   }
/// }
///
/// Week 3: 100% rollout
/// {
///   "parameters": {
///     "flutter_rollout_percentage": {
///       "defaultValue": {
///         "value": "100"
///       }
///     }
///   }
/// }
///
/// After 2-4 weeks, deprecate React Native by setting:
/// {
///   "parameters": {
///     "use_react_native_fallback": {
///       "defaultValue": {
///         "value": "false"
///       }
///     }
///   }
/// }
