import '../../lib/models/trip_offer.dart';
import '../../lib/models/ride_request.dart';
import '../../lib/models/trip_match.dart';
import '../../lib/models/chat_message.dart';
import '../../lib/models/rating.dart';

// Sample Trip Offers
final sampleTripOffers = [
  TripOffer(
    id: '1',
    hostId: 'host1',
    origin: 'Delhi',
    destination: 'Mumbai',
    originLat: 28.6139,
    originLng: 77.2090,
    destLat: 19.0760,
    destLng: 72.8777,
    departureTime: DateTime(2026, 7, 1, 10, 0),
    costPerSeat: 500,
    seatsAvailable: 4,
    seatsBooked: 1,
    womenOnly: false,
    status: 'active',
    host: {
      'id': 'host1',
      'display_name': 'John Doe',
      'average_rating': 4.5,
      'email': 'john@example.com',
    },
    createdAt: DateTime(2026, 6, 28),
  ),
  TripOffer(
    id: '2',
    hostId: 'host2',
    origin: 'Bangalore',
    destination: 'Chennai',
    originLat: 12.9716,
    originLng: 77.5946,
    destLat: 13.0827,
    destLng: 80.2707,
    departureTime: DateTime(2026, 7, 2, 14, 30),
    costPerSeat: 300,
    seatsAvailable: 2,
    seatsBooked: 2,
    womenOnly: true,
    status: 'active',
    host: {
      'id': 'host2',
      'display_name': 'Jane Smith',
      'average_rating': 4.8,
      'email': 'jane@example.com',
    },
    createdAt: DateTime(2026, 6, 27),
  ),
];

// Sample Ride Requests
final sampleRideRequests = [
  RideRequest(
    id: 'req1',
    requesterId: 'user1',
    origin: 'Delhi',
    destination: 'Agra',
    originLat: 28.6139,
    originLng: 77.2090,
    destLat: 27.1767,
    destLng: 78.0081,
    departureTime: DateTime(2026, 7, 3, 8, 0),
    departureTimeEnd: DateTime(2026, 7, 3, 12, 0),
    womenOnly: false,
    status: 'active',
    requester: {
      'id': 'user1',
      'display_name': 'Alice Johnson',
      'average_rating': 4.2,
    },
    createdAt: DateTime(2026, 6, 28),
  ),
];

// Sample Trip Matches
final sampleMatches = [
  TripMatch(
    id: 'match1',
    tripOfferId: '1',
    rideRequestId: null,
    hostId: 'host1',
    riderId: 'user1',
    costPerRider: 500.0,
    status: 'accepted',
    riderJoinTime: DateTime(2026, 6, 28, 15, 30).toIso8601String(),
    riderLeaveTime: null,
    hostNoShow: false,
    riderNoShow: false,
    tripOffer: sampleTripOffers[0],
    createdAt: DateTime(2026, 6, 28),
  ),
];

// Sample Chat Messages
final sampleChatMessages = [
  ChatMessage(
    id: 'msg1',
    matchId: 'match1',
    senderId: 'host1',
    body: 'Hi! Looking forward to the trip.',
    createdAt: DateTime(2026, 6, 28, 16, 0),
    readAt: DateTime(2026, 6, 28, 16, 5),
  ),
  ChatMessage(
    id: 'msg2',
    matchId: 'match1',
    senderId: 'user1',
    body: 'Me too! What time should I meet you?',
    createdAt: DateTime(2026, 6, 28, 16, 2),
    readAt: null,
  ),
];

// Sample Ratings
final sampleRatings = [
  Rating(
    id: 'rating1',
    raterId: 'host1',
    rateeId: 'user1',
    rating: 5,
    review: 'Great traveler! Very punctual.',
    tripOfferId: '1',
    createdAt: DateTime(2026, 7, 2),
  ),
  Rating(
    id: 'rating2',
    raterId: 'user1',
    rateeId: 'host1',
    rating: 4,
    review: 'Good driver, nice car.',
    tripOfferId: '1',
    createdAt: DateTime(2026, 7, 2),
  ),
];
