import 'package:flutter/material.dart';

class AppColors {
  // Couleurs principales du logo
  static const Color primary = Color(0xFFE53935); // Rouge principal du logo
  static const Color primaryDark = Color(0xFF1A237E); // Bleu foncé du logo
  static const Color primaryLight = Color(0xFF3498DB); // Bleu clair du logo
  
  // Couleurs selon le PRD
  static const Color vertDemarrer = Color(0xFF2ECC71); // Vert pour "Démarrer"
  static const Color rougeArreter = Color(0xFFE74C3C); // Rouge pour "Arrêter"
  
  // Couleurs supplémentaires pour l'UI
  static const Color secondary = Color(0xFF95A5A6);
  static const Color background = Color(0xFFF5F5F5);
  static const Color textPrimary = Color(0xFF2C3E50);
  static const Color textSecondary = Color(0xFF7F8C8D);
  static const Color success = Color(0xFF27AE60);
  static const Color warning = Color(0xFFF39C12);
  static const Color error = Color(0xFFE74C3C);
  
  // Couleurs pour les statuts
  static const Color statutEnService = Color(0xFF2ECC71);
  static const Color statutPause = Color(0xFFF39C12);
  static const Color statutClient = Color(0xFF3498DB);
  static const Color statutDeplacement = Color(0xFF9B59B6);
  static const Color statutAttente = Color(0xFF95A5A6);
}
