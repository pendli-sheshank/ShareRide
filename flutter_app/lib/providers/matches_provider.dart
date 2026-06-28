import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/trip_match.dart';
import '../services/matches_service.dart';
import '../services/supabase_service.dart';

// Matches service provider
final matchesServiceProvider = Provider<MatchesService>((ref) {
  return MatchesService(SupabaseService.client);
});

// User's matches
final myMatchesProvider = FutureProvider<List<TripMatch>>((ref) async {
  final matchesService = ref.watch(matchesServiceProvider);
  return matchesService.fetchMyMatches();
});

// Single match
final matchProvider = FutureProvider.family<TripMatch?, String>((ref, matchId) async {
  final matchesService = ref.watch(matchesServiceProvider);
  return matchesService.fetchMatch(matchId);
});

// Join trip notifier
class JoinTripNotifier extends StateNotifier<AsyncValue<String>> {
  final MatchesService matchesService;

  JoinTripNotifier(this.matchesService) : super(const AsyncValue.data(''));

  Future<void> joinTrip({
    required String tripOfferId,
    required double costPerRider,
  }) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(
      () => matchesService.joinTrip(
        tripOfferId: tripOfferId,
        costPerRider: costPerRider,
      ),
    );
  }
}

final joinTripProvider =
    StateNotifierProvider.autoDispose<JoinTripNotifier, AsyncValue<String>>((ref) {
  final matchesService = ref.watch(matchesServiceProvider);
  return JoinTripNotifier(matchesService);
});

// Cancel match notifier
class CancelMatchNotifier extends StateNotifier<AsyncValue<void>> {
  final MatchesService matchesService;

  CancelMatchNotifier(this.matchesService) : super(const AsyncValue.data(null));

  Future<void> cancelMatch(String matchId) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => matchesService.cancelMatch(matchId));
  }
}

final cancelMatchProvider =
    StateNotifierProvider.autoDispose<CancelMatchNotifier, AsyncValue<void>>((ref) {
  final matchesService = ref.watch(matchesServiceProvider);
  return CancelMatchNotifier(matchesService);
});

// Accept match notifier (host action)
class AcceptMatchNotifier extends StateNotifier<AsyncValue<void>> {
  final MatchesService matchesService;

  AcceptMatchNotifier(this.matchesService) : super(const AsyncValue.data(null));

  Future<void> acceptMatch(String matchId) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => matchesService.acceptMatch(matchId));
  }
}

final acceptMatchProvider =
    StateNotifierProvider.autoDispose<AcceptMatchNotifier, AsyncValue<void>>((ref) {
  final matchesService = ref.watch(matchesServiceProvider);
  return AcceptMatchNotifier(matchesService);
});

// Reject match notifier (host action)
class RejectMatchNotifier extends StateNotifier<AsyncValue<void>> {
  final MatchesService matchesService;

  RejectMatchNotifier(this.matchesService) : super(const AsyncValue.data(null));

  Future<void> rejectMatch(String matchId) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => matchesService.rejectMatch(matchId));
  }
}

final rejectMatchProvider =
    StateNotifierProvider.autoDispose<RejectMatchNotifier, AsyncValue<void>>((ref) {
  final matchesService = ref.watch(matchesServiceProvider);
  return RejectMatchNotifier(matchesService);
});
