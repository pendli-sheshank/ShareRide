class Rating {
  final String id;
  final String raterId;
  final String rateeId;
  final int rating;
  final String? review;
  final String? tripOfferId;
  final DateTime createdAt;

  Rating({
    required this.id,
    required this.raterId,
    required this.rateeId,
    required this.rating,
    this.review,
    this.tripOfferId,
    required this.createdAt,
  });

  bool get isPositive => rating >= 4;
  bool get isNegative => rating <= 2;

  factory Rating.fromJson(Map<String, dynamic> json) {
    return Rating(
      id: json['id'] as String,
      raterId: json['rater_id'] as String,
      rateeId: json['ratee_id'] as String,
      rating: json['rating'] as int,
      review: json['review'] as String?,
      tripOfferId: json['trip_offer_id'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'rater_id': raterId,
      'ratee_id': rateeId,
      'rating': rating,
      'review': review,
      'trip_offer_id': tripOfferId,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
