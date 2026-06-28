import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/rating.dart';
import '../services/ratings_service.dart';
import '../services/supabase_service.dart';

// Ratings service provider
final ratingsServiceProvider = Provider<RatingsService>((ref) {
  return RatingsService(SupabaseService.client);
});

// User's ratings
final userRatingsProvider = FutureProvider.family<List<Rating>, String>((
  ref,
  userId,
) async {
  final ratingsService = ref.watch(ratingsServiceProvider);
  return ratingsService.fetchUserRatings(userId);
});

// User's average rating
final userAverageRatingProvider = FutureProvider.family<double?, String>((
  ref,
  userId,
) async {
  final ratingsService = ref.watch(ratingsServiceProvider);
  return ratingsService.fetchUserAverageRating(userId);
});

// Submit rating notifier
class SubmitRatingNotifier extends StateNotifier<AsyncValue<void>> {
  final RatingsService ratingsService;

  SubmitRatingNotifier(this.ratingsService)
    : super(const AsyncValue.data(null));

  Future<void> submitRating({
    required String rateeId,
    required int rating,
    String? review,
    String? tripOfferId,
  }) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(
      () => ratingsService.submitRating(
        rateeId: rateeId,
        rating: rating,
        review: review,
        tripOfferId: tripOfferId,
      ),
    );
  }
}

final submitRatingProvider =
    StateNotifierProvider.autoDispose<SubmitRatingNotifier, AsyncValue<void>>((
      ref,
    ) {
      final ratingsService = ref.watch(ratingsServiceProvider);
      return SubmitRatingNotifier(ratingsService);
    });
