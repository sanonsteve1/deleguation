import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'dart:async';
import '../colors/app_colors.dart';
import '../theme/app_theme.dart';
import '../widgets/modern_card.dart';
import '../widgets/modern_button.dart';
import '../models/session_travail.dart';
import '../models/utilisateur.dart';
import '../models/changement_statut.dart';
import '../services/session_service.dart';
import 'statut_bottom_sheet.dart';
import '../services/api_service.dart';
import 'carte_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen>
    with SingleTickerProviderStateMixin {
  final SessionService _sessionService = SessionService();
  final ApiService _apiService = ApiService();
  
  SessionTravail? _sessionEnCours;
  Utilisateur? _utilisateur;
  ChangementStatut? _statutActuel;
  bool _isLoading = false;
  bool _localeInitialized = false;
  Timer? _timer;
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat(reverse: true);
    _initialiserLocale();
    _chargerUtilisateur();
    _chargerSession();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (_sessionEnCours != null && _sessionEnCours!.estEnCours) {
        setState(() {});
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pulseController.dispose();
    super.dispose();
  }

  Future<void> _initialiserLocale() async {
    try {
      await initializeDateFormatting('fr_FR', null);
      if (mounted) {
        setState(() {
          _localeInitialized = true;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _localeInitialized = true;
        });
      }
    }
  }

  Future<void> _chargerUtilisateur() async {
    try {
      final user = await _apiService.getUtilisateurConnecte();
      setState(() {
        _utilisateur = user;
      });
    } catch (e) {
      // Silently fail
    }
  }

  Future<void> _chargerSession() async {
    setState(() => _isLoading = true);
    try {
      await _sessionService.chargerSessionEnCours();
      setState(() {
        _sessionEnCours = _sessionService.sessionEnCours;
      });
      
      if (_sessionEnCours != null && 
          _sessionEnCours!.estEnCours && 
          _sessionEnCours!.id != null) {
        await _chargerStatutActuel();
      } else {
        _statutActuel = null;
      }
    } catch (e) {
      if (mounted) {
        _showErrorSnackBar('Erreur: $e');
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _chargerStatutActuel() async {
    if (_sessionEnCours?.id == null) return;
    
    try {
      final changements = await _apiService.getChangementsParSession(_sessionEnCours!.id!);
      if (changements.isNotEmpty) {
        changements.sort((a, b) => b.timestamp.compareTo(a.timestamp));
        setState(() {
          _statutActuel = changements.first;
        });
      } else {
        setState(() {
          _statutActuel = null;
        });
      }
    } catch (e) {
      // Silently fail
    }
  }

  Future<void> _demarrerSession() async {
    HapticFeedback.mediumImpact();
    setState(() => _isLoading = true);
    
    try {
      SessionTravail? sessionExistante;
      try {
        sessionExistante = await _apiService.getSessionEnCours();
      } catch (e) {
        // Mode offline
      }
      
      await _sessionService.chargerSessionEnCours();
      sessionExistante = _sessionService.sessionEnCours ?? sessionExistante;
      
      if (sessionExistante != null && sessionExistante.estEnCours) {
        setState(() {
          _sessionEnCours = sessionExistante;
        });
        await _chargerStatutActuel();
        if (mounted) {
          _showWarningSnackBar('Une session est déjà en cours');
        }
        return;
      }

      SessionTravail session = await _sessionService.demarrerSession();
      setState(() {
        _sessionEnCours = session;
      });
      await _chargerStatutActuel();
      
      if (mounted) {
        HapticFeedback.lightImpact();
        final isOffline = session.id == null || !session.synchronise;
        _showSuccessSnackBar(
          isOffline 
            ? 'Session démarrée (hors ligne). Synchronisation automatique à la reconnexion.'
            : 'Session démarrée avec succès',
        );
      }
    } catch (e) {
      String errorString = e.toString().toLowerCase();
      
      if (errorString.contains('déjà en cours') || 
          (errorString.contains('session') && errorString.contains('existe'))) {
        await _chargerSession();
        if (mounted) {
          _showWarningSnackBar('Une session est déjà en cours');
        }
        return;
      }
      
      if (mounted) {
        HapticFeedback.heavyImpact();
        _showErrorSnackBar('Erreur lors du démarrage: ${e.toString()}');
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _arreterSession() async {
    HapticFeedback.mediumImpact();
    setState(() {
      _sessionEnCours = null;
      _statutActuel = null;
    });
    
    try {
      await _sessionService.arreterSession();
      if (mounted) {
        HapticFeedback.lightImpact();
        _showSuccessSnackBar('Session arrêtée avec succès');
      }
    } catch (e) {
      if (mounted) {
        _showWarningSnackBar('Session arrêtée (hors ligne). Synchronisation automatique à la reconnexion.');
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _ouvrirSelecteurStatut() {
    if (_sessionEnCours == null || !_sessionEnCours!.estEnCours) {
      _showWarningSnackBar('Aucune session active');
      return;
    }
    
    HapticFeedback.selectionClick();
    final sessionId = _sessionEnCours!.id ?? 
        _sessionEnCours!.heureDebut.millisecondsSinceEpoch;
    
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatutBottomSheet(
        sessionId: sessionId,
        onStatutChange: () {
          _chargerStatutActuel();
        },
      ),
    );
  }

  void _ouvrirCarte() {
    HapticFeedback.selectionClick();
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const CarteScreen()),
    );
  }

  void _showSuccessSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle, color: Colors.white),
            const SizedBox(width: AppTheme.spacingSM),
            Expanded(child: Text(message)),
          ],
        ),
        backgroundColor: AppColors.success,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppTheme.radiusMD),
        ),
        margin: const EdgeInsets.all(AppTheme.spacingMD),
      ),
    );
  }

  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.error_outline, color: Colors.white),
            const SizedBox(width: AppTheme.spacingSM),
            Expanded(child: Text(message)),
          ],
        ),
        backgroundColor: AppColors.error,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppTheme.radiusMD),
        ),
        margin: const EdgeInsets.all(AppTheme.spacingMD),
      ),
    );
  }

  void _showWarningSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.warning_amber_rounded, color: Colors.white),
            const SizedBox(width: AppTheme.spacingSM),
            Expanded(child: Text(message)),
          ],
        ),
        backgroundColor: AppColors.warning,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppTheme.radiusMD),
        ),
        margin: const EdgeInsets.all(AppTheme.spacingMD),
      ),
    );
  }

  String _formaterDateCourte(DateTime date) {
    if (!_localeInitialized) {
      const joursSemaine = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE'];
      const mois = ['JANVIER', 'FÉVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN', 'JUILLET', 'AOÛT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DÉCEMBRE'];
      final jourSemaine = joursSemaine[date.weekday - 1];
      final moisNom = mois[date.month - 1];
      return '$jourSemaine ${date.day} $moisNom';
    }
    
    try {
      final DateFormat formatter = DateFormat('EEEE d MMMM', 'fr_FR');
      return formatter.format(date).toUpperCase();
    } catch (e) {
      const joursSemaine = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE'];
      const mois = ['JANVIER', 'FÉVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN', 'JUILLET', 'AOÛT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DÉCEMBRE'];
      final jourSemaine = joursSemaine[date.weekday - 1];
      final moisNom = mois[date.month - 1];
      return '$jourSemaine ${date.day} $moisNom';
    }
  }

  String _formaterDuree(Duration duree) {
    String deuxChiffres(int n) => n.toString().padLeft(2, '0');
    final heures = deuxChiffres(duree.inHours);
    final minutes = deuxChiffres(duree.inMinutes.remainder(60));
    final secondes = deuxChiffres(duree.inSeconds.remainder(60));
    return '$heures:$minutes:$secondes';
  }

  Duration? _calculerDureeSession() {
    if (_sessionEnCours == null) return null;
    
    final now = DateTime.now();
    final codeStatutActuel = _statutActuel?.statut.codeStatut.toUpperCase() ?? '';
    final estEnPause = codeStatutActuel.contains('PAUSE');
    
    if (estEnPause && _statutActuel != null) {
      return _statutActuel!.timestamp.difference(_sessionEnCours!.heureDebut);
    } else {
      return now.difference(_sessionEnCours!.heureDebut);
    }
  }
  
  bool _estEnPause() {
    final codeStatut = _statutActuel?.statut.codeStatut.toUpperCase() ?? '';
    return codeStatut.contains('PAUSE');
  }

  Color _getStatutColor(String codeStatut) {
    switch (codeStatut.toUpperCase()) {
      case 'PAUSE_DEJEUNER':
      case 'PAUSE':
        return AppColors.statutDeplacement;
      case 'RENDEZ_VOUS_CLIENT':
      case 'CHEZ_CLIENT':
        return AppColors.statutPause;
      case 'TRAJET':
      case 'EN_DEPLACEMENT':
        return Colors.red;
      case 'REUNION':
        return Colors.blue;
      default:
        return AppColors.vertDemarrer;
    }
  }

  IconData _getStatutIcon(String codeStatut) {
    switch (codeStatut.toUpperCase()) {
      case 'PAUSE_DEJEUNER':
      case 'PAUSE':
        return Icons.restaurant;
      case 'RENDEZ_VOUS_CLIENT':
      case 'CHEZ_CLIENT':
        return Icons.handshake;
      case 'TRAJET':
      case 'EN_DEPLACEMENT':
        return Icons.directions_car;
      case 'REUNION':
        return Icons.bar_chart;
      default:
        return Icons.work;
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool sessionActive = _sessionEnCours != null && _sessionEnCours!.estEnCours;
    final prenom = _utilisateur?.prenoms.split(' ').first ?? 'Agent';
    final nom = _utilisateur?.nom ?? '';

    return Scaffold(
      backgroundColor: sessionActive 
          ? const Color(0xFFF0F9F4) 
          : const Color(0xFFF8F9FA),
      body: _isLoading && !sessionActive
          ? const Center(child: CircularProgressIndicator())
          : SafeArea(
              child: !sessionActive
                  ? _buildEtatInactif(prenom, nom)
                  : _buildEtatActif(prenom, nom),
            ),
    );
  }

  Widget _buildEtatInactif(String prenom, String nom) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header - Aligné à gauche
        Align(
          alignment: Alignment.centerLeft,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(
              AppTheme.spacingLG,
              AppTheme.spacingMD,
              AppTheme.spacingLG,
              0,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _formaterDateCourte(DateTime.now()),
                  style: AppTheme.labelSmall.copyWith(
                    color: const Color(0xFF8E8E93),
                  ),
                ),
                const SizedBox(height: AppTheme.spacingSM),
                RichText(
                  text: TextSpan(
                    style: AppTheme.headline3,
                    children: [
                      const TextSpan(text: 'Bonjour, Agent '),
                      TextSpan(
                        text: prenom != 'Agent' ? prenom : (nom.isNotEmpty ? nom : 'Martin'),
                        style: AppTheme.headline3.copyWith(
                          color: AppColors.vertDemarrer,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        
        const Spacer(),
        
        // Bouton de démarrage - Centré
        Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
            AnimatedBuilder(
              animation: _pulseController,
              builder: (context, child) {
                return Container(
                  width: 200,
                  height: 200,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.vertDemarrer.withOpacity(
                          0.3 + (_pulseController.value * 0.2),
                        ),
                        blurRadius: 40 + (_pulseController.value * 20),
                        spreadRadius: 10 + (_pulseController.value * 5),
                      ),
                    ],
                  ),
                  child: child,
                );
              },
              child: Container(
                width: 200,
                height: 200,
                decoration: BoxDecoration(
                  gradient: AppGradients.success,
                  shape: BoxShape.circle,
                ),
                child: Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: _isLoading ? null : _demarrerSession,
                    borderRadius: BorderRadius.circular(100),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.play_arrow_rounded,
                          color: Colors.white,
                          size: 70,
                        ),
                        const SizedBox(height: AppTheme.spacingSM),
                        const Text(
                          'DÉMARRER',
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                            letterSpacing: 1.5,
                          ),
                        ),
                        const Text(
                          'MA JOURNÉE',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                            letterSpacing: 1,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            
            const SizedBox(height: AppTheme.spacingXL),
            
            Text(
              'Vous êtes actuellement Hors Service',
              style: AppTheme.bodyMedium.copyWith(
                color: const Color(0xFF8E8E93),
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
        ),
        
        const Spacer(),
      ],
    );
  }

  Widget _buildEtatActif(String prenom, String nom) {
    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: AppTheme.spacingLG,
          vertical: AppTheme.spacingMD,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _formaterDateCourte(DateTime.now()),
                  style: AppTheme.labelSmall.copyWith(
                    color: const Color(0xFF8E8E93),
                  ),
                ),
                const SizedBox(height: AppTheme.spacingSM),
                RichText(
                  text: TextSpan(
                    style: AppTheme.headline3,
                    children: [
                      const TextSpan(text: 'Bonjour, Agent '),
                      TextSpan(
                        text: prenom != 'Agent' ? prenom : (nom.isNotEmpty ? nom : 'Martin'),
                        style: AppTheme.headline3.copyWith(
                          color: AppColors.vertDemarrer,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: AppTheme.spacingXL),
            
            // Carte Timer
            GlassCard(
              padding: const EdgeInsets.all(AppTheme.spacingXL),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 10,
                        height: 10,
                        decoration: BoxDecoration(
                          color: AppColors.vertDemarrer,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.vertDemarrer.withOpacity(0.5),
                              blurRadius: 8,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: AppTheme.spacingSM),
                      Text(
                        'EN SERVICE',
                        style: AppTheme.labelLarge.copyWith(
                          color: AppColors.vertDemarrer,
                          letterSpacing: 1.2,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppTheme.spacingLG),
                  Text(
                    _calculerDureeSession() != null 
                        ? _formaterDuree(_calculerDureeSession()!)
                        : '00:00:00',
                    style: TextStyle(
                      fontSize: 48,
                      fontWeight: FontWeight.bold,
                      color: _estEnPause() 
                          ? const Color(0xFF8E8E93) 
                          : AppColors.primaryDark,
                      letterSpacing: 1,
                      height: 1.2,
                    ),
                  ),
                  if (_estEnPause()) ...[
                    const SizedBox(height: AppTheme.spacingSM),
                    Text(
                      'En pause',
                      style: AppTheme.bodySmall.copyWith(
                        color: const Color(0xFF8E8E93),
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ],
                  const SizedBox(height: AppTheme.spacingMD),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.access_time,
                        size: 16,
                        color: Colors.grey[600],
                      ),
                      const SizedBox(width: AppTheme.spacingXS),
                      Text(
                        'Début: ${DateFormat('HH:mm').format(_sessionEnCours!.heureDebut)}',
                        style: AppTheme.bodySmall.copyWith(
                          color: const Color(0xFF8E8E93),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: AppTheme.spacingMD),
            
            // Carte Statut
            GlassCard(
              padding: const EdgeInsets.all(AppTheme.spacingMD),
              onTap: _ouvrirSelecteurStatut,
              child: Row(
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          _getStatutColor(_statutActuel?.statut.codeStatut ?? '')
                              .withOpacity(0.2),
                          _getStatutColor(_statutActuel?.statut.codeStatut ?? '')
                              .withOpacity(0.1),
                        ],
                      ),
                      borderRadius: BorderRadius.circular(AppTheme.radiusMD),
                      border: Border.all(
                        color: _getStatutColor(_statutActuel?.statut.codeStatut ?? '')
                            .withOpacity(0.3),
                        width: 1.5,
                      ),
                    ),
                    child: Icon(
                      _getStatutIcon(_statutActuel?.statut.codeStatut ?? ''),
                      color: _getStatutColor(_statutActuel?.statut.codeStatut ?? ''),
                      size: 32,
                    ),
                  ),
                  const SizedBox(width: AppTheme.spacingMD),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'STATUT ACTUEL',
                          style: AppTheme.labelSmall.copyWith(
                            color: const Color(0xFF8E8E93),
                          ),
                        ),
                        const SizedBox(height: AppTheme.spacingXS),
                        Text(
                          _statutActuel?.statut.libelle ?? 'En Service',
                          style: AppTheme.titleMedium.copyWith(
                            color: const Color(0xFF1A1A1A),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Icon(
                    Icons.expand_less,
                    color: Colors.grey[400],
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: AppTheme.spacingMD),
            
            // Bouton Carte
            ModernButton(
              label: 'Voir l\'itinéraire',
              icon: Icons.map_rounded,
              onPressed: _ouvrirCarte,
              gradient: AppGradients.primary,
              boxShadow: AppShadows.colored(AppColors.primary, opacity: 0.3),
            ),
            
            const SizedBox(height: AppTheme.spacingMD),
            
            // Bouton Arrêter
            ModernButton(
              label: 'Arrêter la journée',
              icon: Icons.stop_circle_rounded,
              onPressed: _isLoading ? null : _arreterSession,
              backgroundColor: AppColors.rougeArreter,
              boxShadow: AppShadows.colored(
                AppColors.rougeArreter,
                opacity: 0.4,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
