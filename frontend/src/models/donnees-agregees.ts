/**
 * Modèle pour les données agrégées du graphique
 * BLEU : Consommation (kWh)
 * VERT : Montant payé (FCFA)
 * ROUGE : Montant impayé (FCFA)
 */
export interface DonneesAgregees {
    consommationKwhTotal: number;
    montantPayeTotal: number;
    montantImpayeTotal: number;
}
