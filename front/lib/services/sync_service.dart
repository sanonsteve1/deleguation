import 'dart:async';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../models/session_travail.dart';
import '../models/position_gps.dart';
import '../models/changement_statut.dart';
import 'api_service.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

/// Service de synchronisation automatique pour le mode hors ligne (RQ-06)
class SyncService {
  final ApiService _apiService = ApiService();
  StreamSubscription<ConnectivityResult>? _connectivitySubscription;
  Timer? _syncTimer;
  bool _isSyncing = false;

  /// Démarre le service de synchronisation automatique
  void demarrerSynchronisation() {
    // Vérifier la connectivité toutes les 30 secondes
    _syncTimer = Timer.periodic(const Duration(seconds: 30), (_) async {
      await _synchroniserSiConnecte();
    });

    // Écouter les changements de connectivité
    _connectivitySubscription = Connectivity().onConnectivityChanged.listen((result) {
      // Vérifier si une connexion est disponible
      if (result != ConnectivityResult.none) {
        // Connexion restaurée, synchroniser immédiatement
        _synchroniserSiConnecte();
      }
    });
  }

  /// Arrête le service de synchronisation
  void arreterSynchronisation() {
    _syncTimer?.cancel();
    _syncTimer = null;
    _connectivitySubscription?.cancel();
    _connectivitySubscription = null;
  }

  /// Vérifie la connectivité et synchronise si connecté
  Future<void> _synchroniserSiConnecte() async {
    if (_isSyncing) return;

    try {
      final ConnectivityResult result = await Connectivity().checkConnectivity();
      // Vérifier si aucune connexion n'est disponible
      if (result == ConnectivityResult.none) {
        return; // Pas de connexion
      }
    } catch (e) {
      print('Erreur lors de la vérification de connectivité: $e');
      return;
    }

    await synchroniser();
  }

  /// Synchronise toutes les données non synchronisées
  Future<void> synchroniser() async {
    if (_isSyncing) return;
    _isSyncing = true;

    try {
      // Synchroniser les sessions
      await _synchroniserSessions();
      
      // Synchroniser les positions GPS
      await _synchroniserPositions();
      
      // Synchroniser les changements de statut
      await _synchroniserChangementsStatut();
    } catch (e) {
      print('Erreur lors de la synchronisation: $e');
    } finally {
      _isSyncing = false;
    }
  }

  /// Synchronise les sessions non synchronisées
  Future<void> _synchroniserSessions() async {
    final prefs = await SharedPreferences.getInstance();
    final sessionsJson = prefs.getStringList('sessions_pending') ?? [];
    final sessionsASupprimer = <String>[];
    
    for (var sessionJson in sessionsJson) {
      try {
        final session = SessionTravail.fromJson(jsonDecode(sessionJson));
        bool synchronisee = false;
        
        if (session.id == null) {
          // Session jamais créée sur le serveur
          // Utiliser les coordonnées de début de la session locale
          if (session.latitudeDebut != null && session.longitudeDebut != null) {
            try {
              final nouvelleSession = await _apiService.demarrerSession(
                session.latitudeDebut!,
                session.longitudeDebut!,
              );
              // Mettre à jour avec l'ID du serveur
              await _mettreAJourSessionLocale(session, nouvelleSession);
              synchronisee = true;
            } catch (e) {
              print('Erreur lors de la création de la session sur le serveur: $e');
            }
          }
        } else if (!session.synchronise) {
          // Session existante mais non synchronisée
          if (session.estEnCours) {
            // Vérifier si la session existe toujours sur le serveur
            try {
              final sessionServeur = await _apiService.getSessionEnCours();
              if (sessionServeur == null || sessionServeur.id != session.id) {
                // Session n'existe plus, la recréer avec les coordonnées de début
                if (session.latitudeDebut != null && session.longitudeDebut != null) {
                  final nouvelleSession = await _apiService.demarrerSession(
                    session.latitudeDebut!,
                    session.longitudeDebut!,
                  );
                  await _mettreAJourSessionLocale(session, nouvelleSession);
                  synchronisee = true;
                }
              } else {
                // Session existe toujours, considérée comme synchronisée
                synchronisee = true;
              }
            } catch (e) {
              print('Erreur lors de la vérification de la session: $e');
            }
          } else {
            // Session terminée, l'arrêter sur le serveur
            // Utiliser les coordonnées de fin si disponibles, sinon les coordonnées de début
            double? lat = session.latitudeFin ?? session.latitudeDebut;
            double? lon = session.longitudeFin ?? session.longitudeDebut;
            
            if (lat != null && lon != null) {
              try {
                await _apiService.arreterSession(lat, lon);
                synchronisee = true;
              } catch (e) {
                print('Erreur lors de l\'arrêt de la session sur le serveur: $e');
              }
            }
          }
        } else {
          // Session déjà synchronisée, la retirer
          synchronisee = true;
        }
        
        // Marquer pour suppression seulement si synchronisée avec succès
        if (synchronisee) {
          sessionsASupprimer.add(sessionJson);
        }
      } catch (e) {
        print('Erreur lors de la synchronisation de la session: $e');
        // Garder la session dans la liste pour réessayer plus tard
      }
    }
    
    // Retirer uniquement les sessions synchronisées avec succès
    if (sessionsASupprimer.isNotEmpty) {
      sessionsJson.removeWhere((s) => sessionsASupprimer.contains(s));
      await prefs.setStringList('sessions_pending', sessionsJson);
    }
  }

