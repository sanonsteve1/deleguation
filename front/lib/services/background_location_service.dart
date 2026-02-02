import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

/// Service de suivi GPS en arrière-plan utilisant getPositionStream
class BackgroundLocationService {
  StreamSubscription<Position>? _positionStreamSubscription;
  bool _isTracking = false;
  Function(Position)? _onPositionUpdate;

  /// Démarre le suivi GPS en continu (fonctionne en arrière-plan si permissions accordées)
  Future<void> startTracking({
    required Function(Position) onPositionUpdate,
    Duration interval = const Duration(minutes: 5),
    LocationAccuracy accuracy = LocationAccuracy.high,
  }) async {
    if (_isTracking) {
      print('[BackgroundLocationService] Le suivi est déjà actif');
      return;
    }

    print('[BackgroundLocationService] Démarrage du suivi GPS en arrière-plan');
    
    // Vérifier les permissions
    bool hasPermission = await _checkPermissions();
    if (!hasPermission) {
      throw Exception('Permissions GPS non accordées pour le suivi en arrière-plan');
    }

    _onPositionUpdate = onPositionUpdate;
    _isTracking = true;

    // Configuration pour le suivi en arrière-plan
    LocationSettings locationSettings = LocationSettings(
      accuracy: accuracy,
      distanceFilter: 10, // Enregistrer seulement si déplacement de 10m minimum
      timeLimit: const Duration(minutes: 5), // Timeout de 5 minutes
    );

    try {
      // Utiliser getPositionStream pour un suivi continu
      _positionStreamSubscription = Geolocator.getPositionStream(
        locationSettings: locationSettings,
      ).listen(
        (Position position) {
          print('[BackgroundLocationService] Nouvelle position reçue: lat=${position.latitude}, lon=${position.longitude}, accuracy=${position.accuracy}m');
          _onPositionUpdate?.call(position);
          _sauvegarderDernierePosition(position);
        },
        onError: (error) {
          print('[BackgroundLocationService] Erreur dans le stream GPS: $error');
          // Ne pas arrêter le suivi en cas d'erreur temporaire
        },
        cancelOnError: false, // Continuer même en cas d'erreur
      );

      print('[BackgroundLocationService] Stream GPS démarré avec succès');
    } catch (e) {
      _isTracking = false;
      print('[BackgroundLocationService] Erreur lors du démarrage du stream: $e');
      rethrow;
    }
  }

  /// Arrête le suivi GPS
  Future<void> stopTracking() async {
    if (!_isTracking) {
      return;
    }

    print('[BackgroundLocationService] Arrêt du suivi GPS');
    await _positionStreamSubscription?.cancel();
    _positionStreamSubscription = null;
    _isTracking = false;
    _onPositionUpdate = null;
  }

  /// Vérifie si le suivi est actif
  bool get isTracking => _isTracking;

  /// Vérifie les permissions GPS (y compris en arrière-plan)
  Future<bool> _checkPermissions() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      print('[BackgroundLocationService] Service de localisation désactivé');
      return false;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    print('[BackgroundLocationService] Permission actuelle: $permission');

    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        print('[BackgroundLocationService] Permission refusée');
        return false;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      print('[BackgroundLocationService] Permission refusée définitivement');
      // NE PAS ouvrir automatiquement les paramètres
      return false;
    }

    // Pour Android 10+, accepter "whileInUse" comme permission valide
    // Le suivi fonctionnera quand l'app est ouverte
    if (permission == LocationPermission.whileInUse) {
      print('[BackgroundLocationService] Permission "en cours d\'utilisation" détectée - le suivi fonctionnera quand l\'app est ouverte');
      // Accepter cette permission et continuer - ne pas ouvrir les paramètres automatiquement
    }

    return permission != LocationPermission.denied && 
           permission != LocationPermission.deniedForever;
  }

  /// Sauvegarde la dernière position connue
  Future<void> _sauvegarderDernierePosition(Position position) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('last_known_position', jsonEncode({
        'latitude': position.latitude,
        'longitude': position.longitude,
        'timestamp': DateTime.now().toIso8601String(),
        'accuracy': position.accuracy,
      }));
    } catch (e) {
      print('[BackgroundLocationService] Erreur lors de la sauvegarde de la position: $e');
    }
  }

  /// Dispose des ressources
  void dispose() {
    stopTracking();
  }
}
