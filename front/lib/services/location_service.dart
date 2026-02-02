import 'package:geolocator/geolocator.dart';

class LocationService {
  // Vérifie si les permissions de localisation sont accordées (y compris en arrière-plan)
  Future<bool> checkPermission({bool requestBackground = true}) async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      print('[LocationService] Service de localisation désactivé');
      return false;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    print('[LocationService] Permission actuelle: $permission');
    
    if (permission == LocationPermission.denied) {
      print('[LocationService] Demande de permission...');
      permission = await Geolocator.requestPermission();
      print('[LocationService] Permission après demande: $permission');
      if (permission == LocationPermission.denied) {
        print('[LocationService] Permission refusée');
        return false;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      print('[LocationService] Permission refusée définitivement');
      // NE PAS ouvrir automatiquement les paramètres - l'utilisateur doit le faire manuellement
      // await Geolocator.openAppSettings();
      return false;
    }

    // Pour Android 10+, accepter "whileInUse" comme permission valide
    // Ne pas ouvrir automatiquement les paramètres pour demander "always"
    // Le suivi fonctionnera quand l'app est ouverte avec "whileInUse"
    if (requestBackground && permission == LocationPermission.whileInUse) {
      print('[LocationService] Permission "en cours d\'utilisation" détectée - le suivi fonctionnera quand l\'app est ouverte');
      // Accepter cette permission et continuer - ne pas ouvrir les paramètres automatiquement
      // L'utilisateur peut activer "always" manuellement s'il le souhaite
    }

    print('[LocationService] Permission finale: $permission');
    return permission != LocationPermission.denied && 
           permission != LocationPermission.deniedForever;
  }
  
  // Demande explicitement la permission en arrière-plan
  // Cette méthode ne doit être appelée que si l'utilisateur le demande explicitement
  Future<bool> requestBackgroundLocationPermission({bool openSettings = false}) async {
    print('[LocationService] Demande explicite de permission en arrière-plan');
    
    LocationPermission permission = await Geolocator.checkPermission();
    
    if (permission == LocationPermission.denied || 
        permission == LocationPermission.deniedForever) {
      print('[LocationService] Permission de base non accordée, demande d\'abord la permission de base');
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied || 
          permission == LocationPermission.deniedForever) {
        return false;
      }
    }
    
    if (permission == LocationPermission.whileInUse) {
      if (openSettings) {
        print('[LocationService] Ouverture des paramètres pour activer la permission en arrière-plan');
        await Geolocator.openAppSettings();
      } else {
        print('[LocationService] Permission "whileInUse" détectée - retourner false sans ouvrir les paramètres');
      }
      return false; // L'utilisateur doit activer manuellement dans les paramètres
    }
    
    return permission == LocationPermission.always;
  }

  // Récupère la position actuelle
  Future<Position> getCurrentPosition({bool requestBackground = true}) async {
    print('[LocationService] Récupération de la position actuelle...');
    bool hasPermission = await checkPermission(requestBackground: requestBackground);
    if (!hasPermission) {
      throw Exception('Permission de localisation refusée');
    }

    try {
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 10),
      );
      print('[LocationService] Position récupérée: lat=${position.latitude}, lon=${position.longitude}, accuracy=${position.accuracy}m');
      return position;
    } catch (e) {
      print('[LocationService] Erreur lors de la récupération de la position: $e');
      // Essayer avec une précision moindre en cas d'échec
      try {
        Position position = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.medium,
          timeLimit: const Duration(seconds: 15),
        );
        print('[LocationService] Position récupérée (précision moyenne): lat=${position.latitude}, lon=${position.longitude}');
        return position;
      } catch (e2) {
        print('[LocationService] Erreur lors de la récupération avec précision moyenne: $e2');
        rethrow;
      }
    }
  }

  // Vérifie si le GPS est activé
  Future<bool> isLocationServiceEnabled() async {
    return await Geolocator.isLocationServiceEnabled();
  }
}
