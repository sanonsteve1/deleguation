import '../utils/date_utils.dart';

class PositionGps {
  final int? id;
  final int sessionId;
  final DateTime timestamp;
  final double latitude;
  final double longitude;
  final double? precision;
  final bool synchronise;

  PositionGps({
    this.id,
    required this.sessionId,
    required this.timestamp,
    required this.latitude,
    required this.longitude,
    this.precision,
    required this.synchronise,
  });

  factory PositionGps.fromJson(Map<String, dynamic> json) {
    return PositionGps(
      id: json['id'] is int ? json['id'] : (json['id'] as num?)?.toInt(),
      sessionId: json['sessionTravail'] != null 
          ? (json['sessionTravail'] is Map
              ? (json['sessionTravail']['id'] is int 
                  ? json['sessionTravail']['id'] 
                  : (json['sessionTravail']['id'] as num?)?.toInt())
              : (json['sessionId'] is int ? json['sessionId'] : (json['sessionId'] as num?)?.toInt()))
          : (json['sessionId'] is int ? json['sessionId'] : (json['sessionId'] as num?)?.toInt()),
      timestamp: DateUtils.parseDateTime(json['timestamp']),
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      precision: json['precision'] != null 
          ? (json['precision'] as num).toDouble()
          : (json['precision_gps'] != null ? (json['precision_gps'] as num).toDouble() : null),
      synchronise: json['synchronise'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'sessionId': sessionId,
      'timestamp': timestamp.toIso8601String(),
      'latitude': latitude,
      'longitude': longitude,
      'precision': precision,
      'synchronise': synchronise,
    };
  }
}
