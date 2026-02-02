# Requêtes des Repositories - Projet SBEE (Version DBeaver)

Ce document recense toutes les requêtes personnalisées définies dans les repositories du projet backend, **transformées pour être exécutables directement dans DBeaver**.

> **Note :** Toutes les requêtes utilisent des paramètres nommés (comme `:projetId`, `:bailleurId`) qu'il faut définir dans DBeaver avant l'exécution.

## Instructions pour DBeaver

### Comment utiliser ces requêtes :

1. **Paramètres nommés :** Toutes les requêtes utilisent des paramètres nommés (comme `:projetId`, `:bailleurId`) qu'il faut définir dans DBeaver.

2. **Définition des paramètres dans DBeaver :**
   - Ouvrez la requête dans DBeaver
   - Cliquez sur l'icône "Set parameters" (🔧) dans la barre d'outils
   - Définissez les valeurs pour chaque paramètre :
     - `projetId` : ID du projet souhaité
     - `bailleurId` : ID du bailleur souhaité
     - `prestataireId` : ID du prestataire souhaité
     - `projetIds` : Liste des IDs des projets (ex: 1,2,3)

3. **Exemples de paramètres :**
   - `projetId` = `1`
   - `bailleurId` = `2`
   - `prestataireId` = `3`
   - `projetIds` = `1,2,3`

4. **Requêtes complexes :** Certaines requêtes utilisent des CTE (Common Table Expressions) avec `WITH`. Assurez-vous que votre version de PostgreSQL les supporte.

5. **Fonctions spécifiques :** 
   - `STRING_AGG()` : Fonction PostgreSQL pour concaténer des chaînes
   - `FILTER` : Clause PostgreSQL pour filtrer les agrégations
   - `DISTINCT ON` : Fonction PostgreSQL spécifique

6. **Performance :** Pour de gros volumes de données, considérez l'ajout d'index sur les colonnes utilisées dans les `WHERE` et `JOIN`.

### Requêtes de test rapide :

```sql
-- Lister tous les projets
SELECT id, designation, code, statut FROM projet LIMIT 10;

-- Lister tous les prestataires
SELECT id, designation, code FROM prestataire LIMIT 10;

-- Lister tous les bailleurs
SELECT id, designation, abbreviation FROM bailleur LIMIT 10;
```

## Table des matières

