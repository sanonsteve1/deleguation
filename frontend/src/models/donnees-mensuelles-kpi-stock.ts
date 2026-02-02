export interface DonneesMensuellesKpiStock {
    mois: number;                 // Mois concerné (1 à 12)
    annee: number;                // Année de référence
    valeurTotaleStock: number;    // Valeur totale du stock (FCFA)
    tauxRotationValeur: number;   // Taux de rotation du stock (%)
    valeurStockMoyen: number;     // Valeur moyenne du stock (FCFA)
}
