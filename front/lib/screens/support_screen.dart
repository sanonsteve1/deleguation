import 'package:flutter/material.dart';
import '../colors/app_colors.dart';
import 'centre_aide_screen.dart';
import 'cgu_screen.dart';
import 'politique_confidentialite_screen.dart';

class SupportScreen extends StatefulWidget {
  final String? section; // 'aide', 'confidentialite', 'conditions'

  const SupportScreen({super.key, this.section});

  @override
  State<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends State<SupportScreen> {
  @override
  void initState() {
    super.initState();
  }

  void _ouvrirCentreAide() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const CentreAideScreen(),
      ),
    );
  }

  void _ouvrirPolitiqueConfidentialite() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const PolitiqueConfidentialiteScreen(),
      ),
    );
  }

  void _ouvrirConditionsUtilisation() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const CGUScreen(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Support'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Section Centre d'aide
            _buildSupportCard(
              icon: Icons.help_outline,
              iconColor: Colors.green,
              title: 'Centre d\'aide',
              description: 'Consultez notre base de connaissances pour trouver des réponses à vos questions',
              onTap: _ouvrirCentreAide,
            ),
            const SizedBox(height: 16),
            
            // Section Politique de confidentialité
            _buildSupportCard(
              icon: Icons.shield_outlined,
              iconColor: Colors.blue,
              title: 'Politique de confidentialité',
              description: 'Découvrez comment nous protégeons et utilisons vos données personnelles',
              onTap: _ouvrirPolitiqueConfidentialite,
            ),
            const SizedBox(height: 16),
            
            // Section Conditions d'utilisation
            _buildSupportCard(
              icon: Icons.description_outlined,
              iconColor: Colors.orange,
              title: 'Conditions d\'utilisation',
              description: 'Consultez les termes et conditions d\'utilisation de l\'application',
              onTap: _ouvrirConditionsUtilisation,
            ),
            const SizedBox(height: 32),
            
            // Section Contact
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.1),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.email_outlined,
                          color: AppColors.primary,
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: 16),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Besoin d\'aide supplémentaire ?',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Colors.black87,
                              ),
                            ),
                            SizedBox(height: 4),
                            Text(
                              'Contactez notre équipe support',
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.grey,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: () {
                      // TODO: Ouvrir l'application email ou formulaire de contact
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Fonctionnalité de contact à venir'),
                        ),
                      );
                    },
                    icon: const Icon(Icons.email),
                    label: const Text('Nous contacter'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 24),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSupportCard({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String description,
    required VoidCallback onTap,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Row(
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: iconColor,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  icon,
                  color: Colors.white,
                  size: 28,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      description,
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
              Icon(
                Icons.chevron_right,
                color: Colors.grey[400],
                size: 28,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
