export interface CommandeTraitee {
    numeroCommande: string;
    dateCommande: string; // ISO date string
    dateReceptionEffective?: string; // ISO date string, optional
    statut: string;
    montantTotal: number;
    nomFournisseur: string;
}

