import 'package:flutter/material.dart';
import '../colors/app_colors.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';
import '../models/utilisateur.dart';
import 'dashboard_screen.dart';
import 'historique_screen.dart';
import 'profil_screen.dart';
import 'admin/dashboard_manager_screen.dart';
import 'admin/sessions_en_cours_screen.dart';
import 'admin/visualisation_carte_admin_screen.dart';
import 'admin/rapports_statistiques_screen.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen>
    with SingleTickerProviderStateMixin {
  int _selectedIndex = 0;
  final ApiService _apiService = ApiService();
  Utilisateur? _utilisateur;
  bool _isLoading = true;
  bool _isAdmin = false;
  late AnimationController _animationController;

  List<Widget> get _screensAgent => [
    const DashboardScreen(),
    const HistoriqueScreen(),
    const ProfilScreen(),
  ];

  List<Widget> get _screensAdmin => [
    const DashboardManagerScreen(),
    const SessionsEnCoursScreen(),
    const VisualisationCarteAdminScreen(),
    const RapportsStatistiquesScreen(),
    const ProfilScreen(),
  ];

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: AppTheme.animationNormal,
      vsync: this,
    );
    _chargerUtilisateur();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _chargerUtilisateur() async {
    try {
      final user = await _apiService.getUtilisateurConnecte();
      setState(() {
        _utilisateur = user;
        _isAdmin = user.role == 'ADMIN' || user.role == 'SUPER_ADMIN';
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  List<Widget> get _screens => _isAdmin ? _screensAdmin : _screensAgent;

  void _onItemTapped(int index) {
    if (index == _selectedIndex) return;
    
    setState(() {
      _selectedIndex = index;
    });
    _animationController.forward(from: 0.0);
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      body: AnimatedSwitcher(
        duration: AppTheme.animationNormal,
        transitionBuilder: (Widget child, Animation<double> animation) {
          return FadeTransition(
            opacity: animation,
            child: SlideTransition(
              position: Tween<Offset>(
                begin: const Offset(0.05, 0.0),
                end: Offset.zero,
              ).animate(CurvedAnimation(
                parent: animation,
                curve: Curves.easeOutCubic,
              )),
              child: child,
            ),
          );
        },
        child: IndexedStack(
          key: ValueKey<int>(_selectedIndex),
          index: _selectedIndex,
          children: _screens,
        ),
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 20,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          child: Container(
            height: 70,
            padding: const EdgeInsets.symmetric(
              horizontal: AppTheme.spacingSM,
              vertical: AppTheme.spacingXS,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: _buildNavItems(),
            ),
          ),
        ),
      ),
    );
  }

  List<Widget> _buildNavItems() {
    if (_isAdmin) {
      return [
        _buildNavItem(Icons.dashboard_rounded, 'Dashboard', 0),
        _buildNavItem(Icons.play_circle_rounded, 'Sessions', 1),
        _buildNavItem(Icons.map_rounded, 'Carte', 2),
        _buildNavItem(Icons.bar_chart_rounded, 'Rapports', 3),
        _buildNavItem(Icons.settings_rounded, 'Paramètres', 4),
      ];
    } else {
      return [
        _buildNavItem(Icons.dashboard_rounded, 'Dashboard', 0),
        _buildNavItem(Icons.access_time_rounded, 'Historique', 1),
        _buildNavItem(Icons.settings_rounded, 'Paramètres', 2),
      ];
    }
  }

  Widget _buildNavItem(IconData icon, String label, int index) {
    final isSelected = _selectedIndex == index;
    
    return Expanded(
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => _onItemTapped(index),
          borderRadius: BorderRadius.circular(AppTheme.radiusMD),
          child: AnimatedContainer(
            duration: AppTheme.animationFast,
            padding: const EdgeInsets.symmetric(
              vertical: AppTheme.spacingXS,
              horizontal: AppTheme.spacingSM,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                AnimatedContainer(
                  duration: AppTheme.animationFast,
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? AppColors.primary.withOpacity(0.1)
                        : Colors.transparent,
                    borderRadius: BorderRadius.circular(AppTheme.radiusSM),
                  ),
                  child: Icon(
                    icon,
                    size: 24,
                    color: isSelected
                        ? AppColors.primary
                        : const Color(0xFF8E8E93),
                  ),
                ),
                const SizedBox(height: 4),
                AnimatedDefaultTextStyle(
                  duration: AppTheme.animationFast,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                    color: isSelected
                        ? AppColors.primary
                        : const Color(0xFF8E8E93),
                    letterSpacing: 0.3,
                  ),
                  child: Text(
                    label.toUpperCase(),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
