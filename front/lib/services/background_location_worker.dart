import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'package:workmanager/workmanager.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'api_service.dart';
import '../models/position_gps.dart';
import '../models/session_travail.dart';

/// Callback pour workmanager - s'exécute en arrière-plan
@pragma('vm:entry-point')
void callbackDispatcher() {
  Workmanager().executeTask((task, inputData) async {
    print('[BackgroundLocationWorker] Tâche exécutée: $task');
    
    try {
      // Récupérer les informations de la session depuis SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      final sessionJson = prefs.getString('session_en_cours');
      
      if (sessionJson == null) {
        print('[BackgroundLocationWorker] Aucune session en cours');
        return Future.value(true);
      }
      
      final sessionData = jsonDecode(sessionJson);
      final session = SessionTravail.fromJson(sessionData);
      
      if (!session.estEnCours || session.id == null) {
        print('[BackgroundLocationWorker] Session terminée ou sans ID');
        return Future.value(true);
      }
      
      // Vérifier les permissions GPS
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        print('[BackgroundLocationWorker] Service GPS désactivé');
        return Future.value(true);
      }
      
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied || 
          permission == LocationPermission.deniedForever) {
        print('[BackgroundLocationWorker] Permission GPS refusée');
        return Future.value(true);
      }
      
      // Récupérer la position actuelle
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 10),
      );
      
      print('[BackgroundLocationWorker] Position obtenue: lat=${position.latitude}, lon=${position.longitude}');
      
      // Sauvegarder la dernière position
      await prefs.setString('last_known_position', jsonEncode({
        'latitude': position.latitude,
        'longitude': position.longitude,
        'timestamp': DateTime.now().toIso8601String(),
        'accuracy': position.accuracy,
      }));
      
      // Enregistrer sur le serveur
      final apiService = ApiService();
      await apiService.loadTokenFromStorage();
      
      if (apiService.token == null || apiService.token!.isEmpty) {
        print('[BackgroundLocationWorker] Pas de token, sauvegarde locale uniquement');
        // Sauvegarder localement pour synchronisation ultérieure
        final positionGps = PositionGps(
          sessionId: session.id!,
          timestamp: DateTime.now(),
          latitude: position.latitude,
          longitude: position.longitude,
          precision: position.accuracy,
          synchronise: false,
        );
        await _sauvegarderPositionPending(prefs, positionGps);
        return Future.value(true);
      }
      
      try {
        await apiService.enregistrerPosition(
          session.id!,
          position.latitude,
          position.longitude,
          position.accuracy,
        );
        print('[BackgroundLocationWorker] Position enregistrée avec succès sur le serveur');
      } catch (e) {
        print('[BackgroundLocationWorker] Erreur lors de l\'enregistrement: $e');
        // Sauvegarder localement pour synchronisation ultérieure
        final positionGps = PositionGps(
          sessionId: session.id!,
          timestamp: DateTime.now(),
          latitude: position.latitude,
          longitude: position.longitude,
          precision: position.accuracy,
          synchronise: false,
        );
        await _sauvegarderPositionPending(prefs, positionGps);
      }
      
      return Future.value(true);
    } catch (e) {
      print('[BackgroundLocationWorker] Erreur: $e');
      return Future.value(true); // Retourner true pour ne pas réessayer immédiatement
    }
  });
}

/// Sauvegarde une position en attente de synchronisation
Future<void> _sauvegarderPositionPending(SharedPreferences prefs, PositionGps position) async {
  try {
    final positions = prefs.getStringList('positions_pending') ?? [];
    positions.add(jsonEncode(position.toJson()));
    await prefs.setStringList('positions_pending', positions);
    print('[BackgroundLocationWorker] Position sauvegardée localement');
  } catch (e) {
    print('[BackgroundLocationWorker] Erreur lors de la sauvegarde locale: $e');
  }
}
