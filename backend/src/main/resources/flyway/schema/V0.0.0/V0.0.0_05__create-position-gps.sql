-- =====================================================
-- Table: position_gps
-- Description: Table des positions GPS enregistrées pendant les sessions
-- =====================================================
CREATE TABLE position_gps
(
    id INT8 PRIMARY KEY,
    id_session INT8 NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    precision_gps DECIMAL(10, 2),
    synchronise BOOLEAN NOT NULL DEFAULT FALSE,
    create_at TIMESTAMP,
    create_by VARCHAR(255),
    update_at TIMESTAMP,
    update_by VARCHAR(255),
    version INT8 NOT NULL DEFAULT 0,
    CONSTRAINT fk_position_session FOREIGN KEY (id_session) REFERENCES session_travail(id)
);

CREATE SEQUENCE position_gps_id_seq INCREMENT BY 50 START 1;
ALTER TABLE position_gps
    ALTER COLUMN id SET DEFAULT nextval('position_gps_id_seq');

CREATE INDEX idx_position_session ON position_gps(id_session);
CREATE INDEX idx_position_timestamp ON position_gps(timestamp);
CREATE INDEX idx_position_synchronise ON position_gps(synchronise);
