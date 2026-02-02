-- =====================================================
-- Migration: Ajout de la colonne entreprise à la table utilisateur
-- Description: Permet de filtrer les utilisateurs par entreprise
-- =====================================================

ALTER TABLE utilisateur
    ADD COLUMN entreprise VARCHAR(255);

-- Créer un index pour améliorer les performances des requêtes de filtrage
CREATE INDEX idx_utilisateur_entreprise ON utilisateur(entreprise);

-- Mettre à jour les utilisateurs existants avec une valeur par défaut (optionnel)
-- UPDATE utilisateur SET entreprise = 'DEFAULT' WHERE entreprise IS NULL;
