export interface Magasin {
    id?: number;            // Identifiant unique
    nom: string;            // Nom du magasin
    typeMagasin?: string;   // Type de magasin (Central, Annexe, etc.)
    localisation?: string;  // Adresse ou zone du magasin
}
