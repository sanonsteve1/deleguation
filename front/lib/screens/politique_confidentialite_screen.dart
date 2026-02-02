import 'package:flutter/material.dart';
import '../colors/app_colors.dart';

class PolitiqueConfidentialiteScreen extends StatelessWidget {
  const PolitiqueConfidentialiteScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Politique de Confidentialité'),
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
                      Icon(Icons.shield_outlined, color: AppColors.primary, size: 32),
                      const SizedBox(width: 16),
                      const Expanded(
                        child: Text(
                          'Politique de Confidentialité',
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
                    'Date d\'entrée en vigueur : 19 Janvier 2026',
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
            
            // Introduction
            _buildSection(
              content: 'La présente Politique de Confidentialité décrit la manière dont l\'application FieldTrack Pro (ci-après "l\'Application") collecte, utilise et protège les informations personnelles de ses utilisateurs, conformément aux exigences du Règlement Général sur la Protection des Données (RGPD).',
            ),
            
            // Section 1
            _buildSection(
              title: '1. Responsable du Traitement des Données',
              content: 'Le responsable du traitement des données est l\'entreprise utilisatrice de l\'Application (votre employeur). L\'Application agit en tant que sous-traitant technique.',
            ),
            
            // Section 2
            _buildSection(
              title: '2. Données Collectées',
              children: [
                _buildSubSection(
                  title: '2.1. Données d\'Identification',
                  items: [
                    'Nom, Prénom, Adresse e-mail (pour l\'authentification).',
                    'Identifiant unique de l\'Agent.',
                  ],
                ),
                const SizedBox(height: 16),
                _buildSubSection(
                  title: '2.2. Données de Suivi d\'Activité',
                  items: [
                    'Horodatage des Pointages : Heure de début et heure de fin de service.',
                    'Statuts d\'Activité : Enregistrement des changements de statut (Pause, Client, etc.) avec horodatage.',
                  ],
                ),
                const SizedBox(height: 16),
                _buildSubSection(
                  title: '2.3. Données de Géolocalisation (Données Sensibles)',
                  items: [
                    'Position GPS : Latitude et longitude.',
                    'Horodatage de la Position : Moment précis de l\'enregistrement de la position.',
                    'Précision GPS : Marge d\'erreur de la mesure.',
                  ],
                ),
              ],
            ),
            
            // Section 3
            _buildSection(
              title: '3. Finalités de la Collecte',
              items: [
                'Gestion du Temps de Travail : Calcul précis des heures de service et des heures supplémentaires.',
                'Optimisation Opérationnelle : Analyse des itinéraires pour améliorer l\'efficacité des déplacements.',
                'Sécurité de l\'Agent : Permettre au manager de localiser un agent en cas d\'urgence pendant son service.',
                'Preuve de Service : Fournir un historique de localisation pour justifier les interventions.',
              ],
            ),
            
            // Section 4
            _buildSection(
              title: '4. Principes de Traitement des Données de Géolocalisation',
              children: [
                _buildSubSection(
                  title: '4.1. Limitation de la Collecte',
                  content: 'La collecte des données de géolocalisation est strictement limitée à la période de service. Le suivi GPS est activé uniquement après le pointage de début ("DÉMARRER MA JOURNÉE") et est désactivé immédiatement après le pointage d\'arrêt ("ARRÊTER LA JOURNÉE").',
                ),
                const SizedBox(height: 16),
                _buildSubSection(
                  title: '4.2. Base Légale',
                  content: 'Le traitement de ces données est fondé sur l\'intérêt légitime de l\'employeur à gérer et sécuriser son personnel mobile, ainsi que sur l\'exécution du contrat de travail, après information et consentement de l\'Agent.',
                ),
                const SizedBox(height: 16),
                _buildSubSection(
                  title: '4.3. Durée de Conservation',
                  content: 'Les données de géolocalisation sont conservées pour une durée maximale définie par l\'entreprise à des fins de vérification et de conformité légale, puis sont anonymisées ou supprimées.',
                ),
              ],
            ),
            
            // Section 5
            _buildSection(
              title: '5. Droits de l\'Utilisateur (RGPD)',
              content: 'Conformément au RGPD, vous disposez des droits suivants :\n• Droit d\'Accès : Demander une copie des données vous concernant.\n• Droit de Rectification : Demander la correction de données inexactes.\n• Droit à l\'Effacement : Demander la suppression de vos données (sous réserve des obligations légales de l\'employeur).\n• Droit à la Limitation du Traitement : Demander la suspension du traitement de vos données.\n• Droit d\'Opposition : Vous opposer au traitement de vos données.\n\nPour exercer ces droits, veuillez contacter votre service RH ou le support technique.',
            ),
            
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildSection({
    String? title,
    String? content,
    List<String>? items,
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
          if (title != null) ...[
            Text(
              title,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 12),
          ],
          if (content != null)
            Text(
              content,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[700],
                height: 1.6,
              ),
            ),
          if (items != null) ...[
            ...items.map((item) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        margin: const EdgeInsets.only(top: 6, right: 12),
                        width: 6,
                        height: 6,
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          shape: BoxShape.circle,
                        ),
                      ),
                      Expanded(
                        child: Text(
                          item,
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[700],
                            height: 1.5,
                          ),
                        ),
                      ),
                    ],
                  ),
                )),
          ],
          if (children != null) ...children,
        ],
      ),
    );
  }

  Widget _buildSubSection({
    required String title,
    String? content,
    List<String>? items,
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
        if (content != null)
          Text(
            content,
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[700],
              height: 1.6,
            ),
          ),
        if (items != null) ...[
          const SizedBox(height: 8),
          ...items.map((item) => Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      margin: const EdgeInsets.only(top: 6, right: 12),
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                      ),
                    ),
                    Expanded(
                      child: Text(
                        item,
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[700],
                          height: 1.5,
                        ),
                      ),
                    ),
                  ],
                ),
              )),
        ],
      ],
    );
  }
}
