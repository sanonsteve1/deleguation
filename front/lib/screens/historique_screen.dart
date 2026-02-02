import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../colors/app_colors.dart';
import '../theme/app_theme.dart';
import '../widgets/modern_card.dart';
import '../models/session_travail.dart';
import '../services/api_service.dart';
import '../services/sync_service.dart';
import 'carte_screen.dart';

class HistoriqueScreen extends StatefulWidget {
  const HistoriqueScreen({super.key});

  @override
  State<HistoriqueScreen> createState() => _HistoriqueScreenState();
}

class _HistoriqueScreenState extends State<HistoriqueScreen> {
  final ApiService _apiService = ApiService();
  final SyncService _syncService = SyncService();
  List<SessionTravail> _sessions = [];
  List<SessionTravail> _sessionsToutes = []; // Toutes les sessions sans filtre
  bool _isLoading = true;
  bool _isSyncing = false;
  DateTime _moisSelectionne = DateTime.now();
  bool _localeInitialized = false;
  
  // Filtres
  bool? _filtreSynchronise; // null = tous, true = synchronisé, false = non synchronisé
  Duration? _dureeMinimale; // Durée minimale en secondes

  @override
  void initState() {
    super.initState();
    _initialiserLocale();
    _chargerHistorique();
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
      print('Erreur lors de l\'initialisation de la locale: $e');
      if (mounted) {
        setState(() {
          _localeInitialized = true;
        });
      }
    }
  }

  Future<void> _chargerHistorique() async {
    setState(() => _isLoading = true);
    try {
      List<SessionTravail> sessions = await _apiService.getHistoriqueSessions();
      
      // Vérifier le vrai statut de synchronisation en vérifiant les sessions en attente
      sessions = await _verifierStatutSynchronisation(sessions);
      
      setState(() {
        _sessionsToutes = sessions;
      });
      
      _appliquerFiltres();
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur: $e')),
        );
      }
    }
  }
  
  /// Vérifie le vrai statut de synchronisation en comparant avec les sessions en attente
  Future<List<SessionTravail>> _verifierStatutSynchronisation(List<SessionTravail> sessions) async {
    final prefs = await SharedPreferences.getInstance();
    final sessionsPendingJson = prefs.getStringList('sessions_pending') ?? [];
    
    // Extraire les IDs et les dates/heures des sessions en attente pour une comparaison plus précise
    final Set<int?> idsPending = {};
    final Map<String, bool> sessionsPendingParDate = {}; // Clé: "heureDebut_latitude_longitude"
    
    for (var sessionJson in sessionsPendingJson) {
      try {
        final sessionPending = SessionTravail.fromJson(jsonDecode(sessionJson));
        if (sessionPending.id != null) {
          idsPending.add(sessionPending.id);
        }
        // Aussi vérifier par date/heure et coordonnées pour les sessions sans ID
        final key = '${sessionPending.heureDebut.toIso8601String()}_${sessionPending.latitudeDebut}_${sessionPending.longitudeDebut}';
        sessionsPendingParDate[key] = true;
      } catch (e) {
        print('Erreur lors du parsing de session pending: $e');
      }
    }
    
    // Mettre à jour le statut de synchronisation des sessions
    return sessions.map((session) {
      // Vérifier si la session est en attente par ID
      bool estEnAttenteParId = session.id != null && idsPending.contains(session.id);
      
      // Vérifier aussi par date/heure et coordonnées pour les sessions sans ID
      if (!estEnAttenteParId && session.id == null) {
        final key = '${session.heureDebut.toIso8601String()}_${session.latitudeDebut}_${session.longitudeDebut}';
        estEnAttenteParId = sessionsPendingParDate[key] ?? false;
      }
      
      // Une session est en attente si elle est dans sessions_pending
      // Si elle n'est pas dans sessions_pending, on fait confiance au statut du serveur
      final estEnAttente = estEnAttenteParId;
      
      // Le statut final : synchronisé seulement si pas en attente ET synchronisé côté serveur
      final synchroniseFinal = !estEnAttente && session.synchronise;
      
      return SessionTravail(
        id: session.id,
        idUtilisateur: session.idUtilisateur,
        heureDebut: session.heureDebut,
        heureFin: session.heureFin,
        latitudeDebut: session.latitudeDebut,
        longitudeDebut: session.longitudeDebut,
        latitudeFin: session.latitudeFin,
        longitudeFin: session.longitudeFin,
        synchronise: synchroniseFinal,
      );
    }).toList();
  }
  
  void _appliquerFiltres() {
    List<SessionTravail> sessionsFiltrees = List.from(_sessionsToutes);
    
    // Filtrer par mois sélectionné
    sessionsFiltrees = sessionsFiltrees.where((session) {
      final dateSession = session.heureDebut;
      return dateSession.year == _moisSelectionne.year &&
             dateSession.month == _moisSelectionne.month;
    }).toList();
    
    // Filtrer par statut de synchronisation
    if (_filtreSynchronise != null) {
      sessionsFiltrees = sessionsFiltrees.where((session) {
        return session.synchronise == _filtreSynchronise;
      }).toList();
    }
    
    // Filtrer par durée minimale
    if (_dureeMinimale != null) {
      sessionsFiltrees = sessionsFiltrees.where((session) {
        return session.duree >= _dureeMinimale!;
      }).toList();
    }
    
    // Trier par date décroissante
    sessionsFiltrees.sort((a, b) => b.heureDebut.compareTo(a.heureDebut));
    
    setState(() {
      _sessions = sessionsFiltrees;
      _isLoading = false;
    });
  }
  
  /// Synchronise manuellement toutes les données en attente
  Future<void> _synchroniserManuellement() async {
    if (_isSyncing) return;
    
    setState(() {
      _isSyncing = true;
    });

    try {
      await _syncService.synchroniser();
      
      // Recharger l'historique après synchronisation pour mettre à jour les statuts
      await _chargerHistorique();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Synchronisation terminée avec succès'),
            backgroundColor: AppColors.success,
            duration: Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur lors de la synchronisation: $e'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSyncing = false;
        });
      }
    }
  }
  
  void _ouvrirFiltres() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Handle bar
              Container(
                margin: const EdgeInsets.only(top: 12, bottom: 8),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              
              Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Filtrer',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryDark,
                      ),
                    ),
                    const SizedBox(height: 24),
                    
                    // Filtre synchronisation
                    const Text(
                      'Synchronisation',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Colors.black87,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        ChoiceChip(
                          label: const Text('Tous'),
                          selected: _filtreSynchronise == null,
                          onSelected: (selected) {
                            setModalState(() {
                              setState(() {
                                _filtreSynchronise = null;
                              });
                            });
                          },
                          selectedColor: AppColors.primary.withOpacity(0.2),
                          checkmarkColor: AppColors.primary,
                          labelStyle: TextStyle(
                            fontSize: 13,
                            color: _filtreSynchronise == null 
                                ? AppColors.primary 
                                : Colors.grey[700],
                            fontWeight: _filtreSynchronise == null 
                                ? FontWeight.bold 
                                : FontWeight.normal,
                          ),
                        ),
                        ChoiceChip(
                          label: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.check_circle,
                                size: 14,
                                color: _filtreSynchronise == true 
                                    ? AppColors.success 
                                    : Colors.grey[600],
                              ),
                              const SizedBox(width: 4),
                              const Text('Synchronisé'),
                            ],
                          ),
                          selected: _filtreSynchronise == true,
                          onSelected: (selected) {
                            setModalState(() {
                              setState(() {
                                _filtreSynchronise = selected ? true : null;
                              });
                            });
                          },
                          selectedColor: AppColors.success.withOpacity(0.2),
                          checkmarkColor: AppColors.success,
                          labelStyle: TextStyle(
                            fontSize: 13,
                            color: _filtreSynchronise == true 
                                ? AppColors.success 
                                : Colors.grey[700],
                            fontWeight: _filtreSynchronise == true 
                                ? FontWeight.bold 
                                : FontWeight.normal,
                          ),
                        ),
                        ChoiceChip(
                          label: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.cloud_upload,
                                size: 14,
                                color: _filtreSynchronise == false 
                                    ? AppColors.warning 
                                    : Colors.grey[600],
                              ),
                              const SizedBox(width: 4),
                              const Text('En attente'),
                            ],
                          ),
                          selected: _filtreSynchronise == false,
                          onSelected: (selected) {
                            setModalState(() {
                              setState(() {
                                _filtreSynchronise = selected ? false : null;
                              });
                            });
                          },
                          selectedColor: AppColors.warning.withOpacity(0.2),
                          checkmarkColor: AppColors.warning,
                          labelStyle: TextStyle(
                            fontSize: 13,
                            color: _filtreSynchronise == false 
                                ? AppColors.warning 
                                : Colors.grey[700],
                            fontWeight: _filtreSynchronise == false 
                                ? FontWeight.bold 
                                : FontWeight.normal,
                          ),
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 24),
                    
                    // Filtre durée minimale
                    const Text(
                      'Durée minimale',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Colors.black87,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        ChoiceChip(
                          label: const Text('Toutes'),
                          selected: _dureeMinimale == null,
                          onSelected: (selected) {
                            setModalState(() {
                              setState(() {
                                _dureeMinimale = null;
                              });
                            });
                          },
                          selectedColor: AppColors.primary.withOpacity(0.2),
                          checkmarkColor: AppColors.primary,
                          labelStyle: TextStyle(
                            fontSize: 13,
                            color: _dureeMinimale == null 
                                ? AppColors.primary 
                                : Colors.grey[700],
                            fontWeight: _dureeMinimale == null 
                                ? FontWeight.bold 
                                : FontWeight.normal,
                          ),
                        ),
                        ChoiceChip(
                          label: const Text('> 1 min'),
                          selected: _dureeMinimale == const Duration(minutes: 1),
                          onSelected: (selected) {
                            setModalState(() {
                              setState(() {
                                _dureeMinimale = selected ? const Duration(minutes: 1) : null;
                              });
                            });
                          },
                          selectedColor: AppColors.primary.withOpacity(0.2),
                          checkmarkColor: AppColors.primary,
                          labelStyle: TextStyle(
                            fontSize: 13,
                            color: _dureeMinimale == const Duration(minutes: 1)
                                ? AppColors.primary 
                                : Colors.grey[700],
                            fontWeight: _dureeMinimale == const Duration(minutes: 1)
                                ? FontWeight.bold 
                                : FontWeight.normal,
                          ),
                        ),
                        ChoiceChip(
                          label: const Text('> 5 min'),
                          selected: _dureeMinimale == const Duration(minutes: 5),
                          onSelected: (selected) {
                            setModalState(() {
                              setState(() {
                                _dureeMinimale = selected ? const Duration(minutes: 5) : null;
                              });
                            });
                          },
                          selectedColor: AppColors.primary.withOpacity(0.2),
                          checkmarkColor: AppColors.primary,
                          labelStyle: TextStyle(
                            fontSize: 13,
                            color: _dureeMinimale == const Duration(minutes: 5)
                                ? AppColors.primary 
                                : Colors.grey[700],
                            fontWeight: _dureeMinimale == const Duration(minutes: 5)
                                ? FontWeight.bold 
                                : FontWeight.normal,
                          ),
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 32),
                    
                    // Boutons
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () {
                              setState(() {
                                _filtreSynchronise = null;
                                _dureeMinimale = null;
                              });
                              _appliquerFiltres();
                              Navigator.pop(context);
                            },
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              side: BorderSide(color: Colors.grey[300]!),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
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
                        const SizedBox(width: 12),
                        Expanded(
                          flex: 2,
                          child: ElevatedButton(
                            onPressed: () {
                              _appliquerFiltres();
                              Navigator.pop(context);
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
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
                    
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formaterDuree(Duration duree) {
    final heures = duree.inHours;
    final minutes = duree.inMinutes.remainder(60);
    final secondes = duree.inSeconds.remainder(60);
    
    if (heures > 0) {
      return '${heures}h ${minutes}min ${secondes}s';
    } else if (minutes > 0) {
      return '${minutes}min ${secondes}s';
    } else {
      return '${secondes}s';
    }
  }

  String _formaterDateCarte(DateTime date) {
    final aujourdhui = DateTime.now();
    final hier = aujourdhui.subtract(const Duration(days: 1));
    
    if (date.year == aujourdhui.year && 
        date.month == aujourdhui.month && 
        date.day == aujourdhui.day) {
      return 'Aujourd\'hui, ${date.day} ${_getNomMois(date.month)}';
    } else if (date.year == hier.year && 
               date.month == hier.month && 
               date.day == hier.day) {
      return 'Hier, ${date.day} ${_getNomMois(date.month)}';
    } else {
      if (!_localeInitialized) {
        final jourSemaine = _getNomJour(date.weekday);
        return '$jourSemaine, ${date.day} ${_getNomMois(date.month)}';
      }
      
      try {
        final DateFormat formatter = DateFormat('EEEE, d MMMM', 'fr_FR');
        final String dateStr = formatter.format(date);
        // Capitaliser la première lettre
        return dateStr[0].toUpperCase() + dateStr.substring(1);
      } catch (e) {
        final jourSemaine = _getNomJour(date.weekday);
        return '$jourSemaine, ${date.day} ${_getNomMois(date.month)}';
      }
    }
  }

  String _getNomJour(int weekday) {
    const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    return jours[weekday - 1];
  }

  String _getNomMois(int mois) {
    const moisNoms = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return moisNoms[mois - 1];
  }

  String _formaterMoisAnnee(DateTime date) {
    if (!_localeInitialized) {
      return '${_getNomMois(date.month)} ${date.year}';
    }
    
    try {
      final DateFormat formatter = DateFormat('MMMM yyyy', 'fr_FR');
      final String moisStr = formatter.format(date);
      return moisStr[0].toUpperCase() + moisStr.substring(1);
    } catch (e) {
      return '${_getNomMois(date.month)} ${date.year}';
    }
  }

  Future<void> _selectionnerMois() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _moisSelectionne,
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
      helpText: 'Sélectionner un mois',
      initialDatePickerMode: DatePickerMode.year,
      locale: const Locale('fr', 'FR'),
    );
    
    if (picked != null) {
      setState(() {
        _moisSelectionne = DateTime(picked.year, picked.month);
      });
      _appliquerFiltres();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      body: SafeArea(
        child: Column(
          children: [
            // Header avec titre et boutons
            Padding(
              padding: const EdgeInsets.fromLTRB(
                AppTheme.spacingLG,
                AppTheme.spacingMD,
                AppTheme.spacingLG,
                AppTheme.spacingMD,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Historique',
                    style: AppTheme.headline2,
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Bouton de synchronisation
                      Material(
                        color: Colors.transparent,
                        child: InkWell(
                          onTap: _isSyncing ? null : _synchroniserManuellement,
                          borderRadius: BorderRadius.circular(AppTheme.radiusMD),
                          child: Container(
                            padding: const EdgeInsets.all(8),
                            child: _isSyncing
                                ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                                    ),
                                  )
                                : const Icon(
                                    Icons.sync_rounded,
                                    size: 22,
                                    color: AppColors.primary,
                                  ),
                          ),
                        ),
                      ),
                      const SizedBox(width: AppTheme.spacingXS),
                      // Bouton FILTRER
                      TextButton.icon(
                        onPressed: () {
                          HapticFeedback.selectionClick();
                          _ouvrirFiltres();
                        },
                        icon: const Icon(Icons.filter_list_rounded, size: 18),
                        label: const Text(
                          'FILTRER',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.5,
                          ),
                        ),
                        style: TextButton.styleFrom(
                          foregroundColor: AppColors.primary,
                          padding: const EdgeInsets.symmetric(
                            horizontal: AppTheme.spacingSM,
                            vertical: AppTheme.spacingXS,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            
            // Sélecteur de mois
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppTheme.spacingLG),
              child: ModernCard(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppTheme.spacingMD,
                  vertical: AppTheme.spacingSM,
                ),
                onTap: () {
                  HapticFeedback.selectionClick();
                  _selectionnerMois();
                },
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.calendar_today_rounded,
                      size: 18,
                      color: Colors.grey[700],
                    ),
                    const SizedBox(width: AppTheme.spacingSM),
                    Text(
                      _formaterMoisAnnee(_moisSelectionne),
                      style: AppTheme.bodyLarge.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(width: AppTheme.spacingSM),
                    Icon(
                      Icons.arrow_drop_down_rounded,
                      color: Colors.grey[600],
                    ),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: AppTheme.spacingMD),
            
            // Liste des sessions
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : _sessions.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.history_rounded,
                                size: 64,
                                color: Colors.grey[400],
                              ),
                              const SizedBox(height: AppTheme.spacingMD),
                              Text(
                                'Aucune session enregistrée',
                                style: AppTheme.titleMedium.copyWith(
                                  color: const Color(0xFF8E8E93),
                                ),
                              ),
                            ],
                          ),
                        )
                      : RefreshIndicator(
                          onRefresh: _chargerHistorique,
                          color: AppColors.primary,
                          child: ListView.builder(
                            padding: const EdgeInsets.symmetric(
                              horizontal: AppTheme.spacingLG,
                              vertical: AppTheme.spacingSM,
                            ),
                            itemCount: _sessions.length,
                            itemBuilder: (context, index) {
                              final session = _sessions[index];
                              final duree = session.duree;
                              
                              return Padding(
                                padding: const EdgeInsets.only(bottom: AppTheme.spacingMD),
                                child: ModernCard(
                                  padding: const EdgeInsets.all(AppTheme.spacingLG),
                                  onTap: session.id != null 
                                      ? () {
                                          HapticFeedback.selectionClick();
                                          Navigator.push(
                                            context,
                                            MaterialPageRoute(
                                              builder: (context) => CarteScreen(sessionId: session.id),
                                            ),
                                          );
                                        }
                                      : null,
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      // Date
                                      Text(
                                        _formaterDateCarte(session.heureDebut),
                                        style: AppTheme.titleLarge.copyWith(
                                          color: AppColors.primaryDark,
                                        ),
                                      ),
                                      const SizedBox(height: AppTheme.spacingMD),
                                      
                                      // Heures
                                      Row(
                                        children: [
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  'HEURE DE DÉBUT',
                                                  style: AppTheme.labelSmall,
                                                ),
                                                const SizedBox(height: AppTheme.spacingXS),
                                                Row(
                                                  children: [
                                                    Icon(
                                                      Icons.access_time_rounded,
                                                      size: 16,
                                                      color: Colors.grey[600],
                                                    ),
                                                    const SizedBox(width: AppTheme.spacingXS),
                                                    Text(
                                                      DateFormat('HH:mm').format(session.heureDebut),
                                                      style: AppTheme.bodyMedium.copyWith(
                                                        fontWeight: FontWeight.bold,
                                                        color: AppColors.primaryDark,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ],
                                            ),
                                          ),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  'HEURE D\'ARRÊT',
                                                  style: AppTheme.labelSmall,
                                                ),
                                                const SizedBox(height: AppTheme.spacingXS),
                                                Row(
                                                  children: [
                                                    Icon(
                                                      Icons.stop_circle_rounded,
                                                      size: 16,
                                                      color: Colors.grey[600],
                                                    ),
                                                    const SizedBox(width: AppTheme.spacingXS),
                                                    Text(
                                                      session.heureFin != null
                                                          ? DateFormat('HH:mm').format(session.heureFin!)
                                                          : 'En cours',
                                                      style: AppTheme.bodyMedium.copyWith(
                                                        fontWeight: FontWeight.bold,
                                                        color: session.heureFin != null
                                                            ? AppColors.primaryDark
                                                            : AppColors.vertDemarrer,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: AppTheme.spacingMD),
                                      
                                      // Durée
                                      Text(
                                        'DURÉE TOTALE',
                                        style: AppTheme.labelSmall,
                                      ),
                                      const SizedBox(height: AppTheme.spacingXS),
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        crossAxisAlignment: CrossAxisAlignment.center,
                                        children: [
                                          Expanded(
                                            child: Text(
                                              _formaterDuree(duree),
                                              style: TextStyle(
                                                fontSize: 32,
                                                fontWeight: FontWeight.bold,
                                                color: AppColors.primaryDark,
                                                letterSpacing: -0.5,
                                              ),
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                          const SizedBox(width: AppTheme.spacingSM),
                                          // Statut synchronisation
                                          Container(
                                            padding: const EdgeInsets.symmetric(
                                              horizontal: AppTheme.spacingSM,
                                              vertical: AppTheme.spacingXS,
                                            ),
                                            decoration: BoxDecoration(
                                              color: session.synchronise
                                                  ? AppColors.success.withOpacity(0.1)
                                                  : Colors.grey[200],
                                              borderRadius: BorderRadius.circular(AppTheme.radiusSM),
                                            ),
                                            child: Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Icon(
                                                  session.synchronise
                                                      ? Icons.check_circle_rounded
                                                      : Icons.cloud_upload_rounded,
                                                  size: 16,
                                                  color: session.synchronise
                                                      ? AppColors.success
                                                      : Colors.grey[600],
                                                ),
                                                const SizedBox(width: AppTheme.spacingXS),
                                                Text(
                                                  'Synchronisé',
                                                  style: AppTheme.labelSmall.copyWith(
                                                    color: session.synchronise
                                                        ? AppColors.success
                                                        : Colors.grey[600],
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                          if (session.id != null) ...[
                                            const SizedBox(width: AppTheme.spacingSM),
                                            Container(
                                              padding: const EdgeInsets.all(6),
                                              decoration: BoxDecoration(
                                                color: AppColors.primary.withOpacity(0.1),
                                                borderRadius: BorderRadius.circular(AppTheme.radiusSM),
                                              ),
                                              child: Icon(
                                                Icons.map_rounded,
                                                size: 18,
                                                color: AppColors.primary,
                                              ),
                                            ),
                                          ],
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
            ),
          ],
        ),
      ),
    );
  }
}