  /// Synchronise les positions GPS non synchronisées
  Future<void> _synchroniserPositions() async {
    final prefs = await SharedPreferences.getInstance();
    final positionsJson = prefs.getStringList('positions_pending') ?? [];
    final positionsASupprimer = <String>[];
    
    // Charger la session en cours pour obtenir le vrai ID
    SessionTravail? sessionEnCours;
    try {
      sessionEnCours = await _apiService.getSessionEnCours();
    } catch (e) {
      // Si pas de session en cours sur le serveur, essayer de trouver une session locale
      final sessionLocaleJson = prefs.getString('session_en_cours');
      if (sessionLocaleJson != null) {
        try {
          sessionEnCours = SessionTravail.fromJson(jsonDecode(sessionLocaleJson));
        } catch (e) {
          print('Erreur lors du chargement de la session locale: $e');
        }
      }
    }
    
    for (var positionJson in positionsJson) {
      try {
        final position = PositionGps.fromJson(jsonDecode(positionJson));
        
        // Si la position a un ID temporaire (très grand nombre = timestamp), utiliser l'ID de la session en cours
        int sessionId = position.sessionId;
        if (sessionId > 1000000000000) { // Probablement un timestamp (millisecondes)
          if (sessionEnCours != null && sessionEnCours.id != null) {
            sessionId = sessionEnCours.id!;
          } else {
            // Pas de session en cours, garder cette position pour plus tard
            continue;
          }
        }
        
        await _apiService.enregistrerPosition(
          sessionId,
          position.latitude,
          position.longitude,
          position.precision,
        );
        
        // Marquer pour suppression après succès
        positionsASupprimer.add(positionJson);
      } catch (e) {
        print('Erreur lors de la synchronisation de la position: $e');
        // Ne pas retirer de la liste en cas d'erreur pour réessayer plus tard
      }
    }
    
    // Retirer uniquement les positions synchronisées avec succès
    if (positionsASupprimer.isNotEmpty) {
      positionsJson.removeWhere((p) => positionsASupprimer.contains(p));
      await prefs.setStringList('positions_pending', positionsJson);
    }
  }

