/// Utilitaires pour le parsing des dates depuis différents formats
class DateUtils {
  /// Parse une date depuis différents formats possibles :
  /// - String (format ISO 8601)
  /// - List (format [année, mois, jour, heure, minute, seconde, nanosecondes])
  /// - Map (objet date avec des champs séparés)
  static DateTime parseDateTime(dynamic value) {
    if (value == null) {
      throw Exception('Valeur de date null');
    }
    
    // Cas 1: String (format ISO 8601)
    if (value is String) {
      if (value.isEmpty) {
        throw Exception('Chaîne de date vide');
      }
      try {
        return DateTime.parse(value);
      } catch (e) {
        throw Exception('Format de date invalide: $value - $e');
      }
    }
    
    // Cas 2: List (format [année, mois, jour, heure, minute, seconde, nanosecondes])
    if (value is List) {
      try {
        if (value.length < 3) {
          throw Exception('Liste de date trop courte: ${value.length} éléments, minimum 3 attendus');
        }
        final year = (value[0] as num).toInt();
        final month = (value[1] as num).toInt();
        final day = (value[2] as num).toInt();
        final hour = value.length > 3 ? (value[3] as num).toInt() : 0;
        final minute = value.length > 4 ? (value[4] as num).toInt() : 0;
        final second = value.length > 5 ? (value[5] as num).toInt() : 0;
        // Les nanosecondes (value[6]) sont ignorées car DateTime n'accepte que des millisecondes
        return DateTime(year, month, day, hour, minute, second);
      } catch (e) {
        throw Exception('Erreur lors du parsing de date depuis List: $value - $e');
      }
    }
    
    // Cas 3: Map (objet date avec des champs séparés)
    if (value is Map) {
      try {
        final year = value['year'] ?? value['nano'] ?? DateTime.now().year;
        final month = value['month'] ?? value['monthValue'] ?? DateTime.now().month;
        final day = value['day'] ?? value['dayOfMonth'] ?? DateTime.now().day;
        final hour = value['hour'] ?? 0;
        final minute = value['minute'] ?? 0;
        final second = value['second'] ?? 0;
        return DateTime(year as int, month as int, day as int, hour as int, minute as int, second as int);
      } catch (e) {
        throw Exception('Erreur lors du parsing de date depuis Map: $value - $e');
      }
    }
    
    throw Exception('Format de date invalide: $value (type: ${value.runtimeType})');
  }
  
  /// Parse une date nullable
  static DateTime? parseDateTimeNullable(dynamic value) {
    if (value == null) {
      return null;
    }
    try {
      return parseDateTime(value);
    } catch (e) {
      return null;
    }
  }
}
