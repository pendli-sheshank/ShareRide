class RideRequest {
  final String id;
  final String requesterId;
  final String origin;
  final String destination;
  final double originLat;
  final double originLng;
  final double destLat;
  final double destLng;
  final DateTime departureTime;
  final DateTime? departureTimeEnd;
  final bool womenOnly;
  final String status;
  final Map<String, dynamic>? requester;
  final DateTime createdAt;

  RideRequest({
    required this.id,
    required this.requesterId,
    required this.origin,
    required this.destination,
    required this.originLat,
    required this.originLng,
    required this.destLat,
    required this.destLng,
    required this.departureTime,
    this.departureTimeEnd,
    this.womenOnly = false,
    required this.status,
    this.requester,
    required this.createdAt,
  });

  bool get isActive =>
      status == 'active' && departureTime.isAfter(DateTime.now());

  factory RideRequest.fromJson(Map<String, dynamic> json) {
    return RideRequest(
      id: json['id'] as String,
      requesterId: json['requester_id'] as String,
      origin: json['origin'] as String,
      destination: json['destination'] as String,
      originLat: (json['origin_lat'] as num).toDouble(),
      originLng: (json['origin_lng'] as num).toDouble(),
      destLat: (json['dest_lat'] as num).toDouble(),
      destLng: (json['dest_lng'] as num).toDouble(),
      departureTime: DateTime.parse(json['departure_time'] as String),
      departureTimeEnd: json['departure_time_end'] != null
          ? DateTime.parse(json['departure_time_end'] as String)
          : null,
      womenOnly: json['women_only'] as bool? ?? false,
      status: json['status'] as String,
      requester: json['users'] as Map<String, dynamic>?,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'requester_id': requesterId,
      'origin': origin,
      'destination': destination,
      'origin_lat': originLat,
      'origin_lng': originLng,
      'dest_lat': destLat,
      'dest_lng': destLng,
      'departure_time': departureTime.toIso8601String(),
      'departure_time_end': departureTimeEnd?.toIso8601String(),
      'women_only': womenOnly,
      'status': status,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
