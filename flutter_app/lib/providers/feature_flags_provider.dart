import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/feature_flags_service.dart';

final featureFlagsServiceProvider = Provider((ref) => FeatureFlagsService());

/// Provides feature flag for Flutter Browse Rides screen
final useFlutterBrowseRidesProvider = FutureProvider<bool>((ref) async {
  final service = ref.watch(featureFlagsServiceProvider);
  await service.initialize();
  return service.usesFlutterBrowseRides();
});

/// Provides feature flag for Flutter My Rides screen
final useFlutterMyRidesProvider = FutureProvider<bool>((ref) async {
  final service = ref.watch(featureFlagsServiceProvider);
  await service.initialize();
  return service.usesFlutterMyRides();
});

/// Provides feature flag for Flutter Post Ride screen
final useFlutterPostRideProvider = FutureProvider<bool>((ref) async {
  final service = ref.watch(featureFlagsServiceProvider);
  await service.initialize();
  return service.usesFlutterPostRide();
});

/// Provides feature flag for Flutter Chat screen
final useFlutterChatProvider = FutureProvider<bool>((ref) async {
  final service = ref.watch(featureFlagsServiceProvider);
  await service.initialize();
  return service.usesFlutterChat();
});

/// Provides feature flag for Flutter Profile screen
final useFlutterProfileProvider = FutureProvider<bool>((ref) async {
  final service = ref.watch(featureFlagsServiceProvider);
  await service.initialize();
  return service.usesFlutterProfile();
});

/// Provides Flutter rollout percentage (0-100)
final flutterRolloutPercentageProvider = FutureProvider<int>((ref) async {
  final service = ref.watch(featureFlagsServiceProvider);
  await service.initialize();
  return service.getFlutterRolloutPercentage();
});

/// Check if current user is in Flutter rollout
/// Pass userId to get deterministic rollout status
final isUserInFlutterRolloutProvider = FutureProvider.family<bool, String>((
  ref,
  userId,
) async {
  final service = ref.watch(featureFlagsServiceProvider);
  await service.initialize();
  return service.isUserInRollout(userId);
});

/// Provides minimum app version required
final minAppVersionProvider = FutureProvider<String>((ref) async {
  final service = ref.watch(featureFlagsServiceProvider);
  await service.initialize();
  return service.getMinAppVersion();
});

/// Provides crash reporting enabled status
final isCrashReportingEnabledProvider = FutureProvider<bool>((ref) async {
  final service = ref.watch(featureFlagsServiceProvider);
  await service.initialize();
  return service.isCrashReportingEnabled();
});

/// Provides performance monitoring enabled status
final isPerformanceMonitoringEnabledProvider = FutureProvider<bool>((
  ref,
) async {
  final service = ref.watch(featureFlagsServiceProvider);
  await service.initialize();
  return service.isPerformanceMonitoringEnabled();
});
