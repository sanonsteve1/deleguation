import { Direction } from './direction';
import { NiveauTension } from './niveau-tension';
import { ModeFacturation } from './mode-facturation';
import { CategorieClient } from './categorie-client';

/**
 * Modèle pour les données mensuelles d'un mois spécifique
 */
export interface DonneesMensuelles {
    mois: number;
    annee: number;
    consommationKwh: number;
    montantConsommationFcfa: number; // Valeur de la consommation en FCFA
    montantPayeFcfa: number;
    montantImpayeFcfa: number;
}

/**
 * Modèle pour la réponse des statistiques mensuelles
 */
export interface StatistiquesMensuellesResponse {
    donneesMensuelles: DonneesMensuelles[];
    directions: Direction[];
    niveauxTension: NiveauTension[];
    modesFacturation: ModeFacturation[];
    categoriesClient: CategorieClient[];
}
