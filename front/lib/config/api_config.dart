/// Configuration de l'API
/// 
/// Cette classe permet de configurer facilement l'URL du backend
/// pour utiliser ngrok ou une URL locale/réseau
class ApiConfig {
  // URL par défaut (local)
  static const String defaultBaseUrl = 'http://192.168.11.111:8073/ws';
  
  // URL ngrok (à modifier selon votre tunnel ngrok)
  // Exemple: 'https://abc123.ngrok-free.app/ws'
  static const String ngrokBaseUrl = 'https://fd581a742080.ngrok-free.app/ws';
  
  // URL localhost (pour développement local)
  static const String localhostBaseUrl = 'http://localhost:8073/ws';
  
  // Mode de configuration
  // true = utiliser ngrok, false = utiliser l'URL par défaut
  static const bool useNgrok = false;
  
  // Utiliser localhost au lieu de l'IP réseau
  static const bool useLocalhost = true;
  
  /// Retourne l'URL de base selon la configuration
  static String get baseUrl {
    if (useNgrok) {
      return ngrokBaseUrl;
    } else if (useLocalhost) {
      return localhostBaseUrl;
    } else {
      return defaultBaseUrl;
    }
  }
  
  /// Affiche la configuration actuelle (pour debug)
  static void printConfig() {
    print('[ApiConfig] Mode: ${useNgrok ? "Ngrok" : (useLocalhost ? "Localhost" : "Réseau")}');
    print('[ApiConfig] URL: $baseUrl');
  }
}
