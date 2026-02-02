import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../colors/app_colors.dart';
import '../theme/app_theme.dart';
import '../widgets/modern_card.dart';
import '../models/statut.dart';
import '../models/changement_statut.dart';
import '../services/api_service.dart';
import '../services/sync_service.dart';

class StatutBottomSheet extends StatefulWidget {
  final int sessionId;
  final VoidCallback onStatutChange;

  const StatutBottomSheet({
    super.key,
    required this.sessionId,
    required this.onStatutChange,
  });

  @override
  State<StatutBottomSheet> createState() => _StatutBottomSheetState();
}

class _StatutBottomSheetState extends State<StatutBottomSheet> {
  final ApiService _apiService = ApiService();
  final SyncService _syncService = SyncService();
  List<Statut> _statuts = [];
  bool _isLoading = true;
  bool _isChanging = false;

  @override
  void initState() {
    super.initState();
    _chargerStatuts();
  }

  Future<void> _chargerStatuts() async {
    try {
      List<Statut> statuts = await _apiService.getAllStatuts();
      setState(() {
        _statuts = statuts;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur: $e')),
        );
      }
    }
  }

  Color _getStatutColor(String codeStatut) {
    switch (codeStatut.toUpperCase()) {
      case 'PAUSE_DEJEUNER':
      case 'PAUSE':
        return AppColors.statutDeplacement; // Violet pour pause déjeuner
      case 'RENDEZ_VOUS_CLIENT':
      case 'CHEZ_CLIENT':
        return AppColors.statutPause; // Jaune pour rendez-vous client
      case 'TRAJET':
      case 'EN_DEPLACEMENT':
        return Colors.red; // Rouge pour trajet
      case 'REUNION':
        return Colors.blue; // Bleu pour réunion
      default:
        return AppColors.primary;
    }
  }

  IconData _getStatutIcon(String codeStatut) {
    switch (codeStatut.toUpperCase()) {
      case 'PAUSE_DEJEUNER':
      case 'PAUSE':
        return Icons.restaurant; // Mug café
      case 'RENDEZ_VOUS_CLIENT':
      case 'CHEZ_CLIENT':
        return Icons.handshake; // Poignée de main
      case 'TRAJET':
      case 'EN_DEPLACEMENT':
        return Icons.directions_car; // Voiture
      case 'REUNION':
        return Icons.bar_chart; // Graphique
      default:
        return Icons.help_outline;
    }
  }

  Future<void> _changerStatut(Statut statut) async {
    setState(() => _isChanging = true);
    try {
      await _apiService.changerStatut(widget.sessionId, statut.codeStatut);
      if (mounted) {
        Navigator.pop(context);
        widget.onStatutChange();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Statut changé: ${statut.libelle}'),
            backgroundColor: AppColors.success,
          ),
        );
      }
    } catch (e) {
      String errorMessage = e.toString();
      
      // Vérifier si la session est clôturée
      if (errorMessage.contains('clôturée') || errorMessage.contains('cloturée')) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('La session est déjà clôturée. Veuillez démarrer une nouvelle session pour changer de statut.'),
              backgroundColor: AppColors.error,
              duration: const Duration(seconds: 5),
            ),
          );
        }
        return;
      }
      
      // En cas d'erreur réseau, sauvegarder localement pour synchronisation ultérieure
      // Vérifier si c'est un ID temporaire (très grand nombre = timestamp)
      final isTempId = widget.sessionId > 1000000000000;
      
      final changement = ChangementStatut(
        sessionId: widget.sessionId,
        statut: statut,
        timestamp: DateTime.now(),
        synchronise: false,
      );
      await _syncService.sauvegarderChangementStatutPending(changement);
      
      if (mounted) {
        Navigator.pop(context);
        widget.onStatutChange();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(isTempId 
              ? 'Statut changé (hors ligne): ${statut.libelle}. Synchronisation automatique à la reconnexion.'
              : 'Statut changé (hors ligne): ${statut.libelle}. Synchronisation automatique à la reconnexion.'),
            backgroundColor: AppColors.warning,
            duration: const Duration(seconds: 4),
          ),
        );
      }
    } finally {
      setState(() => _isChanging = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppTheme.radiusXXL)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Handle bar
          Center(
            child: Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.only(top: AppTheme.spacingSM, bottom: AppTheme.spacingLG),
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppTheme.spacingLG),
            child: Text(
              'Changer de Statut',
              style: AppTheme.titleLarge,
            ),
          ),
          
          const SizedBox(height: AppTheme.spacingLG),
          
          if (_isLoading)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(AppTheme.spacingXXL),
                child: CircularProgressIndicator(),
              ),
            )
          else if (_statuts.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(AppTheme.spacingXXL),
                child: Text(
                  'Aucun statut disponible',
                  style: AppTheme.bodyMedium.copyWith(
                    color: const Color(0xFF8E8E93),
                  ),
                ),
              ),
            )
          else
            Flexible(
              child: ListView.builder(
                shrinkWrap: true,
                padding: const EdgeInsets.symmetric(horizontal: AppTheme.spacingLG),
                itemCount: _statuts
                    .where((statut) => statut.codeStatut.isNotEmpty && statut.libelle.isNotEmpty)
                    .length,
                itemBuilder: (context, index) {
                  final statut = _statuts
                      .where((statut) => statut.codeStatut.isNotEmpty && statut.libelle.isNotEmpty)
                      .elementAt(index);
                  
                  return Padding(
                    padding: const EdgeInsets.only(bottom: AppTheme.spacingMD),
                    child: ModernCard(
                      padding: const EdgeInsets.all(AppTheme.spacingMD),
                      onTap: _isChanging ? null : () {
                        HapticFeedback.selectionClick();
                        _changerStatut(statut);
                      },
                      child: Row(
                        children: [
                          Container(
                            width: 64,
                            height: 64,
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [
                                  _getStatutColor(statut.codeStatut).withOpacity(0.2),
                                  _getStatutColor(statut.codeStatut).withOpacity(0.1),
                                ],
                              ),
                              borderRadius: BorderRadius.circular(AppTheme.radiusMD),
                              border: Border.all(
                                color: _getStatutColor(statut.codeStatut).withOpacity(0.3),
                                width: 1.5,
                              ),
                            ),
                            child: Icon(
                              _getStatutIcon(statut.codeStatut),
                              color: _getStatutColor(statut.codeStatut),
                              size: 32,
                            ),
                          ),
                          const SizedBox(width: AppTheme.spacingMD),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  statut.libelle,
                                  style: AppTheme.titleMedium,
                                ),
                                const SizedBox(height: AppTheme.spacingXS),
                                Text(
                                  'Appuyez pour sélectionner',
                                  style: AppTheme.bodySmall,
                                ),
                              ],
                            ),
                          ),
                          if (_isChanging)
                            const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          
          SizedBox(height: MediaQuery.of(context).viewInsets.bottom + AppTheme.spacingLG),
        ],
      ),
    );
  }
}
