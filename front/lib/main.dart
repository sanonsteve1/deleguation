import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_localizations/flutter_localizations.dart';
import 'screens/login_screen.dart';
import 'screens/main_screen.dart';
import 'theme/app_theme.dart';
import 'services/sync_service.dart';
import 'services/api_service.dart';
import 'services/background_location_worker.dart';
import 'package:workmanager/workmanager.dart';
import 'package:intl/date_symbol_data_local.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Initialiser les données de locale française pour le formatage des dates
  await initializeDateFormatting('fr_FR', null);
  
  // Initialiser workmanager pour le suivi GPS en arrière-plan (uniquement sur mobile)
  // Workmanager ne fonctionne pas sur le web
  if (!kIsWeb) {
    try {
      await Workmanager().initialize(
        callbackDispatcher,
        isInDebugMode: false,
      );
      print('[Main] Workmanager initialisé (plateforme mobile)');
    } catch (e) {
      print('[Main] Erreur lors de l\'initialisation de workmanager: $e');
      // Continuer même si workmanager ne peut pas être initialisé
    }
  } else {
    print('[Main] Workmanager ignoré (plateforme web)');
  }
  
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  final SyncService _syncService = SyncService();
  bool _isAuthenticated = false;
  bool _isCheckingAuth = true;

  @override
  void initState() {
    super.initState();
    _verifierAuthentification();
  }

  Future<void> _verifierAuthentification() async {
    final apiService = ApiService();
    await apiService.loadTokenFromStorage();
    
    if (apiService.token != null && apiService.token!.isNotEmpty) {
      setState(() {
        _isAuthenticated = true;
        _isCheckingAuth = false;
      });
      // Démarrer la synchronisation automatique (RQ-06)
      _syncService.demarrerSynchronisation();
    } else {
      setState(() {
        _isAuthenticated = false;
        _isCheckingAuth = false;
      });
    }
  }

  @override
  void dispose() {
    // Arrêter la synchronisation à la fermeture de l'app
    _syncService.arreterSynchronisation();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
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
      home: _isCheckingAuth
          ? const Scaffold(
              body: Center(child: CircularProgressIndicator()),
            )
          : _isAuthenticated
              ? const MainScreen()
              : const LoginScreen(),
    );
  }
}