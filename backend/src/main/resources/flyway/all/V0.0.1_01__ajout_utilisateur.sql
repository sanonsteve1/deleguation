INSERT INTO utilisateur (id, username, password, prenoms, nom, role, statut) VALUES
(nextval('utilisateur_id_seq'), 'abadou', '$2a$10$KdGQLTDCV.nw5zblVb3JN.9DMrLUJi8lLJS0ocvmH4ryrSI7DBF/e', 'Aristide', 'Badou','ADMIN','ACTIF'),
(nextval('utilisateur_id_seq'), 'ibamba', '$2a$10$KdGQLTDCV.nw5zblVb3JN.9DMrLUJi8lLJS0ocvmH4ryrSI7DBF/e', 'Ibrahima', 'Bamba','ADMIN','ACTIF'),
(nextval('utilisateur_id_seq'), 'admin', '$2a$10$KdGQLTDCV.nw5zblVb3JN.9DMrLUJi8lLJS0ocvmH4ryrSI7DBF/e', '', 'Administrateur', 'ADMIN','ACTIF'),
(nextval('utilisateur_id_seq'), 'daka', '$2a$10$KdGQLTDCV.nw5zblVb3JN.9DMrLUJi8lLJS0ocvmH4ryrSI7DBF/e', 'Dylan', 'Aka', 'ADMIN','ACTIF'),
(nextval('utilisateur_id_seq'), 'akouadio', '$2a$10$KdGQLTDCV.nw5zblVb3JN.9DMrLUJi8lLJS0ocvmH4ryrSI7DBF/e', 'Abel', 'Kouadio', 'ADMIN','ACTIF');

