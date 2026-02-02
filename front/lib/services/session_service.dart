import 'dart:async';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:geolocator/geolocator.dart';
import 'package:workmanager/workmanager.dart';
import '../models/session_travail.dart';
import '../models/position_gps.dart';
import 'api_service.dart';
import 'location_service.dart';
import 'sync_service.dart';
import 'background_location_service.dart';
import 'background_location_worker.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class SessionService {
  final ApiService _apiService = ApiService();
  final LocationService _locationService = LocationService();
  final SyncService _syncService = SyncService();
  final BackgroundLocationService _backgroundLocationService = BackgroundLocationService();
  Timer? _positionTimer;
  SessionTravail? _sessionEnCours;
  static const String backgroundTaskName = "backgroundLocationTask";

  SessionTravail? get sessionEnCours => _sessionEnCours;

  // Démarre une session de travail
  Future<SessionTravail> demarrerSession() async {
    try {
      // Vérifier d'abord s'il n'y a pas déjà une session en cours
      SessionTravail? sessionExistante = await _apiService.getSessionEnCours();
      if (sessionExistante != null && sessionExistante.estEnCours) {
        // Une session existe déjà, la retourner
        _sessionEnCours = sessionExistante;
        await _sauvegarderSessionLocale(sessionExistante);
        _demarrerSuiviGps(sessionExistante.id!);
        throw Exception('Une session est déjà en cours pour cet utilisateur');
      }
      
      // Demander automatiquement la permission en arrière-plan lors du démarrage
      Position position = await _locationService.getCurrentPosition(requestBackground: true);
      SessionTravail session = await _apiService.demarrerSession(
        position.latitude,
        position.longitude,
      );
      
      _sessionEnCours = session;
      await _sauvegarderSessionLocale(session);
      
      // Démarrer le suivi GPS toutes les 5 minutes (RQ-04)
      print('[SessionService] Session démarrée avec succès, ID: ${session.id}');
      _demarrerSuiviGps(session.id!);
      
      return session;
    } catch (e) {
      String errorString = e.toString().toLowerCase();
      
      // Si l'erreur indique qu'une session existe déjà, ne pas créer de session locale
      if (errorString.contains('déjà en cours') || 
          (errorString.contains('session') && errorString.contains('existe'))) {
        // Essayer de charger la session existante
        try {
          SessionTravail? sessionExistante = await _apiService.getSessionEnCours();
          if (sessionExistante != null && sessionExistante.estEnCours) {
            _sessionEnCours = sessionExistante;
            await _sauvegarderSessionLocale(sessionExistante);
            _demarrerSuiviGps(sessionExistante.id!);
          }
        } catch (loadError) {
          print('Erreur lors du chargement de la session existante: $loadError');
        }
        throw e;
      }
      
      // En cas d'autre erreur, sauvegarder localement pour synchronisation ultérieure
      try {
        Position position = await _locationService.getCurrentPosition();
        SessionTravail sessionLocale = SessionTravail(
          heureDebut: DateTime.now(),
          latitudeDebut: position.latitude,
          longitudeDebut: position.longitude,
          synchronise: false,
        );
        await _sauvegarderSessionLocale(sessionLocale);
        await _syncService.sauvegarderSessionPending(sessionLocale);
        await _sauvegarderDernierePosition(position);
        _sessionEnCours = sessionLocale;
        // Démarrer le suivi GPS même en mode hors ligne
        _demarrerSuiviGps(null);
        // Retourner la session locale au lieu de lancer une exception
        return sessionLocale;
      } catch (positionError) {
        print('Erreur lors de la sauvegarde locale: $positionError');
        throw e;
      }
    }
  }

  // Arrête la session en cours
  Future<SessionTravail> arreterSession() async {
    if (_sessionEnCours == null) {
      throw Exception('Aucune session en cours');
    }

    print('[SessionService] Début de l\'arrêt de session');
    
    // Sauvegarder la session locale avant de la modifier
    final sessionLocale = _sessionEnCours!;
    
    // Arrêter immédiatement le suivi GPS pour éviter les opérations inutiles
    _arreterSuiviGps();
    
    // Marquer la session comme arrêtée localement AVANT l'appel serveur
    // pour éviter que le suivi GPS continue pendant l'appel
    _sessionEnCours = null;
    
    // Récupérer la dernière position connue en cache si disponible
    Position? position;
    try {
      final prefs = await SharedPreferences.getInstance();
      final lastPositionJson = prefs.getString('last_known_position');
      if (lastPositionJson != null) {
        final lastPosition = jsonDecode(lastPositionJson);
        // Utiliser la position en cache si elle est récente (moins de 2 minutes)
        final timestamp = DateTime.parse(lastPosition['timestamp']);
        if (DateTime.now().difference(timestamp).inMinutes < 2) {
          print('[SessionService] Utilisation de la position en cache pour l\'arrêt');
          // Créer un objet Position à partir des données en cache
          // Note: On ne peut pas créer un vrai Position, donc on va récupérer une nouvelle position
          // mais avec un timeout plus court
        }
      }
    } catch (e) {
      print('[SessionService] Erreur lors de la récupération de la position en cache: $e');
    }

    try {
      // Récupérer la position avec un timeout court pour accélérer l'arrêt
      position = await _locationService.getCurrentPosition(requestBackground: false)
          .timeout(const Duration(seconds: 3));
      print('[SessionService] Position GPS obtenue rapidement');
    } on TimeoutException {
      print('[SessionService] Timeout GPS (3s), utilisation des coordonnées de début');
      position = null;
    } catch (e) {
      print('[SessionService] Erreur lors de la récupération de la position: $e');
      position = null;
    }

    // Utiliser la position récupérée ou les coordonnées de début comme fallback
    final latitudeDebut = sessionLocale.latitudeDebut;
    final longitudeDebut = sessionLocale.longitudeDebut;
    double latitude = position?.latitude ?? latitudeDebut;
    double longitude = position?.longitude ?? longitudeDebut;

    try {
      // Arrêter la session sur le serveur (avec timeout)
      SessionTravail session = await _apiService.arreterSession(
        latitude,
        longitude,
      ).timeout(const Duration(seconds: 10), onTimeout: () {
        throw Exception('Timeout lors de l\'arrêt de la session sur le serveur');
      });
      
      _sessionEnCours = null;
      await _supprimerSessionLocale();
      
      return session;
    } catch (e) {
      print('[SessionService] Erreur lors de l\'arrêt sur le serveur: $e');
      // En cas d'erreur, arrêter localement immédiatement
      SessionTravail sessionArretee = SessionTravail(
          id: sessionLocale.id,
          idUtilisateur: sessionLocale.idUtilisateur,
          heureDebut: sessionLocale.heureDebut,
          heureFin: DateTime.now(),
          latitudeDebut: sessionLocale.latitudeDebut,
          longitudeDebut: sessionLocale.longitudeDebut,
          latitudeFin: latitude,
          longitudeFin: longitude,
          synchronise: false,
        );
        
        // Sauvegarder en parallèle pour accélérer
        await Future.wait([
          _sauvegarderSessionLocale(sessionArretee),
          _syncService.sauvegarderSessionPending(sessionArretee),
          if (position != null) _sauvegarderDernierePosition(position),
        ]);
        
      print('[SessionService] Session arrêtée localement (mode offline)');
      return sessionArretee;
    }
  }

  // Charge la session en cours depuis le serveur ou le stockage local
  Future<void> chargerSessionEnCours() async {
    try {
      _sessionEnCours = await _apiService.getSessionEnCours();
      if (_sessionEnCours != null && _sessionEnCours!.estEnCours) {
        _demarrerSuiviGps(_sessionEnCours!.id!);
      }
    } catch (e) {
      // Charger depuis le stockage local si erreur réseau
      _sessionEnCours = await _chargerSessionLocale();
      if (_sessionEnCours != null && _sessionEnCours!.estEnCours) {
        // Démarrer le suivi GPS même si la session n'a pas d'ID (mode offline)
        _demarrerSuiviGps(_sessionEnCours!.id);
      }
    }
  }

  // Démarre le suivi GPS en arrière-plan avec workmanager
  void _demarrerSuiviGps(int? sessionId) async {
    print('[SessionService] Démarrage du suivi GPS en arrière-plan pour la session: $sessionId');
    _arreterSuiviGps();
    
    // Enregistrer immédiatement une première position
    _enregistrerPositionGPS();
    
    // Démarrer workmanager pour le suivi en arrière-plan (même si l'app est fermée)
    // Workmanager ne fonctionne que sur mobile (Android/iOS), pas sur le web
    if (!kIsWeb) {
      try {
        // Initialiser workmanager si ce n'est pas déjà fait
        await Workmanager().initialize(
          callbackDispatcher,
          isInDebugMode: false,
        );
        
        // Enregistrer une tâche périodique (toutes les 5 minutes)
        await Workmanager().registerPeriodicTask(
          backgroundTaskName,
          backgroundTaskName,
          frequency: const Duration(minutes: 5),
          constraints: Constraints(
            networkType: NetworkType.notRequired,
            requiresBatteryNotLow: false,
            requiresCharging: false,
            requiresDeviceIdle: false,
            requiresStorageNotLow: false,
          ),
          initialDelay: const Duration(minutes: 5),
        );
        
        print('[SessionService] Workmanager configuré pour le suivi en arrière-plan');
      } catch (e) {
        print('[SessionService] Erreur lors de la configuration de workmanager: $e');
      }
    } else {
      print('[SessionService] Workmanager ignoré (plateforme web)');
    }
    
    // Démarrer aussi le suivi continu quand l'app est ouverte (pour une meilleure précision)
    try {
      _backgroundLocationService.startTracking(
        onPositionUpdate: (Position position) {
          // Enregistrer chaque nouvelle position
          _enregistrerPositionGPSFromPosition(position);
        },
        interval: const Duration(minutes: 5),
        accuracy: LocationAccuracy.high,
      );
      print('[SessionService] Suivi GPS en continu démarré (app ouverte)');
    } catch (e) {
      print('[SessionService] Erreur lors du démarrage du suivi continu: $e');
      // Fallback sur le timer si le background location ne fonctionne pas
      _positionTimer = Timer.periodic(const Duration(minutes: 5), (timer) async {
        await _enregistrerPositionGPS();
      });
    }
  }
  
  // Méthode privée pour enregistrer une position GPS
  Future<void> _enregistrerPositionGPS() async {
    // Vérifier que la session existe toujours et est en cours
    if (_sessionEnCours == null || !_sessionEnCours!.estEnCours) {
      print('[SessionService] Session terminée ou inexistante, arrêt du suivi GPS');
      _arreterSuiviGps();
      return;
    }

    // Utiliser l'ID de la session actuelle
    final currentSessionId = _sessionEnCours!.id;
    print('[SessionService] Enregistrement position GPS pour session: $currentSessionId');

    try {
      Position position = await _locationService.getCurrentPosition();
      print('[SessionService] Position GPS obtenue: lat=${position.latitude}, lon=${position.longitude}');
      
      // Sauvegarder la dernière position connue pour la synchronisation
      await _sauvegarderDernierePosition(position);
      
      if (currentSessionId != null) {
        // Si la session a un ID, essayer d'enregistrer sur le serveur
        try {
          await _apiService.enregistrerPosition(
            currentSessionId,
            position.latitude,
            position.longitude,
            position.accuracy,
          );
          print('[SessionService] Position enregistrée avec succès sur le serveur');
        } catch (e) {
          String errorString = e.toString().toLowerCase();
          print('[SessionService] Erreur lors de l\'enregistrement sur le serveur: $e');
          
          // Si la session n'existe plus (404) ou est clôturée (409), arrêter le timer
          if (errorString.contains('non trouvée') || 
              errorString.contains('clôturée') || 
              errorString.contains('cloturée') ||
              errorString.contains('not found') ||
              errorString.contains('déjà clôturée') ||
              errorString.contains('deja cloturee') ||
              errorString.contains('409') ||
              errorString.contains('conflict')) {
            print('[SessionService] Session n\'existe plus ou est clôturée, arrêt du suivi GPS');
            // Mettre à jour l'état de la session localement
            _sessionEnCours = null;
            await _supprimerSessionLocale();
            _arreterSuiviGps();
            return;
          }
          
          // En cas d'autre erreur réseau, sauvegarder localement
          print('[SessionService] Sauvegarde locale de la position (mode offline)');
          final positionGps = PositionGps(
            sessionId: currentSessionId,
            timestamp: DateTime.now(),
            latitude: position.latitude,
            longitude: position.longitude,
            precision: position.accuracy,
            synchronise: false,
          );
          await _syncService.sauvegarderPositionPending(positionGps);
          print('[SessionService] Position sauvegardée localement pour synchronisation ultérieure');
        }
      } else {
        // Mode offline : sauvegarder localement avec un identifiant temporaire
        // Utiliser l'heure de début comme identifiant temporaire
        final tempSessionId = _sessionEnCours!.heureDebut.millisecondsSinceEpoch;
        print('[SessionService] Mode offline - sauvegarde locale avec ID temporaire: $tempSessionId');
        final positionGps = PositionGps(
          sessionId: tempSessionId,
          timestamp: DateTime.now(),
          latitude: position.latitude,
          longitude: position.longitude,
          precision: position.accuracy,
          synchronise: false,
        );
        await _syncService.sauvegarderPositionPending(positionGps);
        print('[SessionService] Position sauvegardée localement (mode offline)');
      }
    } catch (e) {
      print('[SessionService] Erreur lors de l\'enregistrement de la position: $e');
      // Ne pas arrêter le timer en cas d'erreur GPS temporaire
      // Le timer continuera à essayer toutes les 5 minutes
    }
  }
  
  // Sauvegarde la dernière position connue pour la synchronisation
  Future<void> _sauvegarderDernierePosition(Position position) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('last_known_position', jsonEncode({
      'latitude': position.latitude,
      'longitude': position.longitude,
      'timestamp': DateTime.now().toIso8601String(),
    }));
  }

  // Arrête le suivi GPS
  void _arreterSuiviGps() async {
    print('[SessionService] Arrêt du suivi GPS');
    
    // Arrêter le timer si actif
    if (_positionTimer != null) {
      _positionTimer?.cancel();
      _positionTimer = null;
    }
    
    // Arrêter le suivi continu
    try {
      await _backgroundLocationService.stopTracking();
      print('[SessionService] Suivi continu arrêté');
    } catch (e) {
      print('[SessionService] Erreur lors de l\'arrêt du suivi continu: $e');
    }
    
    // Annuler la tâche workmanager (uniquement sur mobile)
    if (!kIsWeb) {
      try {
        await Workmanager().cancelByUniqueName(backgroundTaskName);
        print('[SessionService] Tâche workmanager annulée');
      } catch (e) {
        print('[SessionService] Erreur lors de l\'annulation de workmanager: $e');
      }
    }
  }
  
  // Enregistre une position GPS à partir d'un objet Position
  Future<void> _enregistrerPositionGPSFromPosition(Position position) async {
    // Vérifier que la session existe toujours et est en cours
    if (_sessionEnCours == null || !_sessionEnCours!.estEnCours) {
      print('[SessionService] Session terminée ou inexistante, arrêt du suivi GPS');
      _arreterSuiviGps();
      return;
    }

    // Utiliser l'ID de la session actuelle
    final currentSessionId = _sessionEnCours!.id;
    print('[SessionService] Enregistrement position GPS (background) pour session: $currentSessionId');

    try {
      // Sauvegarder la dernière position connue pour la synchronisation
      await _sauvegarderDernierePosition(position);
      
      if (currentSessionId != null) {
        // Si la session a un ID, essayer d'enregistrer sur le serveur
        try {
          await _apiService.enregistrerPosition(
            currentSessionId,
            position.latitude,
            position.longitude,
            position.accuracy,
          );
          print('[SessionService] Position enregistrée avec succès sur le serveur (background)');
        } catch (e) {
          String errorString = e.toString().toLowerCase();
          print('[SessionService] Erreur lors de l\'enregistrement sur le serveur: $e');
          
          // Si la session n'existe plus (404) ou est clôturée (409), arrêter le suivi
          if (errorString.contains('non trouvée') || 
              errorString.contains('clôturée') || 
              errorString.contains('cloturée') ||
              errorString.contains('déjà clôturée') ||
              errorString.contains('deja cloturee') ||
              errorString.contains('not found') ||
              errorString.contains('session clôturée') ||
              errorString.contains('409') ||
              errorString.contains('conflict')) {
            print('[SessionService] Session n\'existe plus ou est clôturée, arrêt du suivi GPS');
            // Mettre à jour l'état de la session localement pour éviter d'autres tentatives
            _sessionEnCours = null;
            await _supprimerSessionLocale();
            _arreterSuiviGps();
            return;
          }
          
          // En cas d'autre erreur réseau, sauvegarder localement
          print('[SessionService] Sauvegarde locale de la position (mode offline)');
          final positionGps = PositionGps(
            sessionId: currentSessionId,
            timestamp: DateTime.now(),
            latitude: position.latitude,
            longitude: position.longitude,
            precision: position.accuracy,
            synchronise: false,
          );
          await _syncService.sauvegarderPositionPending(positionGps);
          print('[SessionService] Position sauvegardée localement pour synchronisation ultérieure');
        }
      } else {
        // Mode offline : sauvegarder localement avec un identifiant temporaire
        final tempSessionId = _sessionEnCours!.heureDebut.millisecondsSinceEpoch;
        print('[SessionService] Mode offline - sauvegarde locale avec ID temporaire: $tempSessionId');
        final positionGps = PositionGps(
          sessionId: tempSessionId,
          timestamp: DateTime.now(),
          latitude: position.latitude,
          longitude: position.longitude,
          precision: position.accuracy,
          synchronise: false,
        );
        await _syncService.sauvegarderPositionPending(positionGps);
        print('[SessionService] Position sauvegardée localement (mode offline)');
      }
    } catch (e) {
      print('[SessionService] Erreur lors de l\'enregistrement de la position: $e');
    }
  }

  // Sauvegarde locale pour mode hors ligne
  Future<void> _sauvegarderSessionLocale(SessionTravail session) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('session_en_cours', jsonEncode(session.toJson()));
  }

  Future<SessionTravail?> _chargerSessionLocale() async {
    final prefs = await SharedPreferences.getInstance();
    final sessionJson = prefs.getString('session_en_cours');
    if (sessionJson != null) {
      return SessionTravail.fromJson(jsonDecode(sessionJson));
    }
    return null;
  }

  Future<void> _supprimerSessionLocale() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('session_en_cours');
  }
}
