-- =====================================================
-- Table: statut
-- Description: Table des statuts de travail (EN_SERVICE, PAUSE, CHEZ_CLIENT, etc.)
-- =====================================================
CREATE TABLE statut
(
    id INT8 PRIMARY KEY,
    code_statut VARCHAR(50) NOT NULL UNIQUE,
    libelle VARCHAR(255) NOT NULL,
    create_at TIMESTAMP,
    create_by VARCHAR(255),
    update_at TIMESTAMP,
    update_by VARCHAR(255),
    version INT8 NOT NULL DEFAULT 0
);

CREATE SEQUENCE statut_id_seq INCREMENT BY 50 START 1;
ALTER TABLE statut
    ALTER COLUMN id SET DEFAULT nextval('statut_id_seq');

-- Insertion des statuts par défaut
INSERT INTO statut (code_statut, libelle) VALUES
    ('EN_SERVICE', 'En service'),
    ('PAUSE', 'Pause'),
    ('EN_DEPLACEMENT', 'En déplacement'),
    ('CHEZ_CLIENT', 'Chez client'),
    ('EN_ATTENTE', 'En attente');
