-- =====================================================
-- Table: changement_statut
-- Description: Table des changements de statut pendant une session de travail
-- =====================================================
CREATE TABLE changement_statut
(
    id INT8 PRIMARY KEY,
    id_session INT8 NOT NULL,
    id_statut INT8 NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    synchronise BOOLEAN NOT NULL DEFAULT FALSE,
    create_at TIMESTAMP,
    create_by VARCHAR(255),
    update_at TIMESTAMP,
    update_by VARCHAR(255),
    version INT8 NOT NULL DEFAULT 0,
    CONSTRAINT fk_changement_session FOREIGN KEY (id_session) REFERENCES session_travail(id),
    CONSTRAINT fk_changement_statut FOREIGN KEY (id_statut) REFERENCES statut(id)
);

CREATE SEQUENCE changement_statut_id_seq INCREMENT BY 50 START 1;
ALTER TABLE changement_statut
    ALTER COLUMN id SET DEFAULT nextval('changement_statut_id_seq');

CREATE INDEX idx_changement_session ON changement_statut(id_session);
CREATE INDEX idx_changement_statut ON changement_statut(id_statut);
CREATE INDEX idx_changement_timestamp ON changement_statut(timestamp);
CREATE INDEX idx_changement_synchronise ON changement_statut(synchronise);
