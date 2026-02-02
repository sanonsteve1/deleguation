import 'package:flutter/material.dart';
import '../colors/app_colors.dart';
import '../services/api_service.dart';
import '../models/utilisateur.dart';

class InformationsPersonnellesScreen extends StatefulWidget {
  const InformationsPersonnellesScreen({super.key});

  @override
  State<InformationsPersonnellesScreen> createState() => _InformationsPersonnellesScreenState();
}

class _InformationsPersonnellesScreenState extends State<InformationsPersonnellesScreen> {
  final ApiService _apiService = ApiService();
  
  Utilisateur? _utilisateur;
  bool _isLoading = true;
  
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
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur lors du chargement: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Informations personnelles'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _utilisateur == null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, size: 64, color: AppColors.error),
                      const SizedBox(height: 16),
                      const Text('Impossible de charger les informations'),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _chargerUtilisateur,
                        child: const Text('Réessayer'),
                      ),
                    ],
                  ),
                )
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Champ Nom
                      _buildReadOnlyField(
                        label: 'Nom',
                        value: _utilisateur!.nom,
                        icon: Icons.person_outline,
                      ),
                      const SizedBox(height: 16),
                      
                      // Champ Prénoms
                      _buildReadOnlyField(
                        label: 'Prénoms',
                        value: _utilisateur!.prenoms,
                        icon: Icons.person_outline,
                      ),
                      const SizedBox(height: 16),
                        
                      // Champ Username
                      _buildReadOnlyField(
                        label: 'Nom d\'utilisateur',
                        value: _utilisateur!.username,
                        icon: Icons.alternate_email,
                      ),
                      const SizedBox(height: 16),
                      
                      // Champ Téléphone
                      _buildReadOnlyField(
                        label: 'Téléphone',
                        value: _utilisateur!.telephone ?? 'Non renseigné',
                        icon: Icons.phone_outlined,
                      ),
                      const SizedBox(height: 16),
                      
                      // Champ Rôle (non éditable)
                      _buildReadOnlyField(
                        label: 'Rôle',
                        value: _utilisateur!.role,
                        icon: Icons.work_outline,
                      ),
                    ],
                  ),
                ),
    );
  }


  Widget _buildReadOnlyField({
    required String label,
    required String value,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[300]!),
      ),
      child: Row(
        children: [
          Icon(icon, color: Colors.grey[600]),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: Colors.black87,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
