import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:intl/intl.dart';
import 'package:geolocator/geolocator.dart';
import '../../colors/app_colors.dart';
import '../../theme/app_theme.dart';
import '../../widgets/modern_card.dart';
import '../../services/api_service.dart';
import '../../models/session_travail.dart';
import '../../models/utilisateur.dart';
import '../../models/position_gps.dart';

class VisualisationCarteAdminScreen extends StatefulWidget {
  const VisualisationCarteAdminScreen({super.key});

  @override
  State<VisualisationCarteAdminScreen> createState() => _VisualisationCarteAdminScreenState();
}

class _VisualisationCarteAdminScreenState extends State<VisualisationCarteAdminScreen> {
  final ApiService _apiService = ApiService();
  final MapController _mapController = MapController();
  List<SessionTravail> _sessions = [];
  List<Utilisateur> _utilisateurs = [];
  Map<int, List<PositionGps>> _positionsParSession = {};
  bool _isLoading = true;
  int? _sessionSelectionnee;
  double _currentZoom = 13.0;
  LatLng? _currentMapCenter;
  
  // Filtres
  Set<int> _sessionsVisibles = {}; // IDs des sessions à afficher (vide = toutes)
  Set<int> _agentsFiltres = {}; // IDs des agents à afficher (vide = tous)
  DateTime? _dateDebut;
  DateTime? _dateFin;
  bool _afficherUniquementSelectionnee = false;

  @override
  void initState() {
    super.initState();
    _chargerDonnees();
  }

