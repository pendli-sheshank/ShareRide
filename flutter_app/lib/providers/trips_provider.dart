import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/trip_offer.dart';
import '../models/ride_request.dart';
import '../services/trips_service.dart';
import '../services/supabase_service.dart';

// Trips service provider
final tripsServiceProvider = Provider<TripsService>((ref) {
  return TripsService(SupabaseService.client);
});

// Active trips offers
final activeTripsProvider = FutureProvider<List<TripOffer>>((ref) async {
  final tripsService = ref.watch(tripsServiceProvider);
  return tripsService.fetchActiveOffers();
});

// Single trip offer
final tripOfferProvider = FutureProvider.family<TripOffer?, String>((ref, tripId) async {
  final tripsService = ref.watch(tripsServiceProvider);
  return tripsService.fetchTripOffer(tripId);
});

// User's trip offers
final myTripsProvider = FutureProvider<List<TripOffer>>((ref) async {
  final tripsService = ref.watch(tripsServiceProvider);
  return tripsService.fetchMyOffers();
});

// User's ride requests
final myRideRequestsProvider = FutureProvider<List<RideRequest>>((ref) async {
  final tripsService = ref.watch(tripsServiceProvider);
  return tripsService.fetchMyRequests();
});

// Create trip offer notifier
class CreateTripNotifier extends StateNotifier<AsyncValue<String>> {
  final TripsService tripsService;

  CreateTripNotifier(this.tripsService) : super(const AsyncValue.data(''));

  Future<void> createTrip({
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
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(
      () => tripsService.createTripOffer(
        origin: origin,
        destination: destination,
        originLat: originLat,
        originLng: originLng,
        destLat: destLat,
        destLng: destLng,
        departureTime: departureTime,
        costPerSeat: costPerSeat,
        seatsAvailable: seatsAvailable,
        recurringRule: recurringRule,
        womenOnly: womenOnly,
      ),
    );
  }
}

final createTripProvider =
    StateNotifierProvider.autoDispose<CreateTripNotifier, AsyncValue<String>>((ref) {
  final tripsService = ref.watch(tripsServiceProvider);
  return CreateTripNotifier(tripsService);
});

// Cancel trip notifier
class CancelTripNotifier extends StateNotifier<AsyncValue<void>> {
  final TripsService tripsService;

  CancelTripNotifier(this.tripsService) : super(const AsyncValue.data(null));

  Future<void> cancelTrip(String tripOfferId) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => tripsService.cancelTripOffer(tripOfferId));
  }
}

final cancelTripProvider =
    StateNotifierProvider.autoDispose<CancelTripNotifier, AsyncValue<void>>((ref) {
  final tripsService = ref.watch(tripsServiceProvider);
  return CancelTripNotifier(tripsService);
});

// Create ride request notifier
class CreateRideRequestNotifier extends StateNotifier<AsyncValue<String>> {
  final TripsService tripsService;

  CreateRideRequestNotifier(this.tripsService) : super(const AsyncValue.data(''));

  Future<void> createRequest({
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
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(
      () => tripsService.createRideRequest(
        origin: origin,
        destination: destination,
        originLat: originLat,
        originLng: originLng,
        destLat: destLat,
        destLng: destLng,
        departureTime: departureTime,
        departureTimeEnd: departureTimeEnd,
        womenOnly: womenOnly,
      ),
    );
  }
}

final createRideRequestProvider =
    StateNotifierProvider.autoDispose<CreateRideRequestNotifier, AsyncValue<String>>((ref) {
  final tripsService = ref.watch(tripsServiceProvider);
  return CreateRideRequestNotifier(tripsService);
});
