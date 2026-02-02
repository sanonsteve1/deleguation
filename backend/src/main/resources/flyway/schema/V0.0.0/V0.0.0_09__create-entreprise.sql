-- =====================================================
-- Migration: Création de la table entreprise
-- Description: Permet de gérer les entreprises et d'affilier les utilisateurs
-- =====================================================

CREATE TABLE entreprise
(
    id INT8 PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    adresse VARCHAR(500),
    telephone VARCHAR(50),
    email VARCHAR(255),
    create_at TIMESTAMP,
    create_by VARCHAR(255),
    update_at TIMESTAMP,
    update_by VARCHAR(255),
    version INT8 NOT NULL DEFAULT 0
);

CREATE SEQUENCE entreprise_id_seq INCREMENT BY 50 START 1;
ALTER TABLE entreprise
    ALTER COLUMN id SET DEFAULT nextval('entreprise_id_seq');

-- Créer un index pour améliorer les performances
CREATE INDEX idx_entreprise_nom ON entreprise(nom);

-- Modifier la table utilisateur pour utiliser une clé étrangère vers entreprise
ALTER TABLE utilisateur
    DROP COLUMN IF EXISTS entreprise;

ALTER TABLE utilisateur
    ADD COLUMN id_entreprise INT8;

ALTER TABLE utilisateur
    ADD CONSTRAINT fk_utilisateur_entreprise 
    FOREIGN KEY (id_entreprise) REFERENCES entreprise(id);

CREATE INDEX idx_utilisateur_entreprise ON utilisateur(id_entreprise);
