import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/trip_offer.dart';
import '../models/ride_request.dart';

class TripsService {
  final SupabaseClient client;

  TripsService(this.client);

  // Trip Offers
  Future<List<TripOffer>> fetchActiveOffers({
    int limit = 50,
    double? originLat,
    double? originLng,
    double? destLat,
    double? destLng,
  }) async {
    try {
      var query = client.from('trip_offers').select('*, users(*)');

      query = query.eq('status', 'active');

      final response =
          await query.order('departure_time', ascending: true).limit(limit);

      return (response as List)
          .map((o) => TripOffer.fromJson(o as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw Exception('Failed to fetch active offers: $e');
    }
  }

  Future<TripOffer?> fetchTripOffer(String tripId) async {
    try {
      final response = await client
          .from('trip_offers')
          .select('*, users(*)')
          .eq('id', tripId)
          .single();

      return TripOffer.fromJson(response as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to fetch trip offer: $e');
    }
  }

  Future<List<TripOffer>> fetchMyOffers() async {
    final userId = client.auth.currentUser?.id;
    if (userId == null) throw Exception('User not authenticated');

    try {
      final response = await client
          .from('trip_offers')
          .select('*, users(*)')
          .eq('host_id', userId)
          .order('created_at', ascending: false);

      return (response as List)
          .map((o) => TripOffer.fromJson(o as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw Exception('Failed to fetch my offers: $e');
    }
  }

  Future<String> createTripOffer({
    required String origin,
    required String destination,
    required double originLat,
    required double originLng,
    required double destLat,
    required double destLng,
    required DateTime departureTime,
    required int costPerSeat,
    required int seatsAvailable,
    String? recurringRule,
    bool womenOnly = false,
  }) async {
    final userId = client.auth.currentUser?.id;
    if (userId == null) throw Exception('User not authenticated');

    try {
      final response = await client.from('trip_offers').insert({
        'host_id': userId,
        'origin': origin,
        'destination': destination,
        'origin_lat': originLat,
        'origin_lng': originLng,
        'dest_lat': destLat,
        'dest_lng': destLng,
        'departure_time': departureTime.toIso8601String(),
        'cost_per_seat': costPerSeat,
        'seats_available': seatsAvailable,
        'recurring_rule': recurringRule,
        'women_only': womenOnly,
        'status': 'active',
      }).select();

      return (response as List).first['id'] as String;
    } catch (e) {
      throw Exception('Failed to create trip offer: $e');
    }
  }

  Future<void> cancelTripOffer(String tripOfferId) async {
    try {
      await client
          .from('trip_offers')
          .update({'status': 'cancelled'}).eq('id', tripOfferId);
    } catch (e) {
      throw Exception('Failed to cancel trip offer: $e');
    }
  }

  // Ride Requests
  Future<List<RideRequest>> fetchMyRequests() async {
    final userId = client.auth.currentUser?.id;
    if (userId == null) throw Exception('User not authenticated');

    try {
      final response = await client
          .from('ride_requests')
          .select('*, users(*)')
          .eq('requester_id', userId)
          .order('created_at', ascending: false);

      return (response as List)
          .map((r) => RideRequest.fromJson(r as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw Exception('Failed to fetch my requests: $e');
    }
  }

  Future<String> createRideRequest({
    required String origin,
    required String destination,
    required double originLat,
    required double originLng,
    required double destLat,
    required double destLng,
    required DateTime departureTime,
    DateTime? departureTimeEnd,
    bool womenOnly = false,
  }) async {
    final userId = client.auth.currentUser?.id;
    if (userId == null) throw Exception('User not authenticated');

    try {
      final response = await client.from('ride_requests').insert({
        'requester_id': userId,
        'origin': origin,
        'destination': destination,
        'origin_lat': originLat,
        'origin_lng': originLng,
        'dest_lat': destLat,
        'dest_lng': destLng,
        'departure_time': departureTime.toIso8601String(),
        'departure_time_end': departureTimeEnd?.toIso8601String(),
        'women_only': womenOnly,
        'status': 'active',
      }).select();

      return (response as List).first['id'] as String;
    } catch (e) {
      throw Exception('Failed to create ride request: $e');
    }
  }

  Future<void> cancelRideRequest(String rideRequestId) async {
    try {
      await client
          .from('ride_requests')
          .update({'status': 'cancelled'}).eq('id', rideRequestId);
    } catch (e) {
      throw Exception('Failed to cancel ride request: $e');
    }
  }
}
