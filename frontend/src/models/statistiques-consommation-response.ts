import { DonneesAgregees } from './donnees-agregees';
import { Direction } from './direction';
import { NiveauTension } from './niveau-tension';
import { ModeFacturation } from './mode-facturation';
import { CategorieClient } from './categorie-client';

/**
 * Modèle pour la réponse des statistiques de consommation
 */
export interface StatistiquesConsommationResponse {
    donneesAgregees: DonneesAgregees;
    directions: Direction[];
    niveauxTension: NiveauTension[];
    modesFacturation: ModeFacturation[];
    categoriesClient: CategorieClient[];
}
