import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/trip_match.dart';

class MatchesService {
  final SupabaseClient client;

  MatchesService(this.client);

  Future<List<TripMatch>> fetchMyMatches() async {
    final userId = client.auth.currentUser?.id;
    if (userId == null) throw Exception('User not authenticated');

    try {
      final response = await client
          .from('trip_matches')
          .select('*, trip_offers(*, users(*)), ride_requests(*)')
          .or('host_id.eq.$userId,rider_id.eq.$userId')
          .order('created_at', ascending: false);

      return (response as List)
          .map((m) => TripMatch.fromJson(m as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw Exception('Failed to fetch matches: $e');
    }
  }

  Future<TripMatch?> fetchMatch(String matchId) async {
    try {
      final response = await client
          .from('trip_matches')
          .select('*, trip_offers(*, users(*)), ride_requests(*)')
          .eq('id', matchId)
          .single();

      return TripMatch.fromJson(response as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to fetch match: $e');
    }
  }

  // Join a trip offer as a rider
  Future<String> joinTrip({
    required String tripOfferId,
    required double costPerRider,
  }) async {
    final userId = client.auth.currentUser?.id;
    if (userId == null) throw Exception('User not authenticated');

    try {
      final response = await client.from('trip_matches').insert({
        'trip_offer_id': tripOfferId,
        'host_id': userId, // Will be updated by Edge Function
        'rider_id': userId,
        'cost_per_rider': costPerRider,
        'status': 'pending',
      }).select();

      return (response as List).first['id'] as String;
    } catch (e) {
      throw Exception('Failed to join trip: $e');
    }
  }

  // Cancel a match
  Future<void> cancelMatch(String matchId) async {
    try {
      await client
          .from('trip_matches')
          .update({'status': 'cancelled'}).eq('id', matchId);
    } catch (e) {
      throw Exception('Failed to cancel match: $e');
    }
  }

  // Accept a pending match (host action)
  Future<void> acceptMatch(String matchId) async {
    try {
      await client
          .from('trip_matches')
          .update({'status': 'accepted'}).eq('id', matchId);
    } catch (e) {
      throw Exception('Failed to accept match: $e');
    }
  }

  // Reject a pending match (host action)
  Future<void> rejectMatch(String matchId) async {
    try {
      await client
          .from('trip_matches')
          .update({'status': 'rejected'}).eq('id', matchId);
    } catch (e) {
      throw Exception('Failed to reject match: $e');
    }
  }

  // Mark trip as completed
  Future<void> completeMatch(String matchId) async {
    try {
      await client
          .from('trip_matches')
          .update({'status': 'completed'}).eq('id', matchId);
    } catch (e) {
      throw Exception('Failed to complete match: $e');
    }
  }

  // Get matches for a trip offer
  Future<List<TripMatch>> fetchTripMatches(String tripOfferId) async {
    try {
      final response = await client
          .from('trip_matches')
          .select('*, riders:rider_id(*)')
          .eq('trip_offer_id', tripOfferId);

      return (response as List)
          .map((m) => TripMatch.fromJson(m as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw Exception('Failed to fetch trip matches: $e');
    }
  }
}
