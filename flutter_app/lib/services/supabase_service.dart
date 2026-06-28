import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseService {
  static final SupabaseService _instance = SupabaseService._internal();

  factory SupabaseService() => _instance;

  SupabaseService._internal();

  static SupabaseClient get client => Supabase.instance.client;

  static GoTrueClient get auth => client.auth;

  // User queries
  Future<Map<String, dynamic>?> getCurrentUserProfile() async {
    final userId = auth.currentUser?.id;
    if (userId == null) return null;

    try {
      final response = await client
          .from('users')
          .select()
          .eq('id', userId)
          .single();
      return response;
    } catch (e) {
      throw Exception('Failed to fetch user profile: $e');
    }
  }

  // Trip Offers queries
  Future<List<Map<String, dynamic>>> fetchActiveOffers({
    int limit = 50,
    String? status = 'active',
  }) async {
    try {
      var query = client.from('trip_offers').select('*, users(*)');

      if (status != null) {
        query = query.eq('status', status);
      }

      final response = await query
          .order('departure_time', ascending: true)
          .limit(limit);

      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      throw Exception('Failed to fetch active offers: $e');
    }
  }

  Future<Map<String, dynamic>?> fetchTripOffer(String tripId) async {
    try {
      final response = await client
          .from('trip_offers')
          .select('*, users(*), trip_matches(*)')
          .eq('id', tripId)
          .single();
      return response;
    } catch (e) {
      throw Exception('Failed to fetch trip offer: $e');
    }
  }

  // User's trip offers
  Future<List<Map<String, dynamic>>> fetchMyOffers() async {
    final userId = auth.currentUser?.id;
    if (userId == null) throw Exception('User not authenticated');

    try {
      final response = await client
          .from('trip_offers')
          .select('*, trip_matches(*)')
          .eq('host_id', userId)
          .order('created_at', ascending: false);

      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      throw Exception('Failed to fetch my offers: $e');
    }
  }

  // Ride Requests queries
  Future<List<Map<String, dynamic>>> fetchMyRequests() async {
    final userId = auth.currentUser?.id;
    if (userId == null) throw Exception('User not authenticated');

    try {
      final response = await client
          .from('ride_requests')
          .select('*, trip_matches(*)')
          .eq('requester_id', userId)
          .order('created_at', ascending: false);

      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      throw Exception('Failed to fetch my requests: $e');
    }
  }

  // Trip Matches
  Future<List<Map<String, dynamic>>> fetchMyMatches() async {
    final userId = auth.currentUser?.id;
    if (userId == null) throw Exception('User not authenticated');

    try {
      final response = await client
          .from('trip_matches')
          .select('*, trip_offers(*, users(*)), ride_requests(*)')
          .or('host_id.eq.$userId,rider_id.eq.$userId')
          .order('created_at', ascending: false);

      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      throw Exception('Failed to fetch matches: $e');
    }
  }

  // Chat Messages - Stream for real-time updates
  Stream<List<Map<String, dynamic>>> watchChatMessages(String matchId) {
    return client
        .from('chat_messages')
        .stream(primaryKey: ['id'])
        .eq('match_id', matchId)
        .order('created_at', ascending: true)
        .map((messages) => List<Map<String, dynamic>>.from(messages));
  }

  Future<List<Map<String, dynamic>>> fetchChatMessages(String matchId) async {
    try {
      final response = await client
          .from('chat_messages')
          .select()
          .eq('match_id', matchId)
          .order('created_at', ascending: true);

      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      throw Exception('Failed to fetch chat messages: $e');
    }
  }

  // Send message
  Future<void> sendMessage({
    required String matchId,
    required String body,
  }) async {
    final userId = auth.currentUser?.id;
    if (userId == null) throw Exception('User not authenticated');

    try {
      await client.from('chat_messages').insert({
        'match_id': matchId,
        'sender_id': userId,
        'body': body,
        'created_at': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      throw Exception('Failed to send message: $e');
    }
  }

  // Vehicles
  Future<List<Map<String, dynamic>>> fetchUserVehicles() async {
    final userId = auth.currentUser?.id;
    if (userId == null) throw Exception('User not authenticated');

    try {
      final response = await client
          .from('vehicles')
          .select()
          .eq('owner_id', userId);

      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      throw Exception('Failed to fetch vehicles: $e');
    }
  }

  // Ratings
  Future<List<Map<String, dynamic>>> fetchUserRatings(String userId) async {
    try {
      final response = await client
          .from('ratings')
          .select()
          .or('rater_id.eq.$userId,ratee_id.eq.$userId');

      return List<Map<String, dynamic>>.from(response);
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

      if (response.isEmpty) return null;

      final ratings = List<int>.from(
        response.map((r) => r['rating'] as int),
      );
      final average = ratings.reduce((a, b) => a + b) / ratings.length;
      return average;
    } catch (e) {
      throw Exception('Failed to fetch user rating: $e');
    }
  }

  // Submit rating
  Future<void> submitRating({
    required String rateerId,
    required String rateeId,
    required int rating,
    String? review,
  }) async {
    try {
      await client.from('ratings').insert({
        'rater_id': rateerId,
        'ratee_id': rateeId,
        'rating': rating,
        'review': review,
        'created_at': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      throw Exception('Failed to submit rating: $e');
    }
  }

  // Auth state stream
  Stream<AuthState> get authStateStream => auth.onAuthStateChange;

  // Disconnect (for cleanup)
  void dispose() {
    // Cleanup if needed
  }
}
