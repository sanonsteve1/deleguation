-- =====================================================
-- Table: session_travail
-- Description: Table des sessions de travail des agents
-- =====================================================
CREATE TABLE session_travail
(
    id INT8 PRIMARY KEY,
    id_utilisateur INT8 NOT NULL,
    heure_debut TIMESTAMP NOT NULL,
    heure_fin TIMESTAMP,
    latitude_debut DECIMAL(10, 8) NOT NULL,
    longitude_debut DECIMAL(11, 8) NOT NULL,
    latitude_fin DECIMAL(10, 8),
    longitude_fin DECIMAL(11, 8),
    synchronise BOOLEAN NOT NULL DEFAULT FALSE,
    create_at TIMESTAMP,
    create_by VARCHAR(255),
    update_at TIMESTAMP,
    update_by VARCHAR(255),
    version INT8 NOT NULL DEFAULT 0,
    CONSTRAINT fk_session_utilisateur FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id)
);

CREATE SEQUENCE session_travail_id_seq INCREMENT BY 50 START 1;
ALTER TABLE session_travail
    ALTER COLUMN id SET DEFAULT nextval('session_travail_id_seq');

CREATE INDEX idx_session_utilisateur ON session_travail(id_utilisateur);
CREATE INDEX idx_session_heure_debut ON session_travail(heure_debut);
CREATE INDEX idx_session_synchronise ON session_travail(synchronise);
