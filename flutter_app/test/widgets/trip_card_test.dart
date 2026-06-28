import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import '../../lib/models/trip_offer.dart';
import '../../lib/widgets/trip_card.dart';

void main() {
  group('TripCard Widget', () {
    late TripOffer mockTrip;

    setUp(() {
      mockTrip = TripOffer(
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
        },
        createdAt: DateTime.now(),
      );
    });

    testWidgets('displays trip route information', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: TripCard(trip: mockTrip),
          ),
        ),
      );

      // Check origin and destination are displayed
      expect(find.text('Delhi'), findsOneWidget);
      expect(find.text('Mumbai'), findsOneWidget);
    });

    testWidgets('displays cost per seat', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: TripCard(trip: mockTrip),
          ),
        ),
      );

      expect(find.text('₹500'), findsOneWidget);
    });

    testWidgets('displays available seats', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: TripCard(trip: mockTrip),
          ),
        ),
      );

      expect(find.text('3 seats'), findsOneWidget);
    });

    testWidgets('displays host name', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: TripCard(trip: mockTrip),
          ),
        ),
      );

      expect(find.text('John Doe'), findsOneWidget);
    });

    testWidgets('displays host rating', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: TripCard(trip: mockTrip),
          ),
        ),
      );

      expect(find.text('4.5'), findsOneWidget);
    });

    testWidgets('calls onTap when card is tapped', (WidgetTester tester) async {
      bool tapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: TripCard(
              trip: mockTrip,
              onTap: () => tapped = true,
            ),
          ),
        ),
      );

      await tester.tap(find.byType(GestureDetector));
      expect(tapped, true);
    });

    testWidgets('shows Join button when seats available', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: TripCard(trip: mockTrip, onJoin: () {}),
          ),
        ),
      );

      expect(find.text('Join'), findsOneWidget);
    });

    testWidgets('hides Join button when trip is full', (WidgetTester tester) async {
      final fullTrip = mockTrip.copyWith(seatsBooked: 4);

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: TripCard(trip: fullTrip, onJoin: () {}),
          ),
        ),
      );

      expect(find.text('Join'), findsNothing);
    });

    testWidgets('calls onJoin when Join button is tapped', (WidgetTester tester) async {
      bool joined = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: TripCard(
              trip: mockTrip,
              onJoin: () => joined = true,
            ),
          ),
        ),
      );

      await tester.tap(find.text('Join'));
      expect(joined, true);
    });
  });
}

extension TripOfferCopy on TripOffer {
  TripOffer copyWith({
    int? seatsBooked,
  }) {
    return TripOffer(
      id: id,
      hostId: hostId,
      origin: origin,
      destination: destination,
      originLat: originLat,
      originLng: originLng,
      destLat: destLat,
      destLng: destLng,
      departureTime: departureTime,
      recurringRule: recurringRule,
      costPerSeat: costPerSeat,
      seatsAvailable: seatsAvailable,
      seatsBooked: seatsBooked ?? this.seatsBooked,
      womenOnly: womenOnly,
      status: status,
      host: host,
      createdAt: createdAt,
    );
  }
}
