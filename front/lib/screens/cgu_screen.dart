import 'package:flutter/material.dart';
import '../colors/app_colors.dart';

class CGUScreen extends StatelessWidget {
  const CGUScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Conditions Générales d\'Utilisation'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // En-tête
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.description_outlined, color: AppColors.primary, size: 32),
                      const SizedBox(width: 16),
                      const Expanded(
                        child: Text(
                          'Conditions Générales d\'Utilisation',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Date de la dernière mise à jour : 19 Janvier 2026',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            
            // Section 1
            _buildSection(
              title: '1. Objet de l\'Application',
              content: 'L\'Application a pour objet de permettre à l\'Agent d\'enregistrer ses heures de début et de fin de service (pointage) et de transmettre des données de géolocalisation à son employeur pendant la durée de son service, conformément aux exigences du contrat de travail et aux lois en vigueur.',
            ),
            
            // Section 2
            _buildSection(
              title: '2. Accès et Utilisation',
              children: [
                _buildSubSection(
                  title: '2.1. Compte Utilisateur',
                  content: 'L\'accès à l\'Application est réservé aux Agents de l\'entreprise ayant reçu un identifiant et un mot de passe. L\'Agent est responsable de la confidentialité de ses identifiants.',
                ),
                const SizedBox(height: 16),
                _buildSubSection(
                  title: '2.2. Obligations de l\'Agent',
                  content: 'L\'Agent s\'engage à :\n• Utiliser l\'Application conformément à sa destination professionnelle.\n• Activer les services de localisation (GPS) de son appareil mobile pendant les heures de service pour permettre le suivi d\'itinéraire.\n• Effectuer le pointage de début et de fin de service de manière honnête et précise.\n• Ne pas tenter de contourner, falsifier ou manipuler les données de géolocalisation ou d\'horodatage.',
                ),
                const SizedBox(height: 16),
                _buildSubSection(
                  title: '2.3. Durée d\'Utilisation',
                  content: 'L\'utilisation de l\'Application est limitée à la durée du contrat de travail de l\'Agent avec l\'entreprise.',
                ),
              ],
            ),
            
            // Section 3
            _buildSection(
              title: '3. Géolocalisation et Consentement',
              children: [
                _buildSubSection(
                  title: '3.1. Principe',
                  content: 'L\'Agent est informé et consent à ce que l\'Application collecte et transmette ses données de géolocalisation uniquement entre le moment où il active le suivi via le bouton "DÉMARRER MA JOURNÉE" et le moment où il le désactive via le bouton "ARRÊTER LA JOURNÉE".',
                ),
                const SizedBox(height: 16),
                _buildSubSection(
                  title: '3.2. Absence de Suivi Personnel',
                  content: 'L\'employeur s\'engage à ne pas utiliser les données de géolocalisation à des fins de surveillance personnelle ou en dehors des heures de service. Toute tentative de suivi en dehors des heures de travail est strictement interdite.',
                ),
              ],
            ),
            
            // Section 4
            _buildSection(
              title: '4. Propriété Intellectuelle',
              content: 'L\'Application, y compris son code source, son design, ses bases de données et son contenu, est la propriété exclusive de l\'entreprise développeuse ou utilisatrice. L\'Agent ne dispose d\'aucun droit de propriété sur l\'Application.',
            ),
            
            // Section 5
            _buildSection(
              title: '5. Responsabilité',
              children: [
                _buildSubSection(
                  title: '5.1. Responsabilité de l\'Agent',
                  content: 'L\'Agent est seul responsable de l\'utilisation de l\'Application sur son appareil mobile. L\'entreprise ne saurait être tenue responsable des dommages causés à l\'appareil mobile de l\'Agent résultant de l\'utilisation de l\'Application.',
                ),
                const SizedBox(height: 16),
                _buildSubSection(
                  title: '5.2. Responsabilité de l\'Entreprise',
                  content: 'L\'entreprise s\'engage à fournir un service fonctionnel et sécurisé. Toutefois, elle ne peut garantir une disponibilité ininterrompue et ne saurait être tenue responsable des pertes de données dues à des pannes de réseau ou des problèmes techniques inhérents aux appareils mobiles.',
                ),
              ],
            ),
            
            // Section 6
            _buildSection(
              title: '6. Modifications des CGU',
              content: 'L\'entreprise se réserve le droit de modifier les présentes CGU à tout moment. L\'Agent sera informé de toute modification par notification dans l\'Application. La poursuite de l\'utilisation de l\'Application après la notification vaut acceptation des nouvelles CGU.',
            ),
            
            // Section 7
            _buildSection(
              title: '7. Droit Applicable et Litiges',
              content: 'Les présentes CGU sont régies par le droit applicable. Tout litige relatif à l\'interprétation ou à l\'exécution des présentes CGU sera soumis à la compétence exclusive des tribunaux compétents.',
            ),
            
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildSection({
    required String title,
    String? content,
    List<Widget>? children,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      padding: const EdgeInsets.all(16),
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
          Text(
            title,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          if (content != null) ...[
            const SizedBox(height: 12),
            Text(
              content,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[700],
                height: 1.6,
              ),
            ),
          ],
          if (children != null) ...[
            const SizedBox(height: 12),
            ...children,
          ],
        ],
      ),
    );
  }

  Widget _buildSubSection({
    required String title,
    required String content,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          content,
          style: TextStyle(
            fontSize: 14,
            color: Colors.grey[700],
            height: 1.6,
          ),
        ),
      ],
    );
  }
}