  /// Synchronise les changements de statut non synchronisés
  Future<void> _synchroniserChangementsStatut() async {
    final prefs = await SharedPreferences.getInstance();
    final changementsJson = prefs.getStringList('changements_statut_pending') ?? [];
    final changementsASupprimer = <String>[];
    
    // Charger la session en cours pour obtenir le vrai ID
    SessionTravail? sessionEnCours;
    try {
      sessionEnCours = await _apiService.getSessionEnCours();
    } catch (e) {
      // Si pas de session en cours sur le serveur, essayer de trouver une session locale
      final sessionLocaleJson = prefs.getString('session_en_cours');
      if (sessionLocaleJson != null) {
        try {
          sessionEnCours = SessionTravail.fromJson(jsonDecode(sessionLocaleJson));
        } catch (e) {
          print('Erreur lors du chargement de la session locale: $e');
        }
      }
    }
    
    for (var changementJson in changementsJson) {
      try {
        final changement = ChangementStatut.fromJson(jsonDecode(changementJson));
        
        // Si le changement a un ID temporaire (très grand nombre = timestamp), utiliser l'ID de la session en cours
        int sessionId = changement.sessionId;
        if (sessionId > 1000000000000) { // Probablement un timestamp (millisecondes)
          if (sessionEnCours != null && sessionEnCours.id != null) {
            sessionId = sessionEnCours.id!;
          } else {
            // Pas de session en cours, garder ce changement pour plus tard
            continue;
          }
        }
        
        await _apiService.changerStatut(
          sessionId,
          changement.statut.codeStatut,
        );
        
        // Marquer pour suppression après succès
        changementsASupprimer.add(changementJson);
      } catch (e) {
        print('Erreur lors de la synchronisation du changement de statut: $e');
        // Ne pas retirer de la liste en cas d'erreur pour réessayer plus tard
        // Sauf si c'est une erreur de session clôturée, on peut retirer
        String errorMsg = e.toString().toLowerCase();
        if (errorMsg.contains('clôturée') || errorMsg.contains('cloturée')) {
          changementsASupprimer.add(changementJson); // Retirer car c'est une erreur métier permanente
        }
      }
    }
    
    // Retirer uniquement les changements synchronisés avec succès ou les erreurs permanentes
    if (changementsASupprimer.isNotEmpty) {
      changementsJson.removeWhere((c) => changementsASupprimer.contains(c));
      await prefs.setStringList('changements_statut_pending', changementsJson);
    }
  }

  /// Sauvegarde une session en attente de synchronisation
  Future<void> sauvegarderSessionPending(SessionTravail session) async {
    final prefs = await SharedPreferences.getInstance();
    final sessions = prefs.getStringList('sessions_pending') ?? [];
    sessions.add(jsonEncode(session.toJson()));
    await prefs.setStringList('sessions_pending', sessions);
  }

  /// Sauvegarde une position en attente de synchronisation
  Future<void> sauvegarderPositionPending(PositionGps position) async {
    final prefs = await SharedPreferences.getInstance();
    final positions = prefs.getStringList('positions_pending') ?? [];
    positions.add(jsonEncode(position.toJson()));
    await prefs.setStringList('positions_pending', positions);
  }

  /// Sauvegarde un changement de statut en attente de synchronisation
  Future<void> sauvegarderChangementStatutPending(ChangementStatut changement) async {
    final prefs = await SharedPreferences.getInstance();
    final changements = prefs.getStringList('changements_statut_pending') ?? [];
    changements.add(jsonEncode(changement.toJson()));
    await prefs.setStringList('changements_statut_pending', changements);
  }

  Future<void> _mettreAJourSessionLocale(
    SessionTravail ancienne,
    SessionTravail nouvelle,
  ) async {
    final prefs = await SharedPreferences.getInstance();
    final sessions = prefs.getStringList('sessions_pending') ?? [];
    
    // Retirer l'ancienne session en comparant l'heure de début
    sessions.removeWhere((s) {
      try {
        final session = SessionTravail.fromJson(jsonDecode(s));
        return session.heureDebut == ancienne.heureDebut &&
               session.latitudeDebut == ancienne.latitudeDebut &&
               session.longitudeDebut == ancienne.longitudeDebut;
      } catch (e) {
        return false;
      }
    });
    
    // Ajouter la nouvelle session avec l'ID du serveur
    sessions.add(jsonEncode(nouvelle.toJson()));
    await prefs.setStringList('sessions_pending', sessions);
    
    // Mettre à jour aussi la session en cours locale si c'est celle-ci
    final sessionEnCoursJson = prefs.getString('session_en_cours');
    if (sessionEnCoursJson != null) {
      try {
        final sessionEnCours = SessionTravail.fromJson(jsonDecode(sessionEnCoursJson));
        if (sessionEnCours.heureDebut == ancienne.heureDebut &&
            sessionEnCours.latitudeDebut == ancienne.latitudeDebut &&
            sessionEnCours.longitudeDebut == ancienne.longitudeDebut) {
          await prefs.setString('session_en_cours', jsonEncode(nouvelle.toJson()));
        }
      } catch (e) {
        print('Erreur lors de la mise à jour de la session en cours: $e');
      }
    }
  }

  Future<Map<String, dynamic>?> _getLastKnownPosition() async {
    final prefs = await SharedPreferences.getInstance();
    final positionJson = prefs.getString('last_known_position');
    if (positionJson != null) {
      return jsonDecode(positionJson);
    }
    return null;
  }
}
