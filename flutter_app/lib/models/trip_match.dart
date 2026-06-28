class TripMatch {
  final String id;
  final String tripOfferId;
  final String? rideRequestId;
  final String hostId;
  final String riderId;
  final double costPerRider;
  final String status;
  final String? riderJoinTime;
  final String? riderLeaveTime;
  final bool hostNoShow;
  final bool riderNoShow;
  final Map<String, dynamic>? tripOffer;
  final Map<String, dynamic>? rideRequest;
  final Map<String, dynamic>? rider;
  final Map<String, dynamic>? host;
  final DateTime createdAt;

  TripMatch({
    required this.id,
    required this.tripOfferId,
    this.rideRequestId,
    required this.hostId,
    required this.riderId,
    required this.costPerRider,
    required this.status,
    this.riderJoinTime,
    this.riderLeaveTime,
    this.hostNoShow = false,
    this.riderNoShow = false,
    this.tripOffer,
    this.rideRequest,
    this.rider,
    this.host,
    required this.createdAt,
  });

  bool get isAccepted => status == 'accepted';
  bool get isPending => status == 'pending';
  bool get isCancelled => status == 'cancelled';
  bool get isCompleted => status == 'completed';

  factory TripMatch.fromJson(Map<String, dynamic> json) {
    return TripMatch(
      id: json['id'] as String,
      tripOfferId: json['trip_offer_id'] as String,
      rideRequestId: json['ride_request_id'] as String?,
      hostId: json['host_id'] as String,
      riderId: json['rider_id'] as String,
      costPerRider: (json['cost_per_rider'] as num).toDouble(),
      status: json['status'] as String,
      riderJoinTime: json['rider_join_time'] as String?,
      riderLeaveTime: json['rider_leave_time'] as String?,
      hostNoShow: json['host_no_show'] as bool? ?? false,
      riderNoShow: json['rider_no_show'] as bool? ?? false,
      tripOffer: json['trip_offers'] as Map<String, dynamic>?,
      rideRequest: json['ride_requests'] as Map<String, dynamic>?,
      rider: json['riders'] as Map<String, dynamic>?,
      host: json['hosts'] as Map<String, dynamic>?,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'trip_offer_id': tripOfferId,
      'ride_request_id': rideRequestId,
      'host_id': hostId,
      'rider_id': riderId,
      'cost_per_rider': costPerRider,
      'status': status,
      'rider_join_time': riderJoinTime,
      'rider_leave_time': riderLeaveTime,
      'host_no_show': hostNoShow,
      'rider_no_show': riderNoShow,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
