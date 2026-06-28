class Vehicle {
  final String id;
  final String ownerId;
  final String make;
  final String model;
  final int year;
  final String licensePlate;
  final String color;
  final int seatsTotal;
  final String? registrationNumber;
  final String? insuranceProvider;
  final DateTime createdAt;

  Vehicle({
    required this.id,
    required this.ownerId,
    required this.make,
    required this.model,
    required this.year,
    required this.licensePlate,
    required this.color,
    required this.seatsTotal,
    this.registrationNumber,
    this.insuranceProvider,
    required this.createdAt,
  });

  String get displayName => '$year $make $model';

  factory Vehicle.fromJson(Map<String, dynamic> json) {
    return Vehicle(
      id: json['id'] as String,
      ownerId: json['owner_id'] as String,
      make: json['make'] as String,
      model: json['model'] as String,
      year: json['year'] as int,
      licensePlate: json['license_plate'] as String,
      color: json['color'] as String,
      seatsTotal: json['seats_total'] as int,
      registrationNumber: json['registration_number'] as String?,
      insuranceProvider: json['insurance_provider'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'owner_id': ownerId,
      'make': make,
      'model': model,
      'year': year,
      'license_plate': licensePlate,
      'color': color,
      'seats_total': seatsTotal,
      'registration_number': registrationNumber,
      'insurance_provider': insuranceProvider,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
