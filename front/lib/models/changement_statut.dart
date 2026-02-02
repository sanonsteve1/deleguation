import 'statut.dart';
import '../utils/date_utils.dart';

class ChangementStatut {
  final int? id;
  final int sessionId;
  final Statut statut;
  final DateTime timestamp;
  final bool synchronise;

  ChangementStatut({
    this.id,
    required this.sessionId,
    required this.statut,
    required this.timestamp,
    required this.synchronise,
  });

  factory ChangementStatut.fromJson(Map<String, dynamic> json) {
    return ChangementStatut(
      id: json['id'] is int ? json['id'] : (json['id'] as num?)?.toInt(),
      sessionId: json['sessionTravail'] != null 
          ? (json['sessionTravail'] is Map
              ? (json['sessionTravail']['id'] is int 
                  ? json['sessionTravail']['id'] 
                  : (json['sessionTravail']['id'] as num?)?.toInt())
              : (json['sessionId'] is int ? json['sessionId'] : (json['sessionId'] as num?)?.toInt()))
          : (json['sessionId'] is int ? json['sessionId'] : (json['sessionId'] as num?)?.toInt()),
      statut: json['statut'] != null 
          ? Statut.fromJson(json['statut'] is Map ? json['statut'] as Map<String, dynamic> : {})
          : Statut(codeStatut: '', libelle: ''),
      timestamp: DateUtils.parseDateTime(json['timestamp']),
      synchronise: json['synchronise'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'sessionId': sessionId,
      'codeStatut': statut.codeStatut,
      'timestamp': timestamp.toIso8601String(),
      'synchronise': synchronise,
    };
  }
}
