import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../colors/app_colors.dart';
import '../../services/api_service.dart';
import '../../models/session_travail.dart';
import '../../models/utilisateur.dart';

class DashboardManagerScreen extends StatefulWidget {
  const DashboardManagerScreen({super.key});

  @override
  State<DashboardManagerScreen> createState() => _DashboardManagerScreenState();
}

class _DashboardManagerScreenState extends State<DashboardManagerScreen> {
  final ApiService _apiService = ApiService();
  List<SessionTravail> _sessions = [];
  List<Utilisateur> _utilisateurs = [];
  bool _isLoading = true;

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

  int get _nombreSessionsEnCours {
    return _sessions.where((s) => s.estEnCours).length;
  }

  int get _nombreAgentsActifs {
    final agentsAvecSession = _sessions
        .where((s) => s.estEnCours)
        .map((s) => s.idUtilisateur)
        .toSet();
    return agentsAvecSession.length;
  }

  Duration get _dureeTotaleAujourdhui {
    final aujourdhui = DateTime.now();
    final sessionsAujourdhui = _sessions.where((s) =>
        s.heureDebut.year == aujourdhui.year &&
        s.heureDebut.month == aujourdhui.month &&
        s.heureDebut.day == aujourdhui.day &&
        s.heureFin != null);
    
    Duration total = Duration.zero;
    for (var session in sessionsAujourdhui) {
      total += session.duree;
    }
    return total;
  }

  String _formaterDuree(Duration duree) {
    final heures = duree.inHours;
    final minutes = duree.inMinutes.remainder(60);
    if (heures > 0) {
      return '${heures}h ${minutes}min';
    }
    return '${minutes}min';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : RefreshIndicator(
                onRefresh: _chargerDonnees,
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Dashboard Manager',
                        style: TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primaryDark,
                        ),
                      ),
                      const SizedBox(height: 24),
                      
                      // Cartes statistiques
                      Row(
                        children: [
                          Expanded(
                            child: _buildStatCard(
                              'Sessions en cours',
                              '$_nombreSessionsEnCours',
                              Icons.play_circle,
                              AppColors.vertDemarrer,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _buildStatCard(
                              'Agents actifs',
                              '$_nombreAgentsActifs',
                              Icons.people,
                              AppColors.primary,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      _buildStatCard(
                        'Durée totale aujourd\'hui',
                        _formaterDuree(_dureeTotaleAujourdhui),
                        Icons.access_time,
                        AppColors.statutDeplacement,
                        fullWidth: true,
                      ),
                      const SizedBox(height: 32),
                      
                      // Liste des sessions en cours
                      const Text(
                        'Sessions en cours',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primaryDark,
                        ),
                      ),
                      const SizedBox(height: 16),
                      _sessions.where((s) => s.estEnCours).isEmpty
                          ? Padding(
                              padding: const EdgeInsets.all(32.0),
                              child: Center(
                                child: Column(
                                  children: [
                                    Icon(
                                      Icons.inbox,
                                      size: 64,
                                      color: Colors.grey[400],
                                    ),
                                    const SizedBox(height: 16),
                                    Text(
                                      'Aucune session en cours',
                                      style: TextStyle(
                                        fontSize: 16,
                                        color: Colors.grey[600],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            )
                          : ListView.builder(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              itemCount: _sessions.where((s) => s.estEnCours).length,
                              itemBuilder: (context, index) {
                                final session = _sessions.where((s) => s.estEnCours).toList()[index];
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
                                return _buildSessionCard(session, utilisateur);
                              },
                            ),
                    ],
                  ),
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

  Widget _buildSessionCard(SessionTravail session, Utilisateur utilisateur) {
    final duree = DateTime.now().difference(session.heureDebut);
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
              color: AppColors.vertDemarrer.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              Icons.person,
              color: AppColors.vertDemarrer,
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
                  'Démarrée à ${DateFormat('HH:mm').format(session.heureDebut)}',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                _formaterDuree(duree),
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.vertDemarrer,
                ),
              ),
              Container(
                margin: const EdgeInsets.only(top: 4),
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.vertDemarrer.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text(
                  'EN COURS',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: AppColors.vertDemarrer,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
