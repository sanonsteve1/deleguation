-- =====================================================
-- Table: role
-- =====================================================
CREATE TABLE role (
                        id INT8 PRIMARY KEY,
                        code VARCHAR(255),
                        designation VARCHAR(255),
                        create_at TIMESTAMP,
                        create_by VARCHAR(255),
                        update_at TIMESTAMP,
                        update_by VARCHAR(255),
                        version INT8 NOT NULL DEFAULT 0
);
CREATE SEQUENCE role_id_seq INCREMENT BY 50 START 1;
ALTER TABLE role ALTER COLUMN id SET DEFAULT nextval('role_id_seq');