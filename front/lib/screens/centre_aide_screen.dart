import 'package:flutter/material.dart';
import '../colors/app_colors.dart';

class CentreAideScreen extends StatelessWidget {
  const CentreAideScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Centre d\'aide'),
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
              child: Row(
                children: [
                  Icon(Icons.help_outline, color: AppColors.primary, size: 32),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Bienvenue dans le Centre d\'Aide',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Trouvez les réponses aux questions fréquentes',
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
            ),
            const SizedBox(height: 24),
            
            // Section 1: Guide de Démarrage Rapide
            _buildSection(
              title: '1. Guide de Démarrage Rapide (Agent)',
              children: [
                _buildSubSection(
                  title: '1.1. Démarrer ma Journée',
                  content: [
                    'Ouvrez l\'application FieldTrack Pro.',
                    'Assurez-vous que le GPS de votre téléphone est activé et que l\'application a les permissions de localisation en arrière-plan.',
                    'Sur l\'écran principal (Dashboard), appuyez sur le grand bouton vert "DÉMARRER MA JOURNÉE".',
                    'L\'application enregistre votre heure de début et votre position, et le suivi d\'itinéraire commence. L\'écran passe en mode "Actif" avec un chronomètre.',
                  ],
                ),
                const SizedBox(height: 16),
                _buildSubSection(
                  title: '1.2. Mettre en Pause ou Changer de Statut',
                  content: [
                    'En mode "Actif", appuyez sur le bouton "PAUSE" (bleu).',
                    'Un volet (Bottom Sheet) s\'ouvre, vous proposant des statuts prédéfinis (ex: Pause Déjeuner, Rendez-vous Client).',
                    'Sélectionnez le statut approprié. Le chronomètre de travail s\'arrête ou se met en pause selon le statut, mais le suivi GPS peut continuer pour des raisons de sécurité.',
                  ],
                ),
                const SizedBox(height: 16),
                _buildSubSection(
                  title: '1.3. Terminer ma Journée',
                  content: [
                    'Lorsque votre service est terminé, appuyez sur le bouton rouge "ARRÊTER LA JOURNÉE".',
                    'Confirmez votre action dans la fenêtre de dialogue.',
                    'L\'application enregistre votre heure de fin et votre position, et le suivi GPS s\'arrête. Votre session de travail est clôturée et envoyée au serveur.',
                  ],
                ),
              ],
            ),
            const SizedBox(height: 24),
            
            // Section 2: FAQ
            _buildSection(
              title: '2. Questions Fréquentes (FAQ)',
              children: [
                _buildFAQItem(
                  question: 'Que se passe-t-il si je perds la connexion Internet ?',
                  answer: 'L\'application fonctionne en mode Hors Ligne (Offline First). Tous vos pointages (début, fin, changements de statut) et les points GPS sont stockés en toute sécurité sur votre téléphone. Dès que vous retrouvez une connexion (Wi-Fi ou données mobiles), l\'application synchronise automatiquement toutes les données en attente avec le serveur.',
                ),
                const SizedBox(height: 16),
                _buildFAQItem(
                  question: 'Est-ce que l\'application me suit en permanence ?',
                  answer: 'Non. Le suivi d\'itinéraire (géolocalisation) est strictement limité à la période entre le moment où vous appuyez sur "DÉMARRER MA JOURNÉE" et le moment où vous appuyez sur "ARRÊTER LA JOURNÉE". En dehors de ces heures, l\'application n\'enregistre aucune donnée de localisation.',
                ),
                const SizedBox(height: 16),
                _buildFAQItem(
                  question: 'Comment puis-je vérifier si le suivi GPS est actif ?',
                  answer: 'En mode "Actif", vous verrez :\n1. Le chronomètre de session en cours.\n2. Une notification persistante dans la barre d\'état de votre téléphone (iOS/Android).\n3. Un indicateur de signal GPS vert en haut de l\'écran.',
                ),
                const SizedBox(height: 16),
                _buildFAQItem(
                  question: 'Mon pointage n\'apparaît pas sur la plateforme du manager. Pourquoi ?',
                  answer: 'Vérifiez votre connexion Internet. Si vous étiez hors ligne, la synchronisation est peut-être en attente. Si vous êtes connecté et que le problème persiste, vérifiez l\'écran "Historique" pour voir si la session est marquée comme "Synchronisée". Si le problème persiste, contactez votre manager ou le support technique.',
                ),
              ],
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildSection({
    required String title,
    required List<Widget> children,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
        const SizedBox(height: 16),
        ...children,
      ],
    );
  }

  Widget _buildSubSection({
    required String title,
    required List<String> content,
  }) {
    return Container(
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
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 12),
          ...content.asMap().entries.map((entry) {
            return Padding(
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
                      entry.value,
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[700],
                        height: 1.5,
                      ),
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
        ],
      ),
    );
  }

  Widget _buildFAQItem({
    required String question,
    required String answer,
  }) {
    return Container(
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
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.help_outline, color: AppColors.primary, size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Q: $question',
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.only(left: 28),
            child: Text(
              'R: $answer',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[700],
                height: 1.5,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
