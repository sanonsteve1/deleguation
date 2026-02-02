import 'package:flutter/material.dart';
import 'dart:ui' show PlatformDispatcher;
import 'package:flutter_localizations/flutter_localizations.dart';
import 'screens/login_screen.dart';
import 'theme/app_theme.dart';

void main() async {
  // Gestion globale des erreurs Flutter
  FlutterError.onError = (FlutterErrorDetails details) {
    FlutterError.presentError(details);
    print('[FlutterError] ${details.exception}');
    print('[FlutterError] Stack: ${details.stack}');
    // En production, on peut envoyer les erreurs à un service de tracking
  };
  
  // Gestion des erreurs asynchrones non capturées
  PlatformDispatcher.instance.onError = (error, stack) {
    print('[PlatformError] $error');
    print('[PlatformError] Stack: $stack');
    return true; // Indique que l'erreur a été gérée
  };
  
  try {
    print('[Main] Initialisation de Flutter...');
    WidgetsFlutterBinding.ensureInitialized();
    print('[Main] Flutter initialisé avec succès');
    
    // Initialiser les données de locale française pour le formatage des dates
    // Désactivé temporairement pour éviter les crashes
    // try {
    //   await initializeDateFormatting('fr_FR', null);
    //   print('[Main] Formatage des dates initialisé');
    // } catch (e) {
    //   print('[Main] Erreur lors de l\'initialisation du formatage des dates: $e');
    // }
    
    // Initialiser workmanager pour le suivi GPS en arrière-plan (uniquement sur mobile)
    // Désactivé temporairement pour éviter les crashes
    // if (!kIsWeb) {
    //   try {
    //     await Workmanager().initialize(
    //       callbackDispatcher,
    //       isInDebugMode: false,
    //     );
    //     print('[Main] Workmanager initialisé (plateforme mobile)');
    //   } catch (e) {
    //     print('[Main] Erreur lors de l\'initialisation de workmanager: $e');
    //   }
    // }
    
    print('[Main] Démarrage de l\'application...');
    runApp(const MyApp());
    print('[Main] Application démarrée avec succès');
  } catch (e, stack) {
    print('[Main] ERREUR FATALE au démarrage: $e');
    print('[Main] Stack trace: $stack');
    // Afficher une erreur à l'utilisateur si possible
    runApp(MaterialApp(
      title: 'FieldTrack Pro - Erreur',
      debugShowCheckedModeBanner: false,
      home: Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
          child: Center(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 64, color: Colors.red),
                  const SizedBox(height: 16),
                  const Text(
                    'Erreur au démarrage',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'L\'application n\'a pas pu démarrer correctement.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[600],
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Erreur: $e',
                    style: const TextStyle(fontSize: 12, color: Colors.red),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    ));
  }
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  @override
  Widget build(BuildContext context) {
    // Version ultra-simplifiée : afficher directement l'écran de connexion
    // La vérification d'authentification sera faite dans LoginScreen si nécessaire
    return MaterialApp(
      title: 'FieldTrack Pro',
      debugShowCheckedModeBanner: false,
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('fr', 'FR'),
        Locale('en', 'US'),
      ],
      locale: const Locale('fr', 'FR'),
      theme: AppTheme.lightTheme,
      home: const LoginScreen(),
    );
  }
}