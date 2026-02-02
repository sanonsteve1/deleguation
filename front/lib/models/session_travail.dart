import '../utils/date_utils.dart';

class SessionTravail {
  final int? id;
  final int? idUtilisateur;
  final DateTime heureDebut;
  final DateTime? heureFin;
  final double latitudeDebut;
  final double longitudeDebut;
  final double? latitudeFin;
  final double? longitudeFin;
  final bool synchronise;

  SessionTravail({
    this.id,
    this.idUtilisateur,
    required this.heureDebut,
    this.heureFin,
    required this.latitudeDebut,
    required this.longitudeDebut,
    this.latitudeFin,
    this.longitudeFin,
    required this.synchronise,
  });

  factory SessionTravail.fromJson(Map<String, dynamic> json) {
    // Validation des champs requis
    if (json['heureDebut'] == null) {
      throw Exception('heureDebut est requis mais est null');
    }
    if (json['latitudeDebut'] == null) {
      throw Exception('latitudeDebut est requis mais est null');
    }
    if (json['longitudeDebut'] == null) {
      throw Exception('longitudeDebut est requis mais est null');
    }

    return SessionTravail(
      id: json['id'] is int ? json['id'] : (json['id'] as num?)?.toInt(),
      idUtilisateur: json['utilisateur'] != null 
          ? (json['utilisateur'] is Map 
              ? (json['utilisateur']['id'] != null
                  ? (json['utilisateur']['id'] is int 
                      ? json['utilisateur']['id'] 
                      : (json['utilisateur']['id'] as num?)?.toInt())
                  : null)
              : null)
          : (json['idUtilisateur'] is int ? json['idUtilisateur'] : (json['idUtilisateur'] as num?)?.toInt()),
      heureDebut: DateUtils.parseDateTime(json['heureDebut']),
      heureFin: DateUtils.parseDateTimeNullable(json['heureFin']),
      latitudeDebut: (json['latitudeDebut'] as num).toDouble(),
      longitudeDebut: (json['longitudeDebut'] as num).toDouble(),
      latitudeFin: json['latitudeFin'] != null ? (json['latitudeFin'] as num).toDouble() : null,
      longitudeFin: json['longitudeFin'] != null ? (json['longitudeFin'] as num).toDouble() : null,
      synchronise: json['synchronise'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'heureDebut': heureDebut.toIso8601String(),
      'heureFin': heureFin?.toIso8601String(),
      'latitudeDebut': latitudeDebut,
      'longitudeDebut': longitudeDebut,
      'latitudeFin': latitudeFin,
      'longitudeFin': longitudeFin,
      'synchronise': synchronise,
    };
  }

  bool get estEnCours => heureFin == null;
  
  Duration get duree {
    if (heureFin == null) {
      return DateTime.now().difference(heureDebut);
    }
    return heureFin!.difference(heureDebut);
  }
}
