import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/session_travail.dart';
import '../models/statut.dart';
import '../models/changement_statut.dart';
import '../models/position_gps.dart';
import '../models/utilisateur.dart';
import '../config/api_config.dart';

class ApiService {
  // URL du backend - Utilise ApiConfig pour une configuration flexible
  // Modifiez api_config.dart pour changer l'URL (ngrok, local, réseau)
  static String get baseUrl => ApiConfig.baseUrl;
  static ApiService? _instance;
  String? _token;

  // Singleton pattern
  ApiService._internal();
  
  factory ApiService() {
    _instance ??= ApiService._internal();
    return _instance!;
  }

  void setToken(String token) {
    _token = token;
    // Sauvegarder aussi dans SharedPreferences
    SharedPreferences.getInstance().then((prefs) {
      prefs.setString('auth_token', token);
    });
  }
  
  Future<void> loadTokenFromStorage() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('auth_token');
  }
  
  String? get token => _token;

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (_token != null) 'Authorization': 'Bearer $_token',
    // Header pour contourner la page d'avertissement ngrok (plan gratuit)
    'ngrok-skip-browser-warning': 'true',
  };

  // Authentification
  Future<Map<String, dynamic>> login(String username, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/securite/auth'),
      headers: {
        'Content-Type': 'application/json',
        // Header pour contourner la page d'avertissement ngrok
        'ngrok-skip-browser-warning': 'true',
      },
      body: jsonEncode({
        'username': username,
        'password': password,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erreur de connexion: ${response.body}');
    }
  }

  // Récupère les informations de l'utilisateur connecté
  Future<Utilisateur> getUtilisateurConnecte() async {
    final response = await http.get(
      Uri.parse('$baseUrl/securite/utilisateur'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      return Utilisateur.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Erreur lors de la récupération de l\'utilisateur: ${response.body}');
    }
  }

  Future<void> logout() async {
    // Supprimer le token du stockage
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    _token = null;
  }

  // Sessions
  Future<SessionTravail> demarrerSession(double latitude, double longitude) async {
    final response = await http.post(
      Uri.parse('$baseUrl/sessions/demarrer'),
      headers: _headers,
      body: jsonEncode({
        'latitude': latitude,
        'longitude': longitude,
      }),
    );

    if (response.statusCode == 200) {
      final responseData = jsonDecode(response.body);
      // Gérer le cas où la réponse est une liste ou un Map
      final Map<String, dynamic> sessionData = responseData is List 
          ? (responseData.isNotEmpty ? responseData[0] as Map<String, dynamic> : throw Exception('Réponse vide'))
          : responseData as Map<String, dynamic>;
      return SessionTravail.fromJson(sessionData);
    } else if (response.statusCode == 409) {
      // Conflit : session déjà en cours
      String message = 'Une session est déjà en cours';
      try {
        final errorData = jsonDecode(response.body);
        if (errorData is Map<String, dynamic>) {
          final msgValue = errorData['message'];
          if (msgValue is String) {
            message = msgValue;
          } else if (msgValue is List && msgValue.isNotEmpty) {
            message = msgValue.first.toString();
          }
        }
      } catch (e) {
        // Ignorer les erreurs de parsing, utiliser le message par défaut
      }
      throw Exception(message);
    } else {
      String message = 'Erreur lors du démarrage de la session';
      try {
        final errorData = jsonDecode(response.body);
        if (errorData is Map<String, dynamic>) {
          final msgValue = errorData['message'];
          if (msgValue is String) {
            message = msgValue;
          } else if (msgValue is List && msgValue.isNotEmpty) {
            message = msgValue.first.toString();
          } else {
            message = response.body;
          }
        }
      } catch (e) {
        message = 'Erreur lors du démarrage de la session: ${response.body}';
      }
      throw Exception(message);
    }
  }

  Future<SessionTravail> arreterSession(double latitude, double longitude) async {
    final response = await http.post(
      Uri.parse('$baseUrl/sessions/arreter'),
      headers: _headers,
      body: jsonEncode({
        'latitude': latitude,
        'longitude': longitude,
      }),
    );

    if (response.statusCode == 200) {
      final responseData = jsonDecode(response.body);
      // Gérer le cas où la réponse est une liste ou un Map
      final Map<String, dynamic> sessionData = responseData is List 
          ? (responseData.isNotEmpty ? responseData[0] as Map<String, dynamic> : throw Exception('Réponse vide'))
          : responseData as Map<String, dynamic>;
      return SessionTravail.fromJson(sessionData);
    } else {
      String message = 'Erreur lors de l\'arrêt de la session';
      try {
        final errorData = jsonDecode(response.body);
        if (errorData is Map<String, dynamic>) {
          final msgValue = errorData['message'];
          if (msgValue is String) {
            message = msgValue;
          } else if (msgValue is List && msgValue.isNotEmpty) {
            message = msgValue.first.toString();
          } else {
            message = response.body;
          }
        }
      } catch (e) {
        message = 'Erreur lors de l\'arrêt de la session: ${response.body}';
      }
      throw Exception(message);
    }
  }

  Future<SessionTravail?> getSessionEnCours() async {
    final response = await http.get(
      Uri.parse('$baseUrl/sessions/en-cours'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data == null) return null;
      // Gérer le cas où la réponse est une liste ou un Map
      final Map<String, dynamic> sessionData = data is List 
          ? (data.isNotEmpty ? data[0] as Map<String, dynamic> : throw Exception('Réponse vide'))
          : data as Map<String, dynamic>;
      return SessionTravail.fromJson(sessionData);
    } else if (response.statusCode == 204) {
      return null;
    } else {
      throw Exception('Erreur lors de la récupération de la session: ${response.body}');
    }
  }

  Future<List<SessionTravail>> getHistoriqueSessions() async {
    final response = await http.get(
      Uri.parse('$baseUrl/sessions/historique'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => SessionTravail.fromJson(json)).toList();
    } else {
      throw Exception('Erreur lors de la récupération de l\'historique: ${response.body}');
    }
  }

  // Statuts
  Future<List<Statut>> getAllStatuts() async {
    final response = await http.get(
      Uri.parse('$baseUrl/statuts'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      // Gérer le cas où la réponse est une liste ou un Map
      List<dynamic> statutsList;
      if (data is List) {
        statutsList = data;
      } else if (data is Map) {
        statutsList = [data];
      } else {
        throw Exception('Format de réponse invalide pour les statuts');
      }
      return statutsList
          .map((json) => Statut.fromJson(json as Map<String, dynamic>))
          .where((statut) => statut.codeStatut.isNotEmpty && statut.libelle.isNotEmpty)
          .toList();
    } else {
      throw Exception('Erreur lors de la récupération des statuts: ${response.body}');
    }
  }

  // Changements de statut
  Future<List<ChangementStatut>> getChangementsParSession(int sessionId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/changements-statut/session/$sessionId'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => ChangementStatut.fromJson(json as Map<String, dynamic>)).toList();
    } else {
      throw Exception('Erreur lors de la récupération des changements de statut: ${response.body}');
    }
  }

  Future<ChangementStatut> changerStatut(int sessionId, String codeStatut) async {
    final response = await http.post(
      Uri.parse('$baseUrl/changements-statut'),
      headers: _headers,
      body: jsonEncode({
        'sessionId': sessionId,
        'codeStatut': codeStatut,
      }),
    );

    if (response.statusCode == 200) {
      final responseData = jsonDecode(response.body);
      final Map<String, dynamic> changementData = responseData is List
          ? (responseData.isNotEmpty ? responseData[0] as Map<String, dynamic> : throw Exception('Réponse vide'))
          : responseData as Map<String, dynamic>;
      return ChangementStatut.fromJson(changementData);
    } else if (response.statusCode == 409) {
      String message = 'Impossible de changer de statut : la session est déjà clôturée';
      try {
        final errorData = jsonDecode(response.body);
        if (errorData is Map<String, dynamic>) {
          final msgValue = errorData['message'];
          if (msgValue is String) {
            message = msgValue;
          } else if (msgValue is List && msgValue.isNotEmpty) {
            message = msgValue.first.toString();
          }
        }
      } catch (e) {
        // Utiliser le message par défaut
      }
      throw Exception(message);
    } else {
      String message = 'Erreur lors du changement de statut';
      try {
        final errorData = jsonDecode(response.body);
        if (errorData is Map<String, dynamic>) {
          final msgValue = errorData['message'];
          if (msgValue is String) {
            message = msgValue;
          } else if (msgValue is List && msgValue.isNotEmpty) {
            message = msgValue.first.toString();
          } else {
            message = response.body;
          }
        }
      } catch (e) {
        message = 'Erreur lors du changement de statut: ${response.body}';
      }
      throw Exception(message);
    }
  }

  // Positions GPS
  Future<PositionGps> enregistrerPosition(
    int sessionId,
    double latitude,
    double longitude,
    double? precision,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/positions'),
      headers: _headers,
      body: jsonEncode({
        'sessionId': sessionId,
        'latitude': latitude,
        'longitude': longitude,
        'precision': precision,
      }),
    );

    if (response.statusCode == 200) {
      return PositionGps.fromJson(jsonDecode(response.body));
    } else if (response.statusCode == 409) {
      // Session clôturée - erreur spécifique
      String message = 'Session clôturée';
      try {
        final errorData = jsonDecode(response.body);
        if (errorData is Map<String, dynamic>) {
          final msgValue = errorData['message'];
          if (msgValue is String) {
            message = msgValue;
          } else if (msgValue is List && msgValue.isNotEmpty) {
            message = msgValue.first.toString();
          }
        }
      } catch (e) {
        // Utiliser le message par défaut
      }
      throw Exception('Session clôturée: $message');
    } else {
      throw Exception('Erreur lors de l\'enregistrement de la position: ${response.body}');
    }
  }

  Future<List<PositionGps>> getPositionsParSession(int sessionId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/positions/session/$sessionId'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => PositionGps.fromJson(json)).toList();
    } else {
      throw Exception('Erreur lors de la récupération des positions: ${response.body}');
    }
  }

  // Méthodes pour les administrateurs
  // Récupère tous les utilisateurs (pour ADMIN uniquement)
  Future<List<Utilisateur>> getAllUtilisateurs() async {
    final response = await http.get(
      Uri.parse('$baseUrl/utilisateur'),
      headers: _headers,
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Utilisateur.fromJson(json as Map<String, dynamic>)).toList();
    } else {
      throw Exception('Erreur lors de la récupération des utilisateurs: ${response.body}');
    }
  }
}
