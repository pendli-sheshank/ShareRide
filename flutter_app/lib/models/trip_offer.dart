class TripOffer {
  final String id;
  final String hostId;
  final String origin;
  final String destination;
  final double originLat;
  final double originLng;
  final double destLat;
  final double destLng;
  final DateTime departureTime;
  final String? recurringRule;
  final int costPerSeat;
  final int seatsAvailable;
  final int seatsBooked;
  final bool womenOnly;
  final String status;
  final Map<String, dynamic>? host;
  final DateTime createdAt;

  TripOffer({
    required this.id,
    required this.hostId,
    required this.origin,
    required this.destination,
    required this.originLat,
    required this.originLng,
    required this.destLat,
    required this.destLng,
    required this.departureTime,
    this.recurringRule,
    required this.costPerSeat,
    required this.seatsAvailable,
    this.seatsBooked = 0,
    this.womenOnly = false,
    required this.status,
    this.host,
    required this.createdAt,
  });

  int get seatsRemaining => seatsAvailable - seatsBooked;
  bool get isFull => seatsRemaining <= 0;
  bool get isActive => status == 'active' && departureTime.isAfter(DateTime.now());

  factory TripOffer.fromJson(Map<String, dynamic> json) {
    return TripOffer(
      id: json['id'] as String,
      hostId: json['host_id'] as String,
      origin: json['origin'] as String,
      destination: json['destination'] as String,
      originLat: (json['origin_lat'] as num).toDouble(),
      originLng: (json['origin_lng'] as num).toDouble(),
      destLat: (json['dest_lat'] as num).toDouble(),
      destLng: (json['dest_lng'] as num).toDouble(),
      departureTime: DateTime.parse(json['departure_time'] as String),
      recurringRule: json['recurring_rule'] as String?,
      costPerSeat: json['cost_per_seat'] as int,
      seatsAvailable: json['seats_available'] as int,
      seatsBooked: json['seats_booked'] as int? ?? 0,
      womenOnly: json['women_only'] as bool? ?? false,
      status: json['status'] as String,
      host: json['users'] as Map<String, dynamic>?,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'host_id': hostId,
      'origin': origin,
      'destination': destination,
      'origin_lat': originLat,
      'origin_lng': originLng,
      'dest_lat': destLat,
      'dest_lng': destLng,
      'departure_time': departureTime.toIso8601String(),
      'recurring_rule': recurringRule,
      'cost_per_seat': costPerSeat,
      'seats_available': seatsAvailable,
      'seats_booked': seatsBooked,
      'women_only': womenOnly,
      'status': status,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
