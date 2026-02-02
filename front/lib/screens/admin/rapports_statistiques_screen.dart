import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../colors/app_colors.dart';
import '../../services/api_service.dart';
import '../../models/session_travail.dart';
import '../../models/utilisateur.dart';

class RapportsStatistiquesScreen extends StatefulWidget {
  const RapportsStatistiquesScreen({super.key});

  @override
  State<RapportsStatistiquesScreen> createState() => _RapportsStatistiquesScreenState();
}

class _RapportsStatistiquesScreenState extends State<RapportsStatistiquesScreen> {
  final ApiService _apiService = ApiService();
  List<SessionTravail> _sessions = [];
  List<Utilisateur> _utilisateurs = [];
  bool _isLoading = true;
  DateTime _dateDebut = DateTime.now().subtract(const Duration(days: 7));
  DateTime _dateFin = DateTime.now();

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
      
      setState(() {
        _sessions = sessions;
        _utilisateurs = utilisateurs;
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

  List<SessionTravail> get _sessionsFiltrees {
    return _sessions.where((s) {
      final dateSession = s.heureDebut;
      return dateSession.isAfter(_dateDebut.subtract(const Duration(days: 1))) &&
             dateSession.isBefore(_dateFin.add(const Duration(days: 1)));
    }).toList();
  }

  int get _nombreTotalSessions => _sessionsFiltrees.length;

  Duration get _dureeTotale {
    Duration total = Duration.zero;
    for (var session in _sessionsFiltrees) {
      if (session.heureFin != null) {
        total += session.duree;
      }
    }
    return total;
  }

  double get _distanceTotale {
    // Approximation basée sur les positions GPS (simplifié)
    double total = 0.0;
    for (var session in _sessionsFiltrees) {
      if (session.latitudeFin != null && session.longitudeFin != null) {
        final latDiff = session.latitudeFin! - session.latitudeDebut;
        final lonDiff = session.longitudeFin! - session.longitudeDebut;
        total += (latDiff * latDiff + lonDiff * lonDiff).abs() * 111; // Approximation en km
      }
    }
    return total;
  }

  Map<Utilisateur, int> get _sessionsParUtilisateur {
    Map<Utilisateur, int> map = {};
    for (var session in _sessionsFiltrees) {
      final utilisateur = _utilisateurs.firstWhere(
        (u) => u.id == session.idUtilisateur,
        orElse: () => Utilisateur(
          id: session.idUtilisateur ?? 0,
          username: 'Inconnu',
          nom: '',
          prenoms: '',
          role: 'AGENT',
        ),
      );
      map[utilisateur] = (map[utilisateur] ?? 0) + 1;
    }
    return map;
  }

  String _formaterDuree(Duration duree) {
    final heures = duree.inHours;
    final minutes = duree.inMinutes.remainder(60);
    if (heures > 0) {
      return '${heures}h ${minutes}min';
    }
    return '${minutes}min';
  }

  Future<void> _selectionnerDateDebut() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _dateDebut,
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
      locale: const Locale('fr', 'FR'),
    );
    if (picked != null) {
      setState(() {
        _dateDebut = picked;
      });
    }
  }

  Future<void> _selectionnerDateFin() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _dateFin,
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
      locale: const Locale('fr', 'FR'),
    );
    if (picked != null) {
      setState(() {
        _dateFin = picked;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          'Rapports et Statistiques',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: AppColors.primary,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _chargerDonnees,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _chargerDonnees,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Sélecteurs de dates
                    Row(
                      children: [
                        Expanded(
                          child: InkWell(
                            onTap: _selectionnerDateDebut,
                            child: Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                border: Border.all(color: Colors.grey[300]!),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Date début',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.grey[600],
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    DateFormat('dd/MM/yyyy').format(_dateDebut),
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: InkWell(
                            onTap: _selectionnerDateFin,
                            child: Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                border: Border.all(color: Colors.grey[300]!),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Date fin',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.grey[600],
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    DateFormat('dd/MM/yyyy').format(_dateFin),
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    
                    // Statistiques globales
                    const Text(
                      'Statistiques Globales',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryDark,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: _buildStatCard(
                            'Sessions',
                            '$_nombreTotalSessions',
                            Icons.list_alt,
                            AppColors.primary,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildStatCard(
                            'Durée totale',
                            _formaterDuree(_dureeTotale),
                            Icons.access_time,
                            AppColors.vertDemarrer,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    _buildStatCard(
                      'Distance totale',
                      '${_distanceTotale.toStringAsFixed(1)} km',
                      Icons.route,
                      AppColors.statutDeplacement,
                      fullWidth: true,
                    ),
                    const SizedBox(height: 32),
                    
                    // Statistiques par agent
                    const Text(
                      'Statistiques par Agent',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryDark,
                      ),
                    ),
                    const SizedBox(height: 16),
                    ..._sessionsParUtilisateur.entries.map((entry) {
                      final utilisateur = entry.key;
                      final nombreSessions = entry.value;
                      final sessionsAgent = _sessionsFiltrees
                          .where((s) => s.idUtilisateur == utilisateur.id)
                          .toList();
                      Duration dureeAgent = Duration.zero;
                      for (var session in sessionsAgent) {
                        if (session.heureFin != null) {
                          dureeAgent += session.duree;
                        }
                      }
                      
                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.grey[200]!),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.03),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 48,
                              height: 48,
                              decoration: BoxDecoration(
                                color: AppColors.primary.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Icon(
                                Icons.person,
                                color: AppColors.primary,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    utilisateur.nomComplet,
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.primaryDark,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '$nombreSessions sessions • ${_formaterDuree(dureeAgent)}',
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: Colors.grey[600],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    }),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color, {bool fullWidth = false}) {
    return Container(
      width: fullWidth ? double.infinity : null,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[200]!),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color, size: 24),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            title,
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[600],
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppColors.primaryDark,
            ),
          ),
        ],
      ),
    );
  }
}
