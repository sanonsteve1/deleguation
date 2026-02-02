import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:geolocator/geolocator.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'dart:async';
import 'dart:math' as math;
import '../colors/app_colors.dart';
import '../theme/app_theme.dart';
import '../widgets/modern_card.dart';
import '../services/session_service.dart';
import '../services/location_service.dart';
import '../services/api_service.dart';
import '../models/position_gps.dart';

class CarteScreen extends StatefulWidget {
  final int? sessionId;
  
  const CarteScreen({super.key, this.sessionId});

  @override
  State<CarteScreen> createState() => _CarteScreenState();
}

class _CarteScreenState extends State<CarteScreen> 
    with TickerProviderStateMixin {
  final SessionService _sessionService = SessionService();
  final LocationService _locationService = LocationService();
  final ApiService _apiService = ApiService();
  
  final MapController _mapController = MapController();
  Position? _currentPosition;
  List<PositionGps> _positions = [];
  bool _isLoading = false;
  LatLng? _center;
  bool _isFollowingUser = true;
  StreamSubscription<Position>? _positionStreamSubscription;
  
  // Animation controllers
  late AnimationController _routeAnimationController;
  late AnimationController _markerPulseController;
  late AnimationController _bottomSheetController;
  late Animation<double> _routeAnimation;
  
  double? _currentHeading;
  double _totalDistance = 0.0;
  Duration _totalDuration = Duration.zero;
  double _currentZoom = 16.0; // Stocker le zoom au lieu de le lire depuis camera
  LatLng? _currentMapCenter; // Stocker le centre au lieu de le lire depuis camera

  @override
  void initState() {
    super.initState();
    
    // Animation pour le tracé de l'itinéraire
    _routeAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );
    _routeAnimation = CurvedAnimation(
      parent: _routeAnimationController,
      curve: Curves.easeOutCubic,
    );
    
    // Animation pulsante pour le marqueur
    _markerPulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat(reverse: true);
    
    // Animation pour le bottom sheet
    _bottomSheetController = AnimationController(
      vsync: this,
      duration: AppTheme.animationNormal,
    );
    
    if (widget.sessionId == null) {
      _chargerPositionActuelle();
      _demarrerSuiviTempsReel();
    }
    _chargerPositions();
    
    // Démarrer l'animation de l'itinéraire
    _routeAnimationController.forward();
  }

  @override
  void dispose() {
    _positionStreamSubscription?.cancel();
    _routeAnimationController.dispose();
    _markerPulseController.dispose();
    _bottomSheetController.dispose();
    super.dispose();
  }

  Future<void> _chargerPositionActuelle() async {
    try {
      Position position = await _locationService.getCurrentPosition(
        requestBackground: false,
      );
      setState(() {
        _currentPosition = position;
        _center = LatLng(position.latitude, position.longitude);
        _currentMapCenter = _center;
      });
      if (_isFollowingUser && _center != null) {
        _currentZoom = 16.0;
        _safeMapMove(_center!, 16.0);
      }
    } catch (e) {
      if (mounted) {
        _showErrorSnackBar('Erreur GPS: $e');
      }
    }
  }

  void _demarrerSuiviTempsReel() {
    if (widget.sessionId != null) return;
    
    LocationSettings locationSettings = const LocationSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter: 5,
    );

    _positionStreamSubscription = Geolocator.getPositionStream(
      locationSettings: locationSettings,
    ).listen(
      (Position position) {
        if (mounted) {
          setState(() {
            if (_currentPosition != null) {
              _currentHeading = Geolocator.bearingBetween(
                _currentPosition!.latitude,
                _currentPosition!.longitude,
                position.latitude,
                position.longitude,
              );
            }
            _currentPosition = position;
            final newCenter = LatLng(position.latitude, position.longitude);
            _center = newCenter;
            _currentMapCenter = newCenter;
            
            if (_isFollowingUser) {
              // Utiliser le zoom stocké au lieu de le lire depuis camera
              _safeMapMove(newCenter, _currentZoom);
            }
          });
        }
      },
      onError: (error) {
        print('[CarteScreen] Erreur GPS: $error');
      },
    );
  }

  Future<void> _chargerPositions() async {
    setState(() => _isLoading = true);
    try {
      int? sessionId = widget.sessionId;
      
      if (sessionId == null) {
        final session = _sessionService.sessionEnCours;
        sessionId = session?.id;
      }
      
      if (sessionId != null) {
        final positions = await _apiService.getPositionsParSession(sessionId);
        setState(() {
          _positions = positions;
          
          if (positions.isNotEmpty && _center == null) {
            _center = LatLng(positions.first.latitude, positions.first.longitude);
          }
          
          // Calculer distance et durée totales
          _calculerStatistiques(positions);
        });
      }
    } catch (e) {
      if (mounted) {
        _showErrorSnackBar('Erreur: $e');
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _calculerStatistiques(List<PositionGps> positions) {
    if (positions.length < 2) return;
    
    double totalDistance = 0.0;
    for (int i = 0; i < positions.length - 1; i++) {
      totalDistance += Geolocator.distanceBetween(
        positions[i].latitude,
        positions[i].longitude,
        positions[i + 1].latitude,
        positions[i + 1].longitude,
      );
    }
    
    if (positions.isNotEmpty) {
      final startTime = positions.first.timestamp;
      final endTime = positions.last.timestamp;
      final duration = endTime.difference(startTime);
      
      setState(() {
        _totalDistance = totalDistance;
        _totalDuration = duration;
      });
    }
  }

  List<LatLng> _getPolylinePoints() {
    if (_positions.isEmpty && _currentPosition == null) {
      return [];
    }
    
    List<LatLng> points = [];
    
    if (widget.sessionId == null && _currentPosition != null) {
      points.add(LatLng(_currentPosition!.latitude, _currentPosition!.longitude));
    }
    
    final sortedPositions = List<PositionGps>.from(_positions);
    sortedPositions.sort((a, b) => a.timestamp.compareTo(b.timestamp));
    
    for (var position in sortedPositions) {
      points.add(LatLng(position.latitude, position.longitude));
    }
    
    return points;
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

  // Méthode helper pour déplacer la carte de manière sûre
  void _safeMapMove(LatLng center, double zoom) {
    // Mettre à jour les variables d'état
    _currentMapCenter = center;
    _currentZoom = zoom;
    
    Future.microtask(() {
      if (!mounted) return;
      try {
        _mapController.move(center, zoom);
      } catch (e) {
        // La carte n'est pas encore prête, réessayer après un court délai
        Future.delayed(const Duration(milliseconds: 200), () {
          if (mounted) {
            try {
              _mapController.move(center, zoom);
            } catch (e2) {
              // Ignorer si toujours pas prêt
            }
          }
        });
      }
    });
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: _isLoading && _center == null
          ? const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
              ),
            )
          : _center == null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.location_off_rounded,
                        size: 64,
                        color: Colors.grey[400],
                      ),
                      const SizedBox(height: AppTheme.spacingMD),
                      Text(
                        'Position GPS non disponible',
                        style: AppTheme.titleMedium.copyWith(
                          color: Colors.grey[400],
                        ),
                      ),
                    ],
                  ),
                )
              : Stack(
                  children: [
                    // Carte principale
                    FlutterMap(
                      mapController: _mapController,
                      options: MapOptions(
                        initialCenter: _center!,
                        initialZoom: _currentZoom,
                        minZoom: 5.0,
                        maxZoom: 18.0,
                        interactionOptions: const InteractionOptions(
                          flags: InteractiveFlag.all,
                        ),
                        onMapReady: () {
                          // Mettre à jour le centre stocké quand la carte est prête
                          if (_center != null) {
                            _currentMapCenter = _center;
                          }
                        },
                      ),
                      children: [
                        // Tuiles de carte avec style moderne (CartoDB Positron - style épuré)
                        TileLayer(
                          urlTemplate: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
                          subdomains: const ['a', 'b', 'c', 'd'],
                          userAgentPackageName: 'com.eburtis.fieldtrack',
                          maxZoom: 19,
                        ),
                        
                        // Halo/ombre de l'itinéraire (couche inférieure pour effet de profondeur)
                        if (_getPolylinePoints().length > 1)
                          AnimatedBuilder(
                            animation: _routeAnimation,
                            builder: (context, child) {
                              final animatedPoints = _getAnimatedPolylinePoints();
                              return PolylineLayer(
                                polylines: [
                                  Polyline(
                                    points: animatedPoints,
                                    strokeWidth: 12.0,
                                    color: AppColors.primary.withOpacity(0.15),
                                  ),
                                ],
                              );
                            },
                          ),
                        
                        // Itinéraire principal (tracé épais et contrasté)
                        if (_getPolylinePoints().length > 1)
                          AnimatedBuilder(
                            animation: _routeAnimation,
                            builder: (context, child) {
                              final animatedPoints = _getAnimatedPolylinePoints();
                              return PolylineLayer(
                                polylines: [
                                  Polyline(
                                    points: animatedPoints,
                                    strokeWidth: 8.0,
                                    color: AppColors.primary,
                                    borderStrokeWidth: 2.0,
                                    borderColor: Colors.white,
                                  ),
                                ],
                              );
                            },
                          ),
                        
                        // Marqueur de départ
                        if (_positions.isNotEmpty)
                          MarkerLayer(
                            markers: [
                              Marker(
                                point: LatLng(
                                  _positions.first.latitude,
                                  _positions.first.longitude,
                                ),
                                width: 48,
                                height: 48,
                                child: _buildStartMarker(),
                              ),
                            ],
                          ),
                        
                        // Marqueur d'arrivée
                        if (_positions.isNotEmpty && widget.sessionId != null)
                          MarkerLayer(
                            markers: [
                              Marker(
                                point: LatLng(
                                  _positions.last.latitude,
                                  _positions.last.longitude,
                                ),
                                width: 48,
                                height: 48,
                                child: _buildEndMarker(),
                              ),
                            ],
                          ),
                        
                        // Marqueur de position actuelle (avec animation pulsante)
                        if (_currentPosition != null && widget.sessionId == null)
                          MarkerLayer(
                            markers: [
                              Marker(
                                point: LatLng(
                                  _currentPosition!.latitude,
                                  _currentPosition!.longitude,
                                ),
                                width: 80,
                                height: 80,
                                child: _buildCurrentLocationMarker(),
                              ),
                            ],
                          ),
                      ],
                    ),
                    
                    // Header avec bouton retour
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
                            // Badge de suivi actif
                            if (_isFollowingUser && widget.sessionId == null)
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: AppTheme.spacingMD,
                                  vertical: AppTheme.spacingSM,
                                ),
                                decoration: BoxDecoration(
                                  color: AppColors.success,
                                  borderRadius: BorderRadius.circular(AppTheme.radiusFull),
                                  boxShadow: AppShadows.md,
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      Icons.gps_fixed_rounded,
                                      color: Colors.white,
                                      size: 16,
                                    ),
                                    const SizedBox(width: AppTheme.spacingXS),
                                    Text(
                                      'Suivi actif',
                                      style: AppTheme.labelSmall.copyWith(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                    
                    // Boutons flottants (zoom, recentrage)
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
                                _isFollowingUser = false;
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
                                _isFollowingUser = false;
                                _currentZoom = (_currentZoom - 1).clamp(5.0, 18.0);
                                if (_currentMapCenter != null) {
                                  _safeMapMove(_currentMapCenter!, _currentZoom);
                                }
                              });
                            },
                          ),
                          const SizedBox(height: AppTheme.spacingSM),
                          _buildFloatingButton(
                            icon: Icons.my_location_rounded,
                            isActive: _isFollowingUser,
                            onPressed: () {
                              HapticFeedback.selectionClick();
                              setState(() {
                                _isFollowingUser = !_isFollowingUser;
                                if (_isFollowingUser && _currentPosition != null) {
                                  final newCenter = LatLng(
                                    _currentPosition!.latitude,
                                    _currentPosition!.longitude,
                                  );
                                  _currentZoom = 16.0;
                                  _safeMapMove(newCenter, 16.0);
                                }
                              });
                            },
                          ),
                        ],
                      ),
                    ),
                    
                    // Bottom Sheet avec informations
                    _buildBottomSheet(),
                  ],
                ),
    );
  }

  List<LatLng> _getAnimatedPolylinePoints() {
    final allPoints = _getPolylinePoints();
    if (allPoints.isEmpty) return [];
    
    final animatedLength = (allPoints.length * _routeAnimation.value).round();
    return allPoints.sublist(0, math.min(animatedLength, allPoints.length));
  }

  Widget _buildStartMarker() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.vertDemarrer,
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white, width: 3),
        boxShadow: [
          BoxShadow(
            color: AppColors.vertDemarrer.withOpacity(0.4),
            blurRadius: 12,
            spreadRadius: 2,
          ),
        ],
      ),
      child: const Icon(
        Icons.play_arrow_rounded,
        color: Colors.white,
        size: 24,
      ),
    );
  }

  Widget _buildEndMarker() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.rougeArreter,
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white, width: 3),
        boxShadow: [
          BoxShadow(
            color: AppColors.rougeArreter.withOpacity(0.4),
            blurRadius: 12,
            spreadRadius: 2,
          ),
        ],
      ),
      child: const Icon(
        Icons.flag_rounded,
        color: Colors.white,
        size: 24,
      ),
    );
  }

  Widget _buildCurrentLocationMarker() {
    return AnimatedBuilder(
      animation: _markerPulseController,
      builder: (context, child) {
        return Stack(
          alignment: Alignment.center,
          children: [
            // Cercle pulsant externe
            Container(
              width: 60 + (_markerPulseController.value * 20),
              height: 60 + (_markerPulseController.value * 20),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.primary.withOpacity(
                  0.2 - (_markerPulseController.value * 0.15),
                ),
              ),
            ),
            // Marqueur principal avec orientation
            Transform.rotate(
              angle: _currentHeading != null
                  ? (_currentHeading! * math.pi / 180)
                  : 0,
              child: Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  gradient: AppGradients.primary,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 4),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withOpacity(0.5),
                      blurRadius: 12,
                      spreadRadius: 2,
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.navigation_rounded,
                  color: Colors.white,
                  size: 28,
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildFloatingButton({
    required IconData icon,
    required VoidCallback onPressed,
    bool isActive = false,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: isActive ? AppColors.primary : Colors.white,
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
              color: isActive ? Colors.white : AppColors.primaryDark,
              size: 24,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBottomSheet() {
    return DraggableScrollableSheet(
      initialChildSize: 0.25,
      minChildSize: 0.15,
      maxChildSize: 0.6,
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
                    // Titre
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(AppTheme.spacingSM),
                          decoration: BoxDecoration(
                            gradient: AppGradients.primary,
                            borderRadius: BorderRadius.circular(AppTheme.radiusMD),
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
                                widget.sessionId != null
                                    ? 'Itinéraire enregistré'
                                    : 'Suivi en cours',
                                style: AppTheme.titleLarge,
                              ),
                              if (_currentPosition != null)
                                Text(
                                  'Position actuelle',
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
                            value: _formaterDistance(_totalDistance),
                            color: AppColors.primary,
                          ),
                        ),
                        const SizedBox(width: AppTheme.spacingMD),
                        Expanded(
                          child: _buildStatCard(
                            icon: Icons.access_time_rounded,
                            label: 'Durée',
                            value: _formaterDuree(_totalDuration),
                            color: AppColors.vertDemarrer,
                          ),
                        ),
                        const SizedBox(width: AppTheme.spacingMD),
                        Expanded(
                          child: _buildStatCard(
                            icon: Icons.location_on_rounded,
                            label: 'Points',
                            value: '${_positions.length}',
                            color: AppColors.primaryDark,
                          ),
                        ),
                      ],
                    ),
                    
                    if (_positions.isNotEmpty) ...[
                      const SizedBox(height: AppTheme.spacingXL),
                      
                      // Détails de l'itinéraire
                      ModernCard(
                        padding: const EdgeInsets.all(AppTheme.spacingMD),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Détails',
                              style: AppTheme.titleMedium,
                            ),
                            const SizedBox(height: AppTheme.spacingMD),
                            _buildDetailRow(
                              Icons.play_circle_outline_rounded,
                              'Départ',
                              _positions.isNotEmpty
                                  ? '${_positions.first.latitude.toStringAsFixed(6)}, ${_positions.first.longitude.toStringAsFixed(6)}'
                                  : 'N/A',
                            ),
                            if (_positions.length > 1) ...[
                              const SizedBox(height: AppTheme.spacingSM),
                              _buildDetailRow(
                                Icons.flag_outlined,
                                'Arrivée',
                                '${_positions.last.latitude.toStringAsFixed(6)}, ${_positions.last.longitude.toStringAsFixed(6)}',
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
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

  Widget _buildDetailRow(IconData icon, String label, String value) {
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
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
