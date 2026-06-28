import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/feature_flags_provider.dart';
import '../screens/tabs/browse_rides_screen.dart';
import '../screens/tabs/my_rides_screen.dart';
import '../screens/tabs/post_ride_screen.dart';
import '../screens/tabs/chat_screen.dart';
import '../screens/tabs/profile_screen.dart';
import '../screens/trip/trip_detail_screen.dart';
import '../screens/chat/chat_detail_screen.dart';

/// Feature flag-gated screen wrapper
/// Displays Flutter screen if feature flag is enabled, otherwise shows placeholder for React Native fallback
class FeatureFlaggedScreen extends ConsumerWidget {
  final String screenName;
  final AsyncValue<bool> featureFlag;
  final Widget flutterScreen;
  final String fallbackMessage;

  const FeatureFlaggedScreen({
    required this.screenName,
    required this.featureFlag,
    required this.flutterScreen,
    this.fallbackMessage = 'This feature is coming soon',
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return featureFlag.when(
      data: (isEnabled) {
        if (isEnabled) {
          return flutterScreen;
        } else {
          return Scaffold(
            appBar: AppBar(title: Text(screenName)),
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.schedule, size: 64, color: Colors.grey),
                  const SizedBox(height: 16),
                  Text(
                    fallbackMessage,
                    style: Theme.of(context).textTheme.bodyLarge,
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          );
        }
      },
      loading: () => Scaffold(
        appBar: AppBar(title: Text(screenName)),
        body: const Center(child: CircularProgressIndicator()),
      ),
      error: (_, __) => Scaffold(
        appBar: AppBar(title: Text(screenName)),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error, size: 64, color: Colors.red),
              const SizedBox(height: 16),
              Text(
                'Error loading feature flag',
                style: Theme.of(context).textTheme.bodyLarge,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Browse Rides screen with feature flag
class BrowseRidesScreenGated extends ConsumerWidget {
  const BrowseRidesScreenGated({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final useFlutter = ref.watch(useFlutterBrowseRidesProvider);
    return FeatureFlaggedScreen(
      screenName: 'Browse Rides',
      featureFlag: useFlutter,
      flutterScreen: const BrowseRidesScreen(),
      fallbackMessage: 'Browse Rides will be available soon',
    );
  }
}

/// My Rides screen with feature flag
class MyRidesScreenGated extends ConsumerWidget {
  const MyRidesScreenGated({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final useFlutter = ref.watch(useFlutterMyRidesProvider);
    return FeatureFlaggedScreen(
      screenName: 'My Rides',
      featureFlag: useFlutter,
      flutterScreen: const MyRidesScreen(),
      fallbackMessage: 'My Rides will be available soon',
    );
  }
}

/// Post Ride screen with feature flag
class PostRideScreenGated extends ConsumerWidget {
  const PostRideScreenGated({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final useFlutter = ref.watch(useFlutterPostRideProvider);
    return FeatureFlaggedScreen(
      screenName: 'Post Ride',
      featureFlag: useFlutter,
      flutterScreen: const PostRideScreen(),
      fallbackMessage: 'Post Ride will be available soon',
    );
  }
}

/// Chat screen with feature flag
class ChatScreenGated extends ConsumerWidget {
  const ChatScreenGated({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final useFlutter = ref.watch(useFlutterChatProvider);
    return FeatureFlaggedScreen(
      screenName: 'Chat',
      featureFlag: useFlutter,
      flutterScreen: const ChatScreen(),
      fallbackMessage: 'Chat will be available soon',
    );
  }
}

/// Profile screen with feature flag
class ProfileScreenGated extends ConsumerWidget {
  const ProfileScreenGated({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final useFlutter = ref.watch(useFlutterProfileProvider);
    return FeatureFlaggedScreen(
      screenName: 'Profile',
      featureFlag: useFlutter,
      flutterScreen: const ProfileScreen(),
      fallbackMessage: 'Profile will be available soon',
    );
  }
}