  Future<void> _chargerDonnees() async {
    setState(() => _isLoading = true);
    try {
      final sessions = await _apiService.getHistoriqueSessions();
      final utilisateurs = await _apiService.getAllUtilisateurs();
      
      Map<int, List<PositionGps>> positions = {};
      for (var session in sessions) {
        if (session.id != null) {
          try {
            final pos = await _apiService.getPositionsParSession(session.id!);
            positions[session.id!] = pos;
          } catch (e) {
            // Ignorer les erreurs
          }
        }
      }
      
      setState(() {
        _sessions = sessions;
        _utilisateurs = utilisateurs;
        _positionsParSession = positions;
        _isLoading = false;
        // Par défaut, toutes les sessions sont visibles
        _sessionsVisibles = sessions.where((s) => s.id != null).map((s) => s.id!).toSet();
      });
      
      // Centrer la carte sur la première session si disponible
      if (_sessions.isNotEmpty && _sessions.first.id != null) {
        final positions = _positionsParSession[_sessions.first.id];
        if (positions != null && positions.isNotEmpty) {
          final center = LatLng(positions.first.latitude, positions.first.longitude);
          _currentMapCenter = center;
          _safeMapMove(center, 13.0);
        }
      }
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        _showErrorSnackBar('Erreur: $e');
      }
    }
  }

  void _safeMapMove(LatLng center, double zoom) {
    _currentMapCenter = center;
    _currentZoom = zoom;
    
    Future.microtask(() {
      if (!mounted) return;
      try {
        _mapController.move(center, zoom);
      } catch (e) {
        Future.delayed(const Duration(milliseconds: 300), () {
          if (mounted) {
            try {
              _mapController.move(center, zoom);
            } catch (e2) {
              // Ignorer
            }
          }
        });
      }
    });
  }

  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.error_outline, color: Colors.white, size: 20),
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

  Utilisateur _getUtilisateur(int? idUtilisateur) {
    return _utilisateurs.firstWhere(
      (u) => u.id == idUtilisateur,
      orElse: () => Utilisateur(
        id: idUtilisateur ?? 0,
        username: 'Inconnu',
        nom: '',
        prenoms: '',
        role: 'AGENT',
      ),
    );
  }

  List<LatLng> _getPolylinePoints(int sessionId) {
    final positions = _positionsParSession[sessionId];
    if (positions == null || positions.isEmpty) return [];
    
    return positions.map((p) => LatLng(p.latitude, p.longitude)).toList();
  }

  // Vérifier si une session doit être affichée selon les filtres
  bool _doitAfficherSession(SessionTravail session) {
    // Si on affiche uniquement la session sélectionnée
    if (_afficherUniquementSelectionnee) {
      return session.id == _sessionSelectionnee;
    }
    
    // Vérifier si la session est dans les sessions visibles
    if (_sessionsVisibles.isNotEmpty && session.id != null) {
      if (!_sessionsVisibles.contains(session.id)) {
        return false;
      }
    }
    
    // Filtrer par agent
    if (_agentsFiltres.isNotEmpty) {
      if (!_agentsFiltres.contains(session.idUtilisateur)) {
        return false;
      }
    }
    
    // Filtrer par date
    if (_dateDebut != null) {
      if (session.heureDebut.isBefore(_dateDebut!)) {
        return false;
      }
    }
    if (_dateFin != null) {
      if (session.heureDebut.isAfter(_dateFin!.add(const Duration(days: 1)))) {
        return false;
      }
    }
    
    return true;
  }

  List<SessionTravail> get _sessionsFiltrees {
    return _sessions.where(_doitAfficherSession).toList();
  }

  void _appliquerFiltres() {
    setState(() {
      // Les filtres sont appliqués via _sessionsFiltrees
    });
  }

  void _reinitialiserFiltres() {
    setState(() {
      _sessionsVisibles = _sessions.where((s) => s.id != null).map((s) => s.id!).toSet();
      _agentsFiltres.clear();
      _dateDebut = null;
      _dateFin = null;
      _afficherUniquementSelectionnee = false;
    });
  }

  void _ouvrirFiltres() {
    HapticFeedback.selectionClick();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(
              top: Radius.circular(AppTheme.radiusXXL),
            ),
          ),
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Handle bar
              Container(
                margin: const EdgeInsets.only(top: AppTheme.spacingSM, bottom: AppTheme.spacingMD),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              
              Padding(
                padding: const EdgeInsets.all(AppTheme.spacingLG),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Filtrer les itinéraires',
                      style: AppTheme.titleLarge,
                    ),
                    const SizedBox(height: AppTheme.spacingXL),
                    
                    // Toggle : Afficher uniquement la session sélectionnée
                    ModernCard(
                      padding: const EdgeInsets.all(AppTheme.spacingMD),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Session sélectionnée uniquement',
                                  style: AppTheme.titleMedium,
                                ),
                                const SizedBox(height: AppTheme.spacingXS),
                                Text(
                                  'Masquer tous les autres itinéraires',
                                  style: AppTheme.bodySmall,
                                ),
                              ],
                            ),
                          ),
                          Switch(
                            value: _afficherUniquementSelectionnee,
                            onChanged: (value) {
                              setModalState(() {
                                setState(() {
                                  _afficherUniquementSelectionnee = value;
                                  if (value && _sessionSelectionnee == null && _sessions.isNotEmpty) {
                                    _sessionSelectionnee = _sessions.first.id;
                                  }
                                });
                              });
                            },
                            activeColor: AppColors.primary,
                          ),
                        ],
                      ),
                    ),
                    
                    const SizedBox(height: AppTheme.spacingLG),
                    
                    // Filtre par agent
                    Text(
                      'Agents',
                      style: AppTheme.titleMedium,
                    ),
                    const SizedBox(height: AppTheme.spacingMD),
                    Wrap(
                      spacing: AppTheme.spacingSM,
                      runSpacing: AppTheme.spacingSM,
                      children: [
                        ChoiceChip(
                          label: const Text('Tous'),
                          selected: _agentsFiltres.isEmpty,
                          onSelected: (selected) {
                            setModalState(() {
                              setState(() {
                                _agentsFiltres.clear();
                              });
                            });
                          },
                          selectedColor: AppColors.primary.withOpacity(0.2),
                          checkmarkColor: AppColors.primary,
                          labelStyle: TextStyle(
                            color: _agentsFiltres.isEmpty
                                ? AppColors.primary
                                : Colors.grey[700],
                            fontWeight: _agentsFiltres.isEmpty
                                ? FontWeight.bold
                                : FontWeight.normal,
                          ),
                        ),
                        ..._utilisateurs.map((utilisateur) {
                          final isSelected = _agentsFiltres.contains(utilisateur.id);
                          return ChoiceChip(
                            label: Text(utilisateur.nomComplet),
                            selected: isSelected,
                            onSelected: (selected) {
                              setModalState(() {
                                setState(() {
                                  if (selected) {
                                    _agentsFiltres.add(utilisateur.id);
                                  } else {
                                    _agentsFiltres.remove(utilisateur.id);
                                  }
                                });
                              });
                            },
                            selectedColor: AppColors.primary.withOpacity(0.2),
                            checkmarkColor: AppColors.primary,
                            labelStyle: TextStyle(
                              color: isSelected
                                  ? AppColors.primary
                                  : Colors.grey[700],
                              fontWeight: isSelected
                                  ? FontWeight.bold
                                  : FontWeight.normal,
                            ),
                          );
                        }),
                      ],
                    ),
                    
                    const SizedBox(height: AppTheme.spacingLG),
                    
                    // Filtre par date
                    Text(
                      'Période',
                      style: AppTheme.titleMedium,
                    ),
                    const SizedBox(height: AppTheme.spacingMD),
                    Row(
                      children: [
                        Expanded(
                          child: ModernCard(
                            padding: const EdgeInsets.all(AppTheme.spacingMD),
                            onTap: () async {
                              final date = await showDatePicker(
                                context: context,
                                initialDate: _dateDebut ?? DateTime.now(),
                                firstDate: DateTime(2020),
                                lastDate: DateTime.now(),
                                locale: const Locale('fr', 'FR'),
                              );
                              if (date != null) {
                                setModalState(() {
                                  setState(() {
                                    _dateDebut = date;
                                  });
                                });
                              }
                            },
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Date de début',
                                  style: AppTheme.labelSmall,
                                ),
                                const SizedBox(height: AppTheme.spacingXS),
                                Text(
                                  _dateDebut != null
                                      ? DateFormat('dd MMM yyyy', 'fr_FR').format(_dateDebut!)
                                      : 'Sélectionner',
                                  style: AppTheme.bodyMedium.copyWith(
                                    fontWeight: FontWeight.w600,
                                    color: _dateDebut != null
                                        ? AppColors.primaryDark
                                        : Colors.grey[600],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: AppTheme.spacingMD),
                        Expanded(
                          child: ModernCard(
                            padding: const EdgeInsets.all(AppTheme.spacingMD),
                            onTap: () async {
                              final date = await showDatePicker(
                                context: context,
                                initialDate: _dateFin ?? DateTime.now(),
                                firstDate: _dateDebut ?? DateTime(2020),
                                lastDate: DateTime.now(),
                                locale: const Locale('fr', 'FR'),
                              );
                              if (date != null) {
                                setModalState(() {
                                  setState(() {
                                    _dateFin = date;
                                  });
                                });
                              }
                            },
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Date de fin',
                                  style: AppTheme.labelSmall,
                                ),
                                const SizedBox(height: AppTheme.spacingXS),
                                Text(
                                  _dateFin != null
                                      ? DateFormat('dd MMM yyyy', 'fr_FR').format(_dateFin!)
                                      : 'Sélectionner',
                                  style: AppTheme.bodyMedium.copyWith(
                                    fontWeight: FontWeight.w600,
                                    color: _dateFin != null
                                        ? AppColors.primaryDark
                                        : Colors.grey[600],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: AppTheme.spacingXL),
                    
                    // Boutons
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () {
                              setModalState(() {
                                _reinitialiserFiltres();
                              });
                            },
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: AppTheme.spacingMD),
                              side: BorderSide(color: Colors.grey[300]!),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(AppTheme.radiusMD),
                              ),
                            ),
                            child: const Text(
                              'RÉINITIALISER',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Colors.black87,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: AppTheme.spacingMD),
                        Expanded(
                          flex: 2,
                          child: ElevatedButton(
                            onPressed: () {
                              _appliquerFiltres();
                              Navigator.pop(context);
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              padding: const EdgeInsets.symmetric(vertical: AppTheme.spacingMD),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(AppTheme.radiusMD),
                              ),
                              elevation: 0,
                            ),
                            child: const Text(
                              'APPLIQUER',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: AppTheme.spacingMD),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getColorForSession(int index) {
    final colors = [
      AppColors.primary,
      AppColors.vertDemarrer,
      AppColors.statutDeplacement,
      AppColors.statutPause,
      Colors.blue,
      Colors.orange,
    ];
    return colors[index % colors.length];
  }

  double _calculerDistance(int sessionId) {
    final positions = _positionsParSession[sessionId];
    if (positions == null || positions.length < 2) return 0.0;
    
    double totalDistance = 0.0;
    for (int i = 0; i < positions.length - 1; i++) {
      totalDistance += Geolocator.distanceBetween(
        positions[i].latitude,
        positions[i].longitude,
        positions[i + 1].latitude,
        positions[i + 1].longitude,
      );
    }
    return totalDistance;
  }

  String _formaterDistance(double distance) {
    if (distance < 1000) {
      return '${distance.toStringAsFixed(0)} m';
    } else {
      return '${(distance / 1000).toStringAsFixed(1)} km';
    }
  }

  String _formaterDuree(Duration duree) {
    final heures = duree.inHours;
    final minutes = duree.inMinutes.remainder(60);
    
    if (heures > 0) {
      return '${heures}h ${minutes}min';
    } else {
      return '${minutes}min';
    }
  }

  SessionTravail? _getSessionSelectionnee() {
    if (_sessionSelectionnee == null) return null;
    return _sessions.firstWhere(
      (s) => s.id == _sessionSelectionnee,
      orElse: () => _sessions.first,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
              ),
            )
          : Stack(
              children: [
                // Carte principale
                FlutterMap(
                  mapController: _mapController,
                  options: MapOptions(
                    initialCenter: _currentMapCenter ?? const LatLng(48.8566, 2.3522),
                    initialZoom: _currentZoom,
                    minZoom: 5.0,
                    maxZoom: 18.0,
                    interactionOptions: const InteractionOptions(
                      flags: InteractiveFlag.all,
                    ),
                    onMapReady: () {
                      if (_currentMapCenter != null) {
                        _safeMapMove(_currentMapCenter!, _currentZoom);
                      }
                    },
                  ),
                  children: [
                    // Tuiles de carte avec style moderne
                    TileLayer(
                      urlTemplate: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
                      subdomains: const ['a', 'b', 'c', 'd'],
                      userAgentPackageName: 'com.eburtis.fieldtrack',
                      maxZoom: 19,
                    ),
                    
                    // Itinéraires des sessions filtrées avec halo
                    ..._sessionsFiltrees.map((session) {
                      if (session.id == null) return const SizedBox.shrink();
                      
                      final points = _getPolylinePoints(session.id!);
                      if (points.isEmpty) return const SizedBox.shrink();
                      
                      // Trouver l'index original dans _sessions pour la couleur
                      final originalIndex = _sessions.indexWhere((s) => s.id == session.id);
                      final color = _getColorForSession(originalIndex >= 0 ? originalIndex : 0);
                      final isSelected = _sessionSelectionnee == session.id;
                      final opacity = isSelected ? 1.0 : (_afficherUniquementSelectionnee ? 1.0 : 0.4);
                      
                      return Stack(
                        children: [
                          // Halo/ombre
                          PolylineLayer(
                            polylines: [
                              Polyline(
                                points: points,
                                strokeWidth: 10.0,
                                color: color.withOpacity(0.15 * opacity),
                              ),
                            ],
                          ),
                          // Itinéraire principal
                          PolylineLayer(
                            polylines: [
                              Polyline(
                                points: points,
                                strokeWidth: isSelected ? 6.0 : 4.0,
                                color: color.withOpacity(opacity),
                                borderStrokeWidth: 1.5,
                                borderColor: Colors.white.withOpacity(opacity),
                              ),
                            ],
                          ),
                        ],
                      );
                    }),
                    
                    // Marqueurs de début et fin
                    MarkerLayer(
                      markers: [
                        ..._sessionsFiltrees.expand((session) {
                          if (session.id == null) return <Marker>[];
                          
                          final positions = _positionsParSession[session.id];
                          if (positions == null || positions.isEmpty) return <Marker>[];
                          
                          final isSelected = _sessionSelectionnee == session.id;
                          
                          return [
                            // Marqueur de début
                            Marker(
                              point: LatLng(positions.first.latitude, positions.first.longitude),
                              width: isSelected ? 56 : 48,
                              height: isSelected ? 56 : 48,
                              child: GestureDetector(
                                onTap: () {
                                  HapticFeedback.selectionClick();
                                  setState(() {
                                    _sessionSelectionnee = session.id;
                                  });
                                  // Centrer la carte sur le début de l'itinéraire
                                  _safeMapMove(
                                    LatLng(positions.first.latitude, positions.first.longitude),
                                    15.0,
                                  );
                                },
                                child: Container(
                                  decoration: BoxDecoration(
                                    color: AppColors.vertDemarrer,
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                      color: Colors.white,
                                      width: isSelected ? 3 : 2.5,
                                    ),
                                    boxShadow: [
                                      BoxShadow(
                                        color: AppColors.vertDemarrer.withOpacity(0.5),
                                        blurRadius: 12,
                                        spreadRadius: 2,
                                      ),
                                    ],
                                  ),
                                  child: const Icon(
                                    Icons.play_circle_filled_rounded,
                                    color: Colors.white,
                                    size: 28,
                                  ),
                                ),
                              ),
                            ),
                            // Marqueur de fin (si session terminée)
                            if (positions.length > 1 && session.heureFin != null)
                              Marker(
                                point: LatLng(positions.last.latitude, positions.last.longitude),
                                width: isSelected ? 56 : 48,
                                height: isSelected ? 56 : 48,
                                child: GestureDetector(
                                  onTap: () {
                                    HapticFeedback.selectionClick();
                                    setState(() {
                                      _sessionSelectionnee = session.id;
                                    });
                                    // Centrer la carte sur la fin de l'itinéraire
                                    _safeMapMove(
                                      LatLng(positions.last.latitude, positions.last.longitude),
                                      15.0,
                                    );
                                  },
                                  child: Container(
                                    decoration: BoxDecoration(
                                      color: AppColors.rougeArreter,
                                      shape: BoxShape.circle,
                                      border: Border.all(
                                        color: Colors.white,
                                        width: isSelected ? 3 : 2.5,
                                      ),
                                      boxShadow: [
                                        BoxShadow(
                                          color: AppColors.rougeArreter.withOpacity(0.5),
                                          blurRadius: 12,
                                          spreadRadius: 2,
                                        ),
                                      ],
                                    ),
                                    child: const Icon(
                                      Icons.stop_circle_rounded,
                                      color: Colors.white,
                                      size: 28,
                                    ),
                                  ),
                                ),
                              ),
                          ];
                        }),
                      ],
                    ),
                  ],
                ),
                
                // Header avec bouton retour et refresh
                SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.all(AppTheme.spacingMD),
                    child: Row(
                      children: [
                        Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                            boxShadow: AppShadows.md,
                          ),
                          child: IconButton(
                            icon: const Icon(Icons.arrow_back_rounded),
                            color: AppColors.primaryDark,
                            onPressed: () {
                              HapticFeedback.selectionClick();
                              Navigator.pop(context);
                            },
                          ),
                        ),
                        const Spacer(),
                        // Badge avec nombre de filtres actifs
                        if (_afficherUniquementSelectionnee || 
                            _agentsFiltres.isNotEmpty || 
                            _dateDebut != null || 
                            _dateFin != null)
                          Container(
                            margin: const EdgeInsets.only(right: AppTheme.spacingSM),
                            padding: const EdgeInsets.symmetric(
                              horizontal: AppTheme.spacingSM,
                              vertical: AppTheme.spacingXS,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              borderRadius: BorderRadius.circular(AppTheme.radiusFull),
                              boxShadow: AppShadows.sm,
                            ),
                            child: Text(
                              '${_sessionsFiltrees.length}/${_sessions.length}',
                              style: AppTheme.labelSmall.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                            boxShadow: AppShadows.md,
                          ),
                          child: IconButton(
                            icon: Stack(
                              children: [
                                const Icon(Icons.filter_list_rounded),
                                if (_afficherUniquementSelectionnee || 
                                    _agentsFiltres.isNotEmpty || 
                                    _dateDebut != null || 
                                    _dateFin != null)
                                  Positioned(
                                    right: 0,
                                    top: 0,
                                    child: Container(
                                      width: 8,
                                      height: 8,
                                      decoration: const BoxDecoration(
                                        color: AppColors.primary,
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                            color: AppColors.primaryDark,
                            onPressed: _ouvrirFiltres,
                          ),
                        ),
                        const SizedBox(width: AppTheme.spacingSM),
                        Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                            boxShadow: AppShadows.md,
                          ),
                          child: IconButton(
                            icon: const Icon(Icons.refresh_rounded),
                            color: AppColors.primaryDark,
                            onPressed: () {
                              HapticFeedback.mediumImpact();
                              _chargerDonnees();
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                
                // Liste de sélection des sessions (en haut, scrollable)
                Positioned(
                  top: 80,
                  left: 0,
                  right: 0,
                  child: Container(
                    height: 140,
                    padding: const EdgeInsets.symmetric(vertical: AppTheme.spacingSM),
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: AppTheme.spacingMD),
                    itemCount: _sessions.length,
                    itemBuilder: (context, index) {
                      final session = _sessions[index];
                      final isVisible = _doitAfficherSession(session);
                        final utilisateur = _getUtilisateur(session.idUtilisateur);
                        final hasPositions = session.id != null && 
                            _positionsParSession[session.id] != null &&
                            _positionsParSession[session.id]!.isNotEmpty;
                        final isSelected = _sessionSelectionnee == session.id;
                        final color = _getColorForSession(index);
                        
                        return Padding(
                          padding: const EdgeInsets.only(right: AppTheme.spacingMD),
                          child: Opacity(
                            opacity: isVisible ? 1.0 : 0.4,
                            child: ModernCard(
                              padding: const EdgeInsets.all(AppTheme.spacingMD),
                              onTap: hasPositions ? () {
                              HapticFeedback.selectionClick();
                              setState(() {
                                _sessionSelectionnee = session.id;
                              });
                              final positions = _positionsParSession[session.id!];
                              if (positions != null && positions.isNotEmpty) {
                                final center = LatLng(
                                  positions.first.latitude,
                                  positions.first.longitude,
                                );
                                _safeMapMove(center, 15.0);
                              }
                            } : null,
                            backgroundColor: isSelected
                                ? color.withOpacity(0.1)
                                : Colors.white,
                            border: Border.all(
                              color: isSelected
                                  ? color
                                  : Colors.grey[200]!,
                              width: isSelected ? 2 : 1,
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      width: 12,
                                      height: 12,
                                      decoration: BoxDecoration(
                                        color: hasPositions ? color : Colors.grey[400],
                                        shape: BoxShape.circle,
                                        boxShadow: hasPositions ? [
                                          BoxShadow(
                                            color: color.withOpacity(0.5),
                                            blurRadius: 4,
                                            spreadRadius: 1,
                                          ),
                                        ] : null,
                                      ),
                                    ),
                                    const SizedBox(width: AppTheme.spacingSM),
                                    Expanded(
                                      child: Text(
                                        utilisateur.nomComplet,
                                        style: AppTheme.titleMedium.copyWith(
                                          color: hasPositions
                                              ? AppColors.primaryDark
                                              : Colors.grey[600],
                                          fontWeight: isSelected
                                              ? FontWeight.bold
                                              : FontWeight.w600,
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: AppTheme.spacingSM),
                                Row(
                                  children: [
                                    Icon(
                                      hasPositions
                                          ? Icons.route_rounded
                                          : Icons.location_off_rounded,
                                      size: 14,
                                      color: hasPositions ? color : Colors.grey[400],
                                    ),
                                    const SizedBox(width: AppTheme.spacingXS),
                                    Text(
                                      hasPositions
                                          ? '${_positionsParSession[session.id]!.length} points'
                                          : 'Pas d\'itinéraire',
                                      style: AppTheme.bodySmall.copyWith(
                                        color: Colors.grey[600],
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          ),
                        );
                      },
                    ),
                  ),
                ),
                
                // Boutons flottants (zoom)
                Positioned(
                  right: AppTheme.spacingMD,
                  bottom: 280,
                  child: Column(
                    children: [
                      _buildFloatingButton(
                        icon: Icons.add_rounded,
                        onPressed: () {
                          HapticFeedback.selectionClick();
                          setState(() {
                            _currentZoom = (_currentZoom + 1).clamp(5.0, 18.0);
                            if (_currentMapCenter != null) {
                              _safeMapMove(_currentMapCenter!, _currentZoom);
                            }
                          });
                        },
                      ),
                      const SizedBox(height: AppTheme.spacingSM),
                      _buildFloatingButton(
                        icon: Icons.remove_rounded,
                        onPressed: () {
                          HapticFeedback.selectionClick();
                          setState(() {
                            _currentZoom = (_currentZoom - 1).clamp(5.0, 18.0);
                            if (_currentMapCenter != null) {
                              _safeMapMove(_currentMapCenter!, _currentZoom);
                            }
                          });
                        },
                      ),
                    ],
                  ),
                ),
                
                // Bouton flottant d'aide pour expliquer les icônes
                Positioned(
                  left: AppTheme.spacingMD,
                  bottom: AppTheme.spacingMD,
                  child: _buildFloatingButton(
                    icon: Icons.info_outline_rounded,
                    onPressed: () {
                      HapticFeedback.selectionClick();
                      _showLegendDialog();
                    },
                  ),
                ),
                
                // Bottom Sheet avec détails de la session sélectionnée
                if (_sessionSelectionnee != null)
                  _buildBottomSheet(),
              ],
            ),
    );
  }

  Widget _buildFloatingButton({
    required IconData icon,
    required VoidCallback onPressed,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
        boxShadow: AppShadows.md,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onPressed,
          borderRadius: BorderRadius.circular(30),
          child: Container(
            width: 48,
            height: 48,
            alignment: Alignment.center,
            child: Icon(
              icon,
              color: AppColors.primaryDark,
              size: 24,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBottomSheet() {
    final session = _getSessionSelectionnee();
    if (session == null || session.id == null) return const SizedBox.shrink();
    
    final positions = _positionsParSession[session.id];
    if (positions == null || positions.isEmpty) return const SizedBox.shrink();
    
    final utilisateur = _getUtilisateur(session.idUtilisateur);
    final distance = _calculerDistance(session.id!);
    final duree = session.duree;
    final color = _getColorForSession(
      _sessions.indexWhere((s) => s.id == session.id),
    );
    
    return DraggableScrollableSheet(
      initialChildSize: 0.35,
      minChildSize: 0.2,
      maxChildSize: 0.7,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(
              top: Radius.circular(AppTheme.radiusXXL),
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black12,
                blurRadius: 20,
                offset: Offset(0, -5),
              ),
            ],
          ),
          child: Column(
            children: [
              // Handle bar
              Container(
                margin: const EdgeInsets.only(top: AppTheme.spacingSM),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              
              // Contenu scrollable
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(AppTheme.spacingLG),
                  children: [
                    // Header avec couleur de session
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(AppTheme.spacingSM),
                          decoration: BoxDecoration(
                            color: color,
                            borderRadius: BorderRadius.circular(AppTheme.radiusMD),
                            boxShadow: [
                              BoxShadow(
                                color: color.withOpacity(0.3),
                                blurRadius: 8,
                                spreadRadius: 2,
                              ),
                            ],
                          ),
                          child: const Icon(
                            Icons.route_rounded,
                            color: Colors.white,
                            size: 24,
                          ),
                        ),
                        const SizedBox(width: AppTheme.spacingMD),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                utilisateur.nomComplet,
                                style: AppTheme.titleLarge,
                              ),
                              const SizedBox(height: AppTheme.spacingXS),
                              Text(
                                'Session ${session.id}',
                                style: AppTheme.bodySmall,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: AppTheme.spacingXL),
                    
                    // Statistiques
                    Row(
                      children: [
                        Expanded(
                          child: _buildStatCard(
                            icon: Icons.straighten_rounded,
                            label: 'Distance',
                            value: _formaterDistance(distance),
                            color: color,
                          ),
                        ),
                        const SizedBox(width: AppTheme.spacingMD),
                        Expanded(
                          child: _buildStatCard(
                            icon: Icons.access_time_rounded,
                            label: 'Durée',
                            value: _formaterDuree(duree),
                            color: AppColors.vertDemarrer,
                          ),
                        ),
                        const SizedBox(width: AppTheme.spacingMD),
                        Expanded(
                          child: _buildStatCard(
                            icon: Icons.location_on_rounded,
                            label: 'Points',
                            value: '${positions.length}',
                            color: AppColors.primaryDark,
                          ),
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: AppTheme.spacingXL),
                    
                    // Détails de la session
                    ModernCard(
                      padding: const EdgeInsets.all(AppTheme.spacingMD),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Détails de la session',
                            style: AppTheme.titleMedium,
                          ),
                          const SizedBox(height: AppTheme.spacingMD),
                          _buildDetailRow(
                            Icons.calendar_today_rounded,
                            'Date',
                            DateFormat('dd MMMM yyyy', 'fr_FR').format(session.heureDebut),
                          ),
                          const SizedBox(height: AppTheme.spacingSM),
                          _buildDetailRow(
                            Icons.access_time_rounded,
                            'Début',
                            DateFormat('HH:mm').format(session.heureDebut),
                          ),
                          if (session.heureFin != null) ...[
                            const SizedBox(height: AppTheme.spacingSM),
                            _buildDetailRow(
                              Icons.stop_circle_rounded,
                              'Fin',
                              DateFormat('HH:mm').format(session.heureFin!),
                            ),
                          ],
                          const SizedBox(height: AppTheme.spacingSM),
                          _buildDetailRow(
                            Icons.check_circle_rounded,
                            'Statut',
                            session.synchronise
                                ? 'Synchronisé'
                                : 'En attente',
                            valueColor: session.synchronise
                                ? AppColors.success
                                : AppColors.warning,
                          ),
                        ],
                      ),
                    ),
                    
                    const SizedBox(height: AppTheme.spacingMD),
                    
                    // Coordonnées
                    ModernCard(
                      padding: const EdgeInsets.all(AppTheme.spacingMD),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Coordonnées',
                            style: AppTheme.titleMedium,
                          ),
                          const SizedBox(height: AppTheme.spacingMD),
                          _buildDetailRow(
                            Icons.play_arrow_rounded,
                            'Départ',
                            '${positions.first.latitude.toStringAsFixed(6)}, ${positions.first.longitude.toStringAsFixed(6)}',
                          ),
                          if (positions.length > 1) ...[
                            const SizedBox(height: AppTheme.spacingSM),
                            _buildDetailRow(
                              Icons.flag_rounded,
                              'Arrivée',
                              '${positions.last.latitude.toStringAsFixed(6)}, ${positions.last.longitude.toStringAsFixed(6)}',
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStatCard({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(AppTheme.spacingMD),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(AppTheme.radiusMD),
        border: Border.all(
          color: color.withOpacity(0.2),
          width: 1,
        ),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(height: AppTheme.spacingSM),
          Text(
            value,
            style: AppTheme.titleLarge.copyWith(
              color: color,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppTheme.spacingXS),
          Text(
            label,
            style: AppTheme.labelSmall.copyWith(
              color: Colors.grey[600],
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(
    IconData icon,
    String label,
    String value, {
    Color? valueColor,
  }) {
    return Row(
      children: [
        Icon(icon, size: 20, color: Colors.grey[600]),
        const SizedBox(width: AppTheme.spacingSM),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: AppTheme.labelSmall,
              ),
              const SizedBox(height: AppTheme.spacingXS),
              Text(
                value,
                style: AppTheme.bodyMedium.copyWith(
                  fontWeight: FontWeight.w600,
                  color: valueColor,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  void _showLegendDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppTheme.radiusXL),
          ),
          child: Container(
            padding: const EdgeInsets.all(AppTheme.spacingLG),
            constraints: const BoxConstraints(maxWidth: 400),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(AppTheme.spacingSM),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(AppTheme.radiusMD),
                      ),
                      child: const Icon(
                        Icons.info_rounded,
                        color: AppColors.primary,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: AppTheme.spacingMD),
                    Expanded(
                      child: Text(
                        'Légende des icônes',
                        style: AppTheme.titleLarge,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded),
                      onPressed: () {
                        HapticFeedback.selectionClick();
                        Navigator.of(context).pop();
                      },
                      color: Colors.grey[600],
                    ),
                  ],
                ),
                const SizedBox(height: AppTheme.spacingLG),
                
                // Explication des marqueurs
                _buildLegendItem(
                  icon: Icons.play_circle_filled_rounded,
                  iconColor: AppColors.vertDemarrer,
                  title: 'Point de départ',
                  description: 'Marqueur vert indiquant le début de la session de travail. Cliquez dessus pour afficher l\'itinéraire complet.',
                ),
                const SizedBox(height: AppTheme.spacingMD),
                _buildLegendItem(
                  icon: Icons.stop_circle_rounded,
                  iconColor: AppColors.rougeArreter,
                  title: 'Point d\'arrivée',
                  description: 'Marqueur rouge indiquant la fin de la session de travail (si la session est terminée). Cliquez dessus pour afficher l\'itinéraire complet.',
                ),
                const SizedBox(height: AppTheme.spacingMD),
                _buildLegendItem(
                  icon: Icons.route_rounded,
                  iconColor: AppColors.primary,
                  title: 'Itinéraire',
                  description: 'Ligne colorée représentant le trajet parcouru par l\'agent. Chaque session a une couleur unique pour faciliter la distinction.',
                ),
                const SizedBox(height: AppTheme.spacingLG),
                
                // Bouton de fermeture
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      HapticFeedback.selectionClick();
                      Navigator.of(context).pop();
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppTheme.spacingLG,
                        vertical: AppTheme.spacingMD,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppTheme.radiusMD),
                      ),
                      elevation: 2,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.check_rounded, size: 20),
                        const SizedBox(width: AppTheme.spacingSM),
                        Text(
                          'Compris',
                          style: AppTheme.labelLarge.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildLegendItem({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String description,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(AppTheme.spacingSM),
          decoration: BoxDecoration(
            color: iconColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(AppTheme.radiusMD),
          ),
          child: Icon(
            icon,
            color: iconColor,
            size: 28,
          ),
        ),
        const SizedBox(width: AppTheme.spacingMD),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: AppTheme.titleMedium.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: AppTheme.spacingXS),
              Text(
                description,
                style: AppTheme.bodySmall.copyWith(
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