1. [ProjetRepository](#projetrepository)
2. [FinancementRepository](#financementrepository)
3. [BailleurRepository](#bailleurrepository)
4. [LocaliteRepository](#localiterepository)
5. [PrestataireRepository](#prestatairerepository)
6. [ActiviteOuvrageRepository](#activiteouvragerepository)
7. [ActiviteRepository](#activiterepository)
8. [ProjetPrestataireRepository](#projetprestatairerepository)
9. [MontantPrestataireProjetRepository](#montantprestataireprojetsrepository)
10. [UtilisateurRepository](#utilisateurrepository)
11. [PhaseRepository](#phaserepository)
12. [Repositories sans requêtes personnalisées](#repositories-sans-requêtes-personnalisées)

---

## ProjetRepository

### 1. findProjetsParBailleurAvecLocalites()
**Description :** Récupère les projets groupés par bailleur avec le nombre de localités touchées

```sql
-- Version DBeaver (SQL natif)
SELECT 
    b.id as bailleur_id,
    b.designation as bailleur_designation,
    b.code as bailleur_code,
    b.abbreviation as bailleur_abbreviation,
    p.id as projet_id,
    p.designation as projet_designation,
    p.code as projet_code,
    p.abbreviation as projet_abbreviation,
    p.statut as projet_statut,
    p.progression as projet_progression,
    f.budget_attribue as budget_attribue,
    COUNT(DISTINCT l.id) as nombre_localites
FROM projet p
JOIN financement f ON f.projet_id = p.id
JOIN bailleur b ON b.id = f.bailleur_id
LEFT JOIN activite a ON a.projet_id = p.id
LEFT JOIN localite l ON l.id = a.localite_id
GROUP BY b.id, b.designation, b.code, b.abbreviation, p.id, p.designation, p.code, p.abbreviation, p.statut, p.progression, f.budget_attribue
ORDER BY b.designation, p.designation;
```

### 2. findProjetsParBailleurAvecLocalites(Long bailleurId)
**Description :** Récupère les projets d'un bailleur spécifique avec le nombre de localités touchées

```sql
-- Version DBeaver (SQL natif)
SELECT 
    b.id as bailleur_id,
    b.designation as bailleur_designation,
    b.code as bailleur_code,
    b.abbreviation as bailleur_abbreviation,
    p.id as projet_id,
    p.designation as projet_designation,
    p.code as projet_code,
    p.abbreviation as projet_abbreviation,
    p.statut as projet_statut,
    p.progression as projet_progression,
    f.budget_attribue as budget_attribue,
    COUNT(DISTINCT l.id) as nombre_localites
FROM projet p
JOIN financement f ON f.projet_id = p.id
JOIN bailleur b ON b.id = f.bailleur_id
LEFT JOIN activite a ON a.projet_id = p.id
LEFT JOIN localite l ON l.id = a.localite_id
WHERE b.id = :bailleurId
GROUP BY b.id, b.designation, b.code, b.abbreviation, p.id, p.designation, p.code, p.abbreviation, p.statut, p.progression, f.budget_attribue
ORDER BY p.designation;
```

### 3. findLocalitesDetailleesParProjet(Long projetId)
**Description :** Récupère les localités détaillées pour un projet spécifique

```sql
-- Version DBeaver (SQL natif)
SELECT 
    l.id as localite_id,
    l.designation as localite_designation,
    c.designation as commune_designation,
    d.designation as departement_designation,
    p.id as projet_id
FROM projet p
JOIN activite a ON a.projet_id = p.id
JOIN localite l ON l.id = a.localite_id
LEFT JOIN commune c ON c.id = l.commune_id
LEFT JOIN departement d ON d.id = c.departement_id
WHERE p.id = :projetId
ORDER BY d.designation, c.designation, l.designation;
```

### 4. findFinancementsParProjet(Long projetId)
**Description :** Récupère les financements d'un projet spécifique

```sql
-- Version DBeaver (SQL natif)
SELECT 
    f.id as financement_id,
    f.budget_attribue as budget_attribue,
    f.date_attribution as date_attribution,
    f.statut as statut,
    b.id as bailleur_id,
    b.designation as bailleur_designation,
    b.abbreviation as bailleur_abbreviation,
    p.id as projet_id,
    p.designation as projet_designation
FROM financement f
JOIN bailleur b ON b.id = f.bailleur_id
JOIN projet p ON p.id = f.projet_id
WHERE f.projet_id = :projetId
ORDER BY f.budget_attribue DESC;
```

### 5. listerParPrestataire(Long idPrestataire)
**Description :** Liste les projets par prestataire

```sql
-- Version DBeaver (SQL natif)
SELECT DISTINCT 
    p.id as projet_id,
    p.designation as projet_designation,
    p.code as projet_code,
    p.abbreviation as projet_abbreviation,
    p.statut as projet_statut,
    p.progression as projet_progression
FROM activite a
INNER JOIN projet p ON p.id = a.projet_id
WHERE a.prestataire_id = :idPrestataire
ORDER BY p.designation;
```

### 6. listerProjetsParPrestataire(Long idPrestataire) - Native Query
**Description :** Liste les projets par prestataire avec budget

```sql
-- Version DBeaver (SQL natif)
SELECT DISTINCT ON (p.id) 
    p.abbreviation as projet_abbreviation, 
    p.progression as projet_progression,
    (SELECT COALESCE(pp2.budget_projet,0) 
     FROM projet_prestataire pp2 
     WHERE pp2.projet_id = p.id AND pp2.prestataire_id = :idPrestataire) AS budget_projet,
    (SELECT COALESCE(SUM(mpp.montant_donne), 0) 
     FROM montant_prestataire_projet mpp 
     INNER JOIN projet_prestataire pp1 ON mpp.projet_prestataire_id = pp1.id 
     WHERE pp1.projet_id = p.id AND pp1.prestataire_id = :idPrestataire) AS budget_decaisse
FROM projet p
INNER JOIN activite a ON a.projet_id = p.id
WHERE a.prestataire_id = :idPrestataire;
```

### 7. getStatistiquesPrestatairesPourProjet(Long projetId) - Native Query
**Description :** Récupère les statistiques détaillées des prestataires pour un projet donné

```sql
-- Version DBeaver (SQL natif)
WITH total_projet AS (
    SELECT SUM(ao1.quantite_a_realiser) AS total_prevu_projet
    FROM activite_ouvrage ao1
    INNER JOIN activite a1 ON a1.id = ao1.activite_id
    WHERE a1.projet_id = :projetId
)
SELECT
    p.abbreviation as projet_abbreviation,
    COALESCE(pr.designation, 'Non attribué') AS nom_prestataire,
    STRING_AGG(DISTINCT tt.designation, ', ') AS types_travaux,
    COUNT(DISTINCT a.id) AS nombre_activites,
    COUNT(DISTINCT a.localite_id) AS nombre_localites,
    COUNT(DISTINCT tt.id) AS nombre_types_travaux,
    SUM(ao.quantite_a_realiser) AS quantite_prevue,
    SUM(ao.quantite_realisee) AS quantite_realisee,
    CASE
        WHEN SUM(ao.quantite_a_realiser) = 0 THEN 0
        ELSE ROUND(SUM(ao.quantite_realisee) * 100.0 / SUM(ao.quantite_a_realiser), 2)
    END AS tep,
    CASE
        WHEN t.total_prevu_projet = 0 OR t.total_prevu_projet IS NULL THEN 0
        ELSE ROUND(SUM(ao.quantite_a_realiser) * 100.0 / t.total_prevu_projet, 2)
    END AS part_prestataire
FROM projet p
INNER JOIN activite a ON a.projet_id = p.id
INNER JOIN type_travaux tt ON a.type_travaux_id = tt.id
INNER JOIN activite_ouvrage ao ON ao.activite_id = a.id
LEFT JOIN prestataire pr ON a.prestataire_id = pr.id
CROSS JOIN total_projet t
WHERE p.id = :projetId
GROUP BY p.abbreviation, pr.designation, t.total_prevu_projet
ORDER BY pr.designation;
```

### 8. getDetailsLocalitesPourProjet(Long projetId) - Native Query
**Description :** Récupère les détails par localité avec les ouvrages spécifiques pour un projet donné

```sql
-- Version DBeaver (SQL natif)
SELECT
    d.designation AS departement,
    c.designation AS commune,
    l.designation AS localite,
    tt.designation AS type_travaux,
    COALESCE(pr.designation, 'Non attribué') AS prestataire,
 
    -- Poteaux (PBT)
    SUM(ao.quantite_a_realiser) FILTER (WHERE o.code = 'PBT') AS pbt_prevues,
    SUM(ao.quantite_realisee)   FILTER (WHERE o.code = 'PBT') AS pbt_realisees,
    CASE
        WHEN SUM(ao.quantite_a_realiser) FILTER (WHERE o.code = 'PBT') > 0
        THEN ROUND(
            SUM(ao.quantite_realisee) FILTER (WHERE o.code = 'PBT') * 100.0
            / NULLIF(SUM(ao.quantite_a_realiser) FILTER (WHERE o.code = 'PBT'),0),
            0
        )
        ELSE 0
    END AS pbt_taux,
 
    -- Lignes BT1 (LBT1)
    SUM(ao.quantite_a_realiser) FILTER (WHERE o.code = 'LBT1') AS lbt1_prevues,
    SUM(ao.quantite_realisee)   FILTER (WHERE o.code = 'LBT1') AS lbt1_realisees,
    CASE
        WHEN SUM(ao.quantite_a_realiser) FILTER (WHERE o.code = 'LBT1') > 0
        THEN ROUND(
            SUM(ao.quantite_realisee) FILTER (WHERE o.code = 'LBT1') * 100.0
            / NULLIF(SUM(ao.quantite_a_realiser) FILTER (WHERE o.code = 'LBT1'),0),
            0
        )
        ELSE 0
    END AS lbt1_taux,
 
    -- Lignes BT2 (LBT2)
    SUM(ao.quantite_a_realiser) FILTER (WHERE o.code = 'LBT2') AS lbt2_prevues,
    SUM(ao.quantite_realisee)   FILTER (WHERE o.code = 'LBT2') AS lbt2_realisees,
    CASE
        WHEN SUM(ao.quantite_a_realiser) FILTER (WHERE o.code = 'LBT2') > 0
        THEN ROUND(
            SUM(ao.quantite_realisee) FILTER (WHERE o.code = 'LBT2') * 100.0
            / NULLIF(SUM(ao.quantite_a_realiser) FILTER (WHERE o.code = 'LBT2'),0),
            0
        )
        ELSE 0
    END AS lbt2_taux,
 
    -- Lignes HTA (LHTA)
    SUM(ao.quantite_a_realiser) FILTER (WHERE o.code = 'LHTA') AS lhta_prevues,
    SUM(ao.quantite_realisee)   FILTER (WHERE o.code = 'LHTA') AS lhta_realisees,
    CASE
        WHEN SUM(ao.quantite_a_realiser) FILTER (WHERE o.code = 'LHTA') > 0
        THEN ROUND(
            SUM(ao.quantite_realisee) FILTER (WHERE o.code = 'LHTA') * 100.0
            / NULLIF(SUM(ao.quantite_a_realiser) FILTER (WHERE o.code = 'LHTA'),0),
            0
        )
        ELSE 0
    END AS lhta_taux,
 
    -- TFBT
    SUM(ao.quantite_a_realiser) FILTER (WHERE o.code = 'TFBT') AS tfbt_prevues,
    SUM(ao.quantite_realisee)   FILTER (WHERE o.code = 'TFBT') AS tfbt_realisees,
    CASE
        WHEN SUM(ao.quantite_a_realiser) FILTER (WHERE o.code = 'TFBT') > 0
        THEN ROUND(
            SUM(ao.quantite_realisee) FILTER (WHERE o.code = 'TFBT') * 100.0
            / NULLIF(SUM(ao.quantite_a_realiser) FILTER (WHERE o.code = 'TFBT'),0),
            0
        )
        ELSE 0
    END AS tfbt_taux,
 
    -- EP
    SUM(ao.quantite_a_realiser) FILTER (WHERE o.code = 'EP') AS ep_prevues,
    SUM(ao.quantite_realisee)   FILTER (WHERE o.code = 'EP') AS ep_realisees,
    CASE
        WHEN SUM(ao.quantite_a_realiser) FILTER (WHERE o.code = 'EP') > 0
        THEN ROUND(
            SUM(ao.quantite_realisee) FILTER (WHERE o.code = 'EP') * 100.0
            / NULLIF(SUM(ao.quantite_a_realiser) FILTER (WHERE o.code = 'EP'),0),
            0
        )
        ELSE 0
    END AS ep_taux
 
FROM activite a
INNER JOIN activite_ouvrage ao ON ao.activite_id = a.id
INNER JOIN ouvrage o ON o.id = ao.ouvrage_id
INNER JOIN localite l ON l.id = a.localite_id
INNER JOIN commune c ON c.id = l.commune_id
INNER JOIN departement d ON d.id = c.departement_id
INNER JOIN projet p ON p.id = a.projet_id
INNER JOIN type_travaux tt ON a.type_travaux_id = tt.id
LEFT JOIN prestataire pr ON a.prestataire_id = pr.id
WHERE p.id = :projetId
GROUP BY d.designation, c.designation, l.designation, tt.designation, pr.designation
ORDER BY d.designation, c.designation, l.designation;
```

---

## FinancementRepository

### 1. rechercherFinancementsParProjet(Set<Long> projetIds) - Native Query
**Description :** Recherche les financements par projet avec pourcentages

```sql
-- Version DBeaver (SQL natif)
SELECT 
    b.abbreviation as bailleur, 
    SUM(f.budget_attribue) as montant, 
    ROUND((SUM(f.budget_attribue) / (
        SELECT SUM(f1.budget_attribue) 
        FROM financement f1 
        WHERE f1.projet_id IN (:projetIds)
    )) * 100, 1) as pourcentage 
FROM projet p 
INNER JOIN financement f ON f.projet_id = p.id 
INNER JOIN bailleur b ON b.id = f.bailleur_id 
WHERE p.id IN (:projetIds)
GROUP BY b.abbreviation 
ORDER BY b.abbreviation;
```

### 2. findByProjetIn(Collection<Projet> projets)
**Description :** Trouve les financements par collection de projets (méthode Spring Data JPA)

### 3. findAllByProjet_Id(Long projetId)
**Description :** Trouve tous les financements par ID de projet (méthode Spring Data JPA)

### 4. calculerTefParBailleur(Long projetId) - Native Query
**Description :** Calcule le TEF par bailleur

```sql
-- Version DBeaver (SQL natif)
SELECT 
    b.abbreviation as bailleur_abbreviation,  
    ROUND((SUM(fa.montant) / f.budget_attribue) * 100, 2) as TEF
FROM financement_annuel fa
INNER JOIN financement f ON f.id = fa.financement_id
INNER JOIN bailleur b ON b.id = f.bailleur_id
INNER JOIN projet p ON p.id = f.projet_id
WHERE p.id = :projetId
GROUP BY b.abbreviation, f.budget_attribue;
```

### 5. calculerTefParProjet(Long projetId) - Native Query
**Description :** Calcule le TEF par projet

```sql
-- Version DBeaver (SQL natif)
SELECT ROUND(
    (SELECT SUM(fa.montant) * 100
     FROM financement_annuel fa
     INNER JOIN financement f ON f.id = fa.financement_id
     INNER JOIN projet p ON p.id = f.projet_id
     WHERE p.id = :projetId) /
    (SELECT NULLIF(SUM(f.budget_attribue), 0)
     FROM financement f 
     INNER JOIN projet p ON p.id = f.projet_id
     WHERE p.id = :projetId), 2)
AS tef_pourcentage;
```

---

## BailleurRepository

### 1. findBailleursParStatutProjet(String statut)
**Description :** Trouve les bailleurs par statut de projet

```sql
-- Version DBeaver (SQL natif)
SELECT DISTINCT 
    b.id as bailleur_id,
    b.designation as bailleur_designation,
    b.code as bailleur_code,
    b.abbreviation as bailleur_abbreviation
FROM projet p
JOIN financement f ON f.projet_id = p.id
JOIN bailleur b ON b.id = f.bailleur_id
WHERE (:statut = 'TOUS' OR p.statut = :statut)
ORDER BY b.designation;
```

---

## LocaliteRepository

### 1. findByDesignationIgnoreCase(String designation)
**Description :** Trouve une localité par désignation (insensible à la casse) - méthode Spring Data JPA

### 2. listerQuantiteParProjet(Set<Long> projetIds) - Native Query
**Description :** Liste les quantités par projet

```sql
-- Version DBeaver (SQL natif)
SELECT DISTINCT 
    d.designation as departement_designation, 
    COUNT(DISTINCT l.commune_id) as nombre_commune, 
    COUNT(DISTINCT l.id) as nombre_localite
FROM activite a
INNER JOIN phase ph ON ph.id = a.phase_id
INNER JOIN localite l ON l.id = a.localite_id
INNER JOIN commune c ON c.id = l.commune_id
INNER JOIN departement d ON d.id = c.departement_id
INNER JOIN projet p ON ph.projet_id = p.id
WHERE p.id IN (:projetIds)
GROUP BY d.designation;
```

### 3. listerParProjet(Long projetId)
**Description :** Liste les localités par projet

```sql
-- Version DBeaver (SQL natif)
SELECT DISTINCT
    l.id as localite_id,
    l.designation as localite_designation,
    c.designation as commune_designation,
    d.designation as departement_designation
FROM activite a
INNER JOIN phase ph ON ph.id = a.phase_id
INNER JOIN projet p ON p.id = ph.projet_id
INNER JOIN localite l ON l.id = a.localite_id
INNER JOIN commune c ON c.id = l.commune_id
INNER JOIN departement d ON d.id = c.departement_id
WHERE p.id = :projetId
ORDER BY d.designation, c.designation, l.designation;
```

### 4. listerParProjet(Set<Long> projetIds) - Native Query (surcharge)
**Description :** Liste les localités par projets

```sql
select distinct d.designation, count(distinct l.commune_id) as nombre_commune, count(distinct l.id) as nombre_commune
from activite a
inner join phase ph on ph.id = a.phase_id
inner join localite l on l.id = a.localite_id
inner join commune c on c.id = l.commune_id
inner join departement d on d.id = c.departement_id
inner join projet p on ph.projet_id = p.id
where p.id in :projetIds
group by d.designation
```

### 5. listerDetailleeParProjet(Set<Long> projetIds) - Native Query
**Description :** Liste détaillée des localités par projet

```sql
select d.designation as departement, c.designation as commune, l.id as localite_id, l.designation as localite_designation
from activite a
inner join phase ph on ph.id = a.phase_id
inner join localite l on l.id = a.localite_id
inner join commune c on c.id = l.commune_id
inner join departement d on d.id = c.departement_id
inner join projet p on ph.projet_id = p.id
where p.id in :projetIds
order by d.designation, c.designation, l.designation
```

---

## PrestataireRepository

### 1. listerPrestataireAvecProjet()
**Description :** Liste les prestataires ayant des projets

```sql
-- Version DBeaver (SQL natif)
SELECT DISTINCT 
    p.id as prestataire_id,
    p.designation as prestataire_designation,
    p.code as prestataire_code,
    p.abbreviation as prestataire_abbreviation
FROM activite a
INNER JOIN prestataire p ON p.id = a.prestataire_id
WHERE a.projet_id IS NOT NULL
ORDER BY p.designation ASC;
```

### 2. listerPrestataireAvecProjetEtStatut(String statut)
**Description :** Liste les prestataires avec projet et statut

```sql
-- Version DBeaver (SQL natif) - Remplacez 'EN_COURS' par le statut souhaité
SELECT DISTINCT 
    p.id as prestataire_id,
    p.designation as prestataire_designation,
    p.code as prestataire_code,
    p.abbreviation as prestataire_abbreviation
FROM activite a
JOIN prestataire p ON p.id = a.prestataire_id
JOIN projet pr ON pr.id = a.projet_id
WHERE ('TOUS' = 'EN_COURS' OR pr.statut = 'EN_COURS')  -- Remplacez 'EN_COURS' par le statut souhaité
ORDER BY p.designation ASC;
```

---

## ActiviteOuvrageRepository

### 1. listerQuantiteOuvrageParProjet(List<Long> idsProjet, Long idPrestataire) - Native Query
**Description :** Liste les quantités d'ouvrages par projet

```sql
-- Version DBeaver (SQL natif)
SELECT 
    tt.designation as type_travaux, 
    o.designation as ouvrage, 
    COUNT(DISTINCT a.localite_id) as nb_localite, 
    SUM(ao.quantite_a_realiser) as qte_a_realiser, 
    SUM(ao.quantite_realisee) as qte_realisee
FROM activite a
INNER JOIN activite_ouvrage ao ON ao.activite_id = a.id
INNER JOIN type_travaux tt ON tt.id = a.type_travaux_id
INNER JOIN ouvrage o ON o.id = ao.ouvrage_id
INNER JOIN projet p ON p.id = a.projet_id
WHERE (p.id IN (:idsProjet))
AND (:idPrestataire IS NULL OR a.prestataire_id = :idPrestataire)
GROUP BY tt.designation, o.designation;
```

### 2. listerQuantiteOuvrageParProjetUniquement(Long idProjet) - Native Query
**Description :** Liste les quantités d'ouvrages par projet uniquement

```sql
select tt.designation as type_travaux, o.designation as ouvrage, count(distinct a.localite_id) as nb_localite, sum(ao.quantite_a_realiser) as qte_a_realiser, sum(ao.quantite_realisee) as qte_realisee
from activite a
left join activite_ouvrage ao ON ao.activite_id = a.id
left join type_travaux tt ON tt.id = a.type_travaux_id
left join projet pr ON pr.id = a.projet_id
left join localite l ON l.id = a.localite_id
LEFT JOIN ouvrage o ON o.id = ao.ouvrage_id
where pr.id = :idProjet
group by tt.designation, o.designation
having (sum(ao.quantite_a_realiser) is null or  sum(ao.quantite_a_realiser)>0)
```

### 3. findAllByPrestataireWithQuantite()
**Description :** Trouve toutes les activités-ouvrages par prestataire avec quantité

```sql
SELECT ao FROM ActiviteOuvrage ao
JOIN FETCH ao.activite a
JOIN FETCH ao.ouvrage o
JOIN FETCH a.prestataire p
WHERE ao.quantiteARealiser > 0
ORDER BY p.designation, o.designation
```

### 4. findAllByProjetAndPrestataireWithQuantite()
**Description :** Trouve toutes les activités-ouvrages par projet et prestataire avec quantité

```sql
SELECT ao FROM ActiviteOuvrage ao
JOIN FETCH ao.activite a
JOIN FETCH ao.ouvrage o
JOIN FETCH a.projet p
JOIN FETCH a.prestataire pr
WHERE ao.quantiteARealiser > 0
ORDER BY p.designation, pr.designation, o.designation
```

### 5. findAllByLocaliteWithQuantite()
**Description :** Trouve toutes les activités-ouvrages par localité avec quantité

```sql
SELECT ao FROM ActiviteOuvrage ao
JOIN FETCH ao.activite a
JOIN FETCH ao.ouvrage o
JOIN FETCH a.localite l
WHERE ao.quantiteARealiser > 0
ORDER BY l.designation, o.designation
```

### 6. findAllCompleteWithQuantite()
**Description :** Trouve toutes les activités-ouvrages complètes avec quantité

```sql
SELECT ao FROM ActiviteOuvrage ao
JOIN FETCH ao.activite a
JOIN FETCH ao.ouvrage o
JOIN FETCH a.projet p
JOIN FETCH a.prestataire pr
JOIN FETCH a.typeTravaux tt
JOIN FETCH a.localite l
WHERE ao.quantiteARealiser > 0
ORDER BY p.designation, pr.designation, tt.designation, l.designation, o.designation
```

### 7. findAllCompleteWithQuantiteByProjetIds(List<Long> projetIds)
**Description :** Trouve toutes les activités-ouvrages complètes avec quantité par IDs de projets

```sql
SELECT ao FROM ActiviteOuvrage ao
JOIN FETCH ao.activite a
JOIN FETCH ao.ouvrage o
JOIN FETCH a.projet p
JOIN FETCH a.prestataire pr
JOIN FETCH a.typeTravaux tt
JOIN FETCH a.localite l
WHERE ao.quantiteARealiser > 0
AND p.id IN :projetIds
ORDER BY p.designation, pr.designation, tt.designation, l.designation, o.designation
```

### 8. findAllCompleteWithQuantiteByProjetIdsFiltre(List<Long> projetIds, String departement, String commune, String localite)
**Description :** Trouve toutes les activités-ouvrages complètes avec quantité par IDs de projets avec filtre

```sql
SELECT ao FROM ActiviteOuvrage ao
JOIN FETCH ao.activite a
JOIN FETCH ao.ouvrage o
JOIN FETCH a.projet p
JOIN FETCH a.prestataire pr
JOIN FETCH a.typeTravaux tt
JOIN FETCH a.localite l
JOIN FETCH l.commune c
JOIN FETCH c.departement d
WHERE ao.quantiteARealiser > 0
AND p.id IN :projetIds
AND (:departement is null or d.designation = :departement)
AND (:commune is null or c.designation = :commune)
AND (:localite is null or l.designation = :localite)
ORDER BY p.designation, pr.designation, tt.designation, l.designation, o.designation
```

### 9. findAllCompleteWithQuantite(Long prestataireId)
**Description :** Trouve toutes les activités-ouvrages complètes avec quantité par prestataire

```sql
SELECT ao FROM ActiviteOuvrage ao
JOIN FETCH ao.activite a
JOIN FETCH ao.ouvrage o
JOIN FETCH a.projet p
JOIN FETCH a.prestataire pr
JOIN FETCH a.typeTravaux tt
JOIN FETCH a.localite l
WHERE ao.quantiteARealiser > 0
AND pr.id = :prestataireId
ORDER BY p.designation, pr.designation, tt.designation, l.designation, o.designation
```

### 10. findAllCompleteWithQuantiteByProjetIds(List<Long> projetIds, Long prestataireId)
**Description :** Trouve toutes les activités-ouvrages complètes avec quantité par IDs de projets et prestataire

```sql
SELECT ao FROM ActiviteOuvrage ao
JOIN FETCH ao.activite a
JOIN FETCH ao.ouvrage o
JOIN FETCH a.projet p
JOIN FETCH a.prestataire pr
JOIN FETCH a.typeTravaux tt
JOIN FETCH a.localite l
WHERE ao.quantiteARealiser > 0
AND p.id IN :projetIds 
AND pr.id = :prestataireId
ORDER BY p.designation, pr.designation, tt.designation, l.designation, o.designation
```

### 11. getTepPourcentage(Long projetId) - Native Query
**Description :** Calcul du TEP (Taux d'Exécution Physique)

```sql
-- Version DBeaver (SQL natif)
SELECT 
    ROUND(
        CASE 
            WHEN SUM(ao.quantite_a_realiser) > 0
            THEN (SUM(ao.quantite_realisee) / SUM(ao.quantite_a_realiser)) * 100
            ELSE 0
        END,
        2
    ) AS tep_pourcentage
FROM activite a
INNER JOIN activite_ouvrage ao ON ao.activite_id = a.id
INNER JOIN phase ph ON ph.id = a.phase_id
INNER JOIN projet p ON p.id = ph.projet_id
WHERE p.id = :projetId;
```

### 12. listerQuantiteOuvrageParProjetGoupeParTypeTravauxEtQuantiteOuvrage(Long idProjet) - Native Query
**Description :** Liste les quantités d'ouvrages par projet groupées par types de travaux et quantité ouvrage

```sql
SELECT tt.id as type_travaux_id,tt.designation as type_travaux, o.id as ouvrage_id, o.designation as ouvrage, l.designation as localite, l.id as id_localite, count(distinct a.localite_id) as nb_localite, sum(ao.quantite_a_realiser) as qte_a_realiser, sum(ao.quantite_realisee) as qte_realisee, a.id as activite_id, ao.id as activite_ouvrage_id
FROM activite a
LEFT JOIN activite_ouvrage ao ON ao.activite_id = a.id
LEFT JOIN type_travaux tt ON tt.id = a.type_travaux_id
LEFT JOIN projet pr ON pr.id = a.projet_id
LEFT JOIN localite l ON l.id = a.localite_id
LEFT JOIN ouvrage o ON o.id = ao.ouvrage_id
where pr.id = :idProjet
GROUP BY tt.id, tt.designation,o.id, o.designation, l.designation, l.id, a.id, ao.id
ORDER BY tt.designation, o.designation
```

### 13. findByOuvrageAndActivite(Ouvrage ouvrage, Activite activite)
**Description :** Trouve une activité-ouvrage par ouvrage et activité (méthode Spring Data JPA)

### 14. findByActiviteId(Long activiteId)
**Description :** Trouve tous les ouvrages d'une activité donnée

```sql
SELECT ao FROM ActiviteOuvrage ao
JOIN FETCH ao.ouvrage o
WHERE ao.activite.id = :activiteId
ORDER BY o.designation
```

### 15. listerQuantiteOuvrageParProjetAvecCout(List<Long> projetIds) - Native Query
**Description :** Requête pour lister les quantités d'ouvrages par projet avec coûts

```sql
select 	
		 p.abbreviation as projet_localite,
         tt.designation as type_travaux,
         o.designation as ouvrage,
         count(distinct a.localite_id) as nb_localite,
         sum(ao.quantite_a_realiser) as qte_a_realiser,
         sum(ao.quantite_realisee) as qte_realisee,
         o.cout_unitaire as cout_unitaire_ouvrage,
         sum(ao.quantite_a_realiser * o.cout_unitaire) as cout_total_prevu,
         sum(case when ao.quantite_realisee > 0 then ao.quantite_realisee * o.cout_unitaire else 0 end) as cout_total_realise
     from activite a
     inner join activite_ouvrage ao on ao.activite_id = a.id
     inner join type_travaux tt on tt.id = a.type_travaux_id
     inner join ouvrage o on o.id = ao.ouvrage_id
     inner join localite l on l.id = a.localite_id
     inner join commune c on c.id = l.commune_id
     inner join departement d on d.id = c.departement_id
     inner join phase ph on ph.id = a.phase_id
     inner join projet p on ph.projet_id = p.id
     where p.id in :projetIds
     group by p.abbreviation, tt.designation, o.designation, o.cout_unitaire
     having sum(ao.quantite_a_realiser) > 0
```

### 16. budgetPrevisionnelPrestaitaireEnFonctionDesActivites(Long prestataireId, Long projetId) - Native Query
**Description :** Calcule le budget prévisionnel d'un prestataire en fonction de la quantité des ouvrages à réaliser

```sql
-- Version DBeaver (SQL natif)
SELECT 
    COALESCE(SUM(ao.quantite_a_realiser * o.cout_unitaire), 0) as budget_prevu,
    COALESCE(SUM(ao.quantite_realisee * o.cout_unitaire), 0) as budget_realise
FROM activite a
INNER JOIN activite_ouvrage ao ON ao.activite_id = a.id
INNER JOIN type_travaux tt ON tt.id = a.type_travaux_id
INNER JOIN projet pr ON pr.id = a.projet_id
INNER JOIN localite l ON l.id = a.localite_id
INNER JOIN ouvrage o ON o.id = ao.ouvrage_id
WHERE a.prestataire_id = :prestataireId AND pr.id = :projetId;
```

### 17. tepEtTefParPrestataireEtProjet(Long prestataireId, Long projetId) - Native Query
**Description :** Calcule le TEP et le TEF d'un prestataire en fonction du projet sélectionné

```sql
-- Version DBeaver (SQL natif)
SELECT
	CASE
		WHEN SUM(ao.quantite_a_realiser) > 0
		THEN ROUND((SUM(ao.quantite_realisee) / SUM(ao.quantite_a_realiser)) * 100, 2)
		ELSE 0
	END as tep_pourcentage,
	CASE
		WHEN SUM(ao.quantite_a_realiser * o.cout_unitaire) > 0
		THEN ROUND((SUM(ao.quantite_realisee * o.cout_unitaire) / SUM(ao.quantite_a_realiser * o.cout_unitaire)) * 100, 2)
		ELSE 0
	END as tef_pourcentage
FROM activite a
INNER JOIN activite_ouvrage ao ON ao.activite_id = a.id
INNER JOIN projet pr ON pr.id = a.projet_id
INNER JOIN ouvrage o ON o.id = ao.ouvrage_id
WHERE pr.id = :projetId AND a.prestataire_id = :prestataireId;
```

---

## ActiviteRepository

### 1. findByLocaliteId(Long localiteId)
**Description :** Trouve toutes les activités pour une localité donnée (méthode Spring Data JPA)

### 2. listerParLocaliteAvecDetails(Set<Long> projetIds) - Native Query
**Description :** Liste les activités par localité avec détails

```sql
-- Version DBeaver (SQL natif)
SELECT 
    d.designation as departement,
    c.designation as commune,
    l.id as localite_id,
    l.designation as localite_designation,
    a.id as activite_id,
    a.code as activite_code,
    a.designation as activite_designation,
    a.statut as activite_statut,
    a.ponderation as activite_ponderation,
    a.progression as activite_progression,
    a.date_previsionnelle_debut as activite_date_debut_prev,
    a.date_previsionnelle_fin as activite_date_fin_prev,
    a.date_reelle_debut as activite_date_debut_reel,
    a.date_reelle_fin as activite_date_fin_reel,
    a.date_livraison_previsionnelle as activite_date_livraison_prev,
    a.date_livraison_reelle as activite_date_livraison_reelle,
    a.date_mise_en_service_previsionnelle as activite_date_mise_en_service_prev,
    a.date_mise_en_service_reelle as activite_date_mise_en_service_reelle,
    a.cout_estime as activite_cout_estime,
    a.cout_reel as activite_cout_reel,
    COALESCE(rh.nom, '') as responsable_nom,
    COALESCE(tt.designation, '') as type_travaux_designation,
    COALESCE(p.designation, '') as prestataire_nom,
    COALESCE(ph.designation, '') as phase_designation,
    COALESCE(pr.designation, '') as projet_designation
FROM activite a
INNER JOIN localite l ON l.id = a.localite_id
INNER JOIN commune c ON c.id = l.commune_id
INNER JOIN departement d ON d.id = c.departement_id
LEFT JOIN ressource_humaine rh ON rh.id = a.responsable_id
LEFT JOIN type_travaux tt ON tt.id = a.type_travaux_id
LEFT JOIN prestataire p ON p.id = a.prestataire_id
LEFT JOIN phase ph ON ph.id = a.phase_id
LEFT JOIN projet pr ON pr.id = ph.projet_id
WHERE pr.id IN (:projetIds)
ORDER BY d.designation, c.designation, l.designation;
```

### 3. listerParLocaliteAvecDetailsFiltre(Set<Long> projetIds, String departement, String commune, String localite) - Native Query
**Description :** Liste les activités par localité avec détails et filtres

```sql
select 
    d.designation as departement,
    c.designation as commune,
    l.id as localite_id,
    l.designation as localite_designation,
    a.id as activite_id,
    a.code as activite_code,
    c.designation as activite_designation,
    a.statut as activite_statut,
    a.ponderation as activite_ponderation,
    a.progression as activite_progression,
    a.date_previsionnelle_debut as activite_date_debut_prev,
    a.date_previsionnelle_fin as activite_date_fin_prev,
    a.date_reelle_debut as activite_date_debut_reel,
    a.date_reelle_fin as activite_date_fin_reel,
    a.date_livraison_previsionnelle as activite_date_livraison_prev,
    a.date_livraison_reelle as activite_date_livraison_reelle,
    a.date_mise_en_service_previsionnelle as activite_date_mise_en_service_prev,
    a.date_mise_en_service_reelle as activite_date_mise_en_service_reelle,
    a.cout_estime as activite_cout_estime,
    a.cout_reel as activite_cout_reel,
    COALESCE(rh.nom, '') as responsable_nom,
    COALESCE(tt.designation, '') as type_travaux_designation,
    COALESCE(p.designation, '') as prestataire_nom,
    COALESCE(ph.designation, '') as phase_designation,
    COALESCE(pr.designation, '') as projet_designation
from activite a
inner join localite l on l.id = a.localite_id
inner join commune c on c.id = l.commune_id
inner join departement d on d.id = c.departement_id
left join ressource_humaine rh on rh.id = a.responsable_id
left join type_travaux tt on tt.id = a.type_travaux_id
left join prestataire p on p.id = a.prestataire_id
left join phase ph on ph.id = a.phase_id
left join projet pr on pr.id = ph.projet_id
where pr.id in :projetIds
and (:departement is null or d.designation = :departement)
and (:commune is null or c.designation = :commune)
and (:localite is null or l.designation = :localite)
order by d.designation, c.designation, l.designation
```

### 4. findByPrestataire(Prestataire prestataire)
**Description :** Trouve toutes les activités pour un prestataire donné (méthode Spring Data JPA)

### 5. countByProjet(Projet projet)
**Description :** Compte les activités par projet (méthode Spring Data JPA)

### 6. countByPrestataire(Prestataire prestataire)
**Description :** Compte les activités par prestataire (méthode Spring Data JPA)

### 7. countByProjetAndPrestataire(Projet projet, Prestataire prestataire)
**Description :** Compte les activités par projet ET prestataire (méthode Spring Data JPA)

### 8. recupererRepartitionActiviteParProjetEtParPrestataire(Long idPrestataire, Long idProjet) - Native Query
**Description :** Récupère la répartition des activités par projet et par prestataire

```sql
-- Version DBeaver (SQL natif)
WITH total_prevu AS (
    SELECT p1.id AS projet_id,
           SUM(ao1.quantite_a_realiser) AS total_prevu_projet
    FROM activite_ouvrage ao1
    INNER JOIN activite a1 ON a1.id = ao1.activite_id
    INNER JOIN projet p1 ON p1.id = a1.projet_id
    WHERE p1.id = :idProjet
    GROUP BY p1.id
),
prestataire_group AS (
    SELECT
        CASE
            WHEN a.prestataire_id = :idPrestataire THEN pr.designation
            WHEN a.prestataire_id IS NULL THEN 'Non attribué'
            ELSE 'Autres'
        END AS prestataire,
        ao.quantite_a_realiser
    FROM projet p
    INNER JOIN activite a ON a.projet_id = p.id
    INNER JOIN type_travaux tt ON a.type_travaux_id = tt.id
    INNER JOIN activite_ouvrage ao ON ao.activite_id = a.id
    LEFT JOIN prestataire pr ON a.prestataire_id = pr.id
    WHERE p.id = :idProjet
)
SELECT
    pg.prestataire,
    SUM(pg.quantite_a_realiser) AS quantite_prevue,
    ROUND(
        COALESCE(
            CASE
               WHEN t.total_prevu_projet = 0 THEN NULL
               ELSE SUM(pg.quantite_a_realiser) * 100.0 / t.total_prevu_projet
            END
        , 0)
    , 2) AS part_prestataire
FROM prestataire_group pg
CROSS JOIN total_prevu t
GROUP BY pg.prestataire, t.total_prevu_projet
ORDER BY pg.prestataire;
```

### 9. findByLocaliteAndProjetAndTypeTravaux(Localite localite, Projet projet, TypeTravaux typeTravaux)
**Description :** Trouve une activité par localité, projet et type de travaux (méthode Spring Data JPA)

### 10. findDistinctLocalitesByProjetId(@Param("projetId") Long projetId)
**Description :** Trouve les localités distinctes par ID de projet

```sql
SELECT DISTINCT a.localite
FROM Activite a
WHERE a.projet.id = :projetId
```

---

## ProjetPrestataireRepository

### 1. findByPrestataire(Prestataire prestataire)
**Description :** Trouve les projets-prestataires par prestataire (méthode Spring Data JPA)

### 2. findByPrestataireAndProjetIdIn(Prestataire prestataire, Collection<Long> projetCodes)
**Description :** Trouve les projets-prestataires par prestataire et IDs de projets (méthode Spring Data JPA)

### 3. findByProjet(Projet projet)
**Description :** Trouve les projets-prestataires par projet (méthode Spring Data JPA)

### 4. findByProjetAndPrestataire(Projet projet, Prestataire prestataire)
**Description :** Trouve un projet-prestataire par projet et prestataire (méthode Spring Data JPA)

### 5. budgetTotalPrestataire(Long projetId) - Native Query
**Description :** Calcule le budget total des prestataires pour un projet

```sql
-- Version DBeaver (SQL natif)
SELECT SUM(pp.budget_projet) as budget_total_prestataires
FROM projet_prestataire pp
WHERE pp.projet_id = :projetId;
```

---

## MontantPrestataireProjetRepository

### 1. countBudgetDonneByProjetPrestataire(Long projetPrestataireId) - Native Query
**Description :** Compte le budget donné par projet-prestataire

```sql
-- Version DBeaver (SQL natif)
SELECT SUM(mpp.montant_donne) as budget_donne_total
FROM montant_prestataire_projet mpp 
INNER JOIN projet_prestataire pp ON pp.id = mpp.projet_prestataire_id 
WHERE pp.id = :projetPrestataireId;
```

---

## UtilisateurRepository

### 1. rechercherParUsername(String username)
**Description :** Recherche un utilisateur par nom d'utilisateur

```sql
-- Version DBeaver (SQL natif)
SELECT 
    u.id as utilisateur_id,
    u.username as username,
    u.email as email,
    u.actif as actif,
    u.date_creation as date_creation
FROM utilisateur u 
WHERE TRIM(BOTH FROM u.username) = :username;
```

---

## PhaseRepository

### 1. Requête commentée
**Description :** Une requête commentée pour trouver toutes les phases par projet

```java
// @Query("")
// List<Phase> findAllByProjet(List<Long> phaseIds);
```

---

## Repositories sans requêtes personnalisées

Les repositories suivants n'ont que les méthodes CRUD de base héritées de `JpaRepository` :

- **RoleRepository** - Gestion des rôles
- **TemoignageRepository** - Gestion des témoignages  
- **RessourceHumaineRepository** - Gestion des ressources humaines
- **RisqueRepository** - Gestion des risques
- **RealisationRepository** - Gestion des réalisations
- **ProgrammeRepository** - Gestion des programmes
- **MontantEngageRepository** - Gestion des montants engagés
- **OuvrageRepository** - Gestion des ouvrages
- **DifficulteRepository** - Gestion des difficultés
- **EquipeProjetRepository** - Gestion des équipes de projet
- **DocumentProjetRepository** - Gestion des documents de projet
- **AffectationRepository** - Gestion des affectations
- **TypeTravauxRepository** - Gestion des types de travaux

---

## Résumé

Ce projet contient **24 repositories** au total :
- **12 repositories** avec des requêtes personnalisées
- **12 repositories** utilisant uniquement les méthodes CRUD de base

### Requêtes transformées pour DBeaver :

Les requêtes les plus importantes transformées sont :

1. **ProjetRepository** (8 requêtes) :
   - `findProjetsParBailleurAvecLocalites()` - Projets groupés par bailleur
   - `getStatistiquesPrestatairesPourProjet()` - Statistiques détaillées des prestataires
   - `getDetailsLocalitesPourProjet()` - Détails par localité avec ouvrages spécifiques

2. **ActiviteOuvrageRepository** (17 requêtes) :
   - `getTepPourcentage()` - Calcul du TEP (Taux d'Exécution Physique)
   - `budgetPrevisionnelPrestaitaireEnFonctionDesActivites()` - Budget prévisionnel prestataire
   - `tepEtTefParPrestataireEtProjet()` - Calcul TEP et TEF par prestataire

3. **FinancementRepository** (5 requêtes) :
   - `rechercherFinancementsParProjet()` - Financements avec pourcentages
   - `calculerTefParBailleur()` - Calcul TEF par bailleur
   - `calculerTefParProjet()` - Calcul TEF par projet

4. **ActiviteRepository** (10 requêtes) :
   - `listerParLocaliteAvecDetails()` - Activités par localité avec détails
   - `recupererRepartitionActiviteParProjetEtParPrestataire()` - Répartition des activités

5. **LocaliteRepository** (5 requêtes) :
   - `listerQuantiteParProjet()` - Quantités par projet
   - `listerParProjet()` - Localités par projet

### Fonctionnalités couvertes :

- **Gestion des projets** et leur suivi détaillé
- **Calcul des indicateurs** (TEP, TEF) pour le suivi de performance
- **Statistiques par prestataire** avec répartition des activités
- **Répartition géographique** des activités par département/commune/localité
- **Suivi financier** des projets avec budgets et montants engagés
- **Analyse des ouvrages** par type de travaux et quantités

### Notes importantes :

- Toutes les requêtes utilisent des **paramètres nommés** qu'il faut définir dans DBeaver
- Les requêtes sont optimisées pour **PostgreSQL** avec des fonctions spécifiques
- Certaines requêtes utilisent des **CTE (Common Table Expressions)** pour des calculs complexes
- Les performances peuvent être améliorées avec des **index appropriés**

---

*Document transformé pour DBeaver avec paramètres nommés le 26 septembre 2025*
