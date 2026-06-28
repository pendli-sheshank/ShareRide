class User {
  final String id;
  final String email;
  final String? phoneNumber;
  final String? displayName;
  final String? avatarUrl;
  final double? averageRating;
  final int? noShowCount;
  final String verificationTier; // 'email_only', 'vouched', 'id_verified'

  User({
    required this.id,
    required this.email,
    this.phoneNumber,
    this.displayName,
    this.avatarUrl,
    this.averageRating,
    this.noShowCount,
    required this.verificationTier,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      email: json['email'] as String? ?? '',
      phoneNumber: json['phone_number'] as String?,
      displayName: json['display_name'] as String?,
      avatarUrl: json['avatar_url'] as String?,
      averageRating: (json['average_rating'] as num?)?.toDouble(),
      noShowCount: json['no_show_count'] as int?,
      verificationTier: json['verification_tier'] as String? ?? 'email_only',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'phone_number': phoneNumber,
      'display_name': displayName,
      'avatar_url': avatarUrl,
      'average_rating': averageRating,
      'no_show_count': noShowCount,
      'verification_tier': verificationTier,
    };
  }
}
