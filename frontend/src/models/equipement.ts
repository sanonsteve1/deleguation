export interface Equipement {
    id?: number;             // Identifiant unique (optionnel à la création)
    codeEquipement: string;  // Code unique de l'équipement
    libelle: string;         // Nom ou désignation
    categorie?: string;      // Catégorie de l'équipement (ancien champ pour compatibilité)
    idCategorie?: number;   // ID de la catégorie d'équipement
    codeCategorie?: string;  // Code de la catégorie d'équipement
    libelleCategorie?: string; // Libellé de la catégorie d'équipement
    uniteMesure?: string;    // Unité de mesure (ex : pièce, mètre)
    coutUnitaire?: number;   // Coût unitaire en FCFA
}
