-- =====================================================
-- Migration: Ajout du champ téléphone à la table utilisateur
-- Description: Ajoute la colonne téléphone à la table utilisateur
-- =====================================================
ALTER TABLE utilisateur
    ADD COLUMN telephone VARCHAR(20);
