import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/rating.dart';

class RatingsService {
  final SupabaseClient client;

  RatingsService(this.client);

  Future<List<Rating>> fetchUserRatings(String userId) async {
    try {
      final response = await client
          .from('ratings')
          .select()
          .or('rater_id.eq.$userId,ratee_id.eq.$userId');

      return (response as List)
          .map((r) => Rating.fromJson(r as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw Exception('Failed to fetch ratings: $e');
    }
  }

  Future<double?> fetchUserAverageRating(String userId) async {
    try {
      final response = await client
          .from('ratings')
          .select('rating')
          .eq('ratee_id', userId);

      if ((response as List).isEmpty) return null;

      final ratings = List<int>.from(response.map((r) => r['rating'] as int));
      final average = ratings.reduce((a, b) => a + b) / ratings.length;
      return average;
    } catch (e) {
      throw Exception('Failed to fetch user rating: $e');
    }
  }

  Future<void> submitRating({
    required String rateeId,
    required int rating,
    String? review,
    String? tripOfferId,
  }) async {
    final userId = client.auth.currentUser?.id;
    if (userId == null) throw Exception('User not authenticated');

    try {
      await client.from('ratings').insert({
        'rater_id': userId,
        'ratee_id': rateeId,
        'rating': rating,
        'review': review,
        'trip_offer_id': tripOfferId,
        'created_at': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      throw Exception('Failed to submit rating: $e');
    }
  }

  Future<bool> hasUserRatedTrip(String tripOfferId, String userId) async {
    try {
      final response = await client
          .from('ratings')
          .select('id')
          .eq('trip_offer_id', tripOfferId)
          .eq('rater_id', userId)
          .limit(1);

      return (response as List).isNotEmpty;
    } catch (e) {
      throw Exception('Failed to check rating: $e');
    }
  }
}
