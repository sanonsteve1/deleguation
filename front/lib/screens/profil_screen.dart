import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../colors/app_colors.dart';
import '../theme/app_theme.dart';
import '../widgets/modern_card.dart';
import '../services/api_service.dart';
import '../services/session_service.dart';
import '../models/utilisateur.dart';
import 'login_screen.dart';
import 'informations_personnelles_screen.dart';
import 'support_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ProfilScreen extends StatefulWidget {
  const ProfilScreen({super.key});

  @override
  State<ProfilScreen> createState() => _ProfilScreenState();
}

class _ProfilScreenState extends State<ProfilScreen> {
  final ApiService _apiService = ApiService();
  final SessionService _sessionService = SessionService();
  Utilisateur? _utilisateur;
  bool _isLoading = true;
  bool _isDeconnexion = false;

  @override
  void initState() {
    super.initState();
    _chargerUtilisateur();
  }

  Future<void> _chargerUtilisateur() async {
    setState(() => _isLoading = true);
    try {
      Utilisateur utilisateur = await _apiService.getUtilisateurConnecte();
      setState(() {
        _utilisateur = utilisateur;
      });
    } catch (e) {
      if (mounted) {
        _showErrorSnackBar('Erreur lors du chargement: $e');
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _deconnexion() async {
    final confirmer = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppTheme.radiusLG),
        ),
        title: const Text('Déconnexion'),
        content: const Text(
          'Êtes-vous sûr de vouloir vous déconnecter ?\n\nToute session en cours sera arrêtée.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(
              foregroundColor: AppColors.error,
            ),
            child: const Text('Déconnexion'),
          ),
        ],
      ),
    );

    if (confirmer != true) return;

    HapticFeedback.mediumImpact();
    setState(() => _isDeconnexion = true);

    try {
      if (_sessionService.sessionEnCours != null && 
          _sessionService.sessionEnCours!.estEnCours) {
        try {
          await _sessionService.arreterSession();
        } catch (e) {
          // Continue
        }
      }

      await _apiService.logout();

      final prefs = await SharedPreferences.getInstance();
      await prefs.clear();

      if (mounted) {
        HapticFeedback.lightImpact();
        Navigator.of(context).pushAndRemoveUntil(
          PageRouteBuilder(
            pageBuilder: (context, animation, secondaryAnimation) => const LoginScreen(),
            transitionsBuilder: (context, animation, secondaryAnimation, child) {
              return FadeTransition(
                opacity: animation,
                child: child,
              );
            },
            transitionDuration: AppTheme.animationNormal,
          ),
          (route) => false,
        );
      }
    } catch (e) {
      if (mounted) {
        _showErrorSnackBar('Erreur lors de la déconnexion: $e');
      }
    } finally {
      if (mounted) {
        setState(() => _isDeconnexion = false);
      }
    }
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

  String _formaterDateAdhesion() {
    final now = DateTime.now();
    final monthNames = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];
    return 'Membre depuis ${monthNames[now.month - 1]} ${now.year}';
  }

  String _getTypeCompte(String role) {
    switch (role.toLowerCase()) {
      case 'agent':
      case 'utilisateur':
        return 'Compte Agent';
      case 'admin':
        return 'Compte Administrateur';
      default:
        return 'Compte Utilisateur';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _utilisateur == null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.error_outline,
                        size: 64,
                        color: AppColors.error,
                      ),
                      const SizedBox(height: AppTheme.spacingMD),
                      const Text('Impossible de charger les informations'),
                      const SizedBox(height: AppTheme.spacingMD),
                      ElevatedButton(
                        onPressed: _chargerUtilisateur,
                        child: const Text('Réessayer'),
                      ),
                    ],
                  ),
                )
              : CustomScrollView(
                  slivers: [
                    // Header avec gradient
                    SliverToBoxAdapter(
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: AppGradients.primary,
                        ),
                        padding: EdgeInsets.only(
                          top: MediaQuery.of(context).padding.top + AppTheme.spacingLG,
                          bottom: AppTheme.spacingXXL,
                          left: AppTheme.spacingLG,
                          right: AppTheme.spacingLG,
                        ),
                        child: Column(
                          children: [
                            // Avatar
                            Container(
                              width: 100,
                              height: 100,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: Colors.white.withOpacity(0.2),
                                border: Border.all(
                                  color: Colors.white.withOpacity(0.3),
                                  width: 3,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.2),
                                    blurRadius: 20,
                                    spreadRadius: 5,
                                  ),
                                ],
                              ),
                              child: const Icon(
                                Icons.person,
                                size: 60,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: AppTheme.spacingMD),
                            
                            // Nom
                            Text(
                              _utilisateur!.nomComplet.toUpperCase(),
                              style: const TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                                letterSpacing: 1,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: AppTheme.spacingXS),
                            
                            // Type de compte
                            Text(
                              _getTypeCompte(_utilisateur!.role),
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.white.withOpacity(0.9),
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            const SizedBox(height: AppTheme.spacingXS),
                            
                            // Date d'adhésion
                            Text(
                              _formaterDateAdhesion(),
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.white.withOpacity(0.8),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    
                    // Contenu
                    SliverToBoxAdapter(
                      child: Container(
                        decoration: const BoxDecoration(
                          color: Color(0xFFF8F9FA),
                          borderRadius: BorderRadius.vertical(
                            top: Radius.circular(AppTheme.radiusXXL),
                          ),
                        ),
                        padding: const EdgeInsets.all(AppTheme.spacingLG),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Mon compte',
                              style: AppTheme.headline2,
                            ),
                            const SizedBox(height: AppTheme.spacingXL),
                            
                            // Informations personnelles
                            ModernCard(
                              padding: const EdgeInsets.all(AppTheme.spacingMD),
                              onTap: () {
                                HapticFeedback.selectionClick();
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => const InformationsPersonnellesScreen(),
                                  ),
                                );
                              },
                              child: Row(
                                children: [
                                  Container(
                                    width: 56,
                                    height: 56,
                                    decoration: BoxDecoration(
                                      gradient: AppGradients.primary,
                                      borderRadius: BorderRadius.circular(AppTheme.radiusMD),
                                    ),
                                    child: const Icon(
                                      Icons.person_outline,
                                      color: Colors.white,
                                      size: 28,
                                    ),
                                  ),
                                  const SizedBox(width: AppTheme.spacingMD),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Informations personnelles',
                                          style: AppTheme.titleMedium,
                                        ),
                                        const SizedBox(height: AppTheme.spacingXS),
                                        Text(
                                          'Complétez votre profil',
                                          style: AppTheme.bodySmall,
                                        ),
                                      ],
                                    ),
                                  ),
                                  Icon(
                                    Icons.chevron_right,
                                    color: Colors.grey[400],
                                  ),
                                ],
                              ),
                            ),
                            
                            const SizedBox(height: AppTheme.spacingMD),
                            
                            // Support
                            ModernCard(
                              padding: EdgeInsets.zero,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Padding(
                                    padding: const EdgeInsets.all(AppTheme.spacingMD),
                                    child: Text(
                                      'Support',
                                      style: AppTheme.titleLarge,
                                    ),
                                  ),
                                  _buildSupportItem(
                                    icon: Icons.help_outline_rounded,
                                    iconColor: Colors.green,
                                    title: 'Centre d\'aide',
                                    onTap: () {
                                      HapticFeedback.selectionClick();
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) => const SupportScreen(section: 'aide'),
                                        ),
                                      );
                                    },
                                  ),
                                  const Divider(height: 1, indent: 84),
                                  _buildSupportItem(
                                    icon: Icons.shield_outlined,
                                    iconColor: Colors.blue,
                                    title: 'Politique de confidentialité',
                                    onTap: () {
                                      HapticFeedback.selectionClick();
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) => const SupportScreen(section: 'confidentialite'),
                                        ),
                                      );
                                    },
                                  ),
                                  const Divider(height: 1, indent: 84),
                                  _buildSupportItem(
                                    icon: Icons.description_outlined,
                                    iconColor: Colors.orange,
                                    title: 'Conditions d\'utilisation',
                                    onTap: () {
                                      HapticFeedback.selectionClick();
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) => const SupportScreen(section: 'conditions'),
                                        ),
                                      );
                                    },
                                  ),
                                ],
                              ),
                            ),
                            
                            const SizedBox(height: AppTheme.spacingMD),
                            
                            // Déconnexion
                            ModernCard(
                              padding: const EdgeInsets.all(AppTheme.spacingMD),
                              onTap: _isDeconnexion ? null : _deconnexion,
                              backgroundColor: Colors.white,
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  if (_isDeconnexion)
                                    const SizedBox(
                                      width: 20,
                                      height: 20,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                                      ),
                                    )
                                  else
                                    Container(
                                      padding: const EdgeInsets.all(4),
                                      decoration: BoxDecoration(
                                        color: AppColors.primary.withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(AppTheme.radiusSM),
                                      ),
                                      child: const Icon(
                                        Icons.logout_rounded,
                                        color: AppColors.primary,
                                        size: 20,
                                      ),
                                    ),
                                  const SizedBox(width: AppTheme.spacingSM),
                                  Text(
                                    _isDeconnexion ? 'Déconnexion...' : 'Déconnexion',
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.primary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            
                            const SizedBox(height: AppTheme.spacingXXL),
                            
                            // Version
                            Center(
                              child: Column(
                                children: [
                                  Text(
                                    'Version 1.1.1',
                                    style: AppTheme.bodySmall,
                                  ),
                                  const SizedBox(height: AppTheme.spacingXS),
                                  Text(
                                    '© 2026 FieldTrack Pro',
                                    style: AppTheme.bodySmall,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
    );
  }

  Widget _buildSupportItem({
    required IconData icon,
    required Color iconColor,
    required String title,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: AppTheme.spacingMD,
          vertical: AppTheme.spacingMD,
        ),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: iconColor,
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                color: Colors.white,
                size: 24,
              ),
            ),
            const SizedBox(width: AppTheme.spacingMD),
            Expanded(
              child: Text(
                title,
                style: AppTheme.titleMedium,
              ),
            ),
            Icon(
              Icons.chevron_right,
              color: Colors.grey[400],
            ),
          ],
        ),
      ),
    );
  }
}
