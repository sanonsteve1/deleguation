// src/app/models/statistiques-mensuelles-kpi-taux-recouvrement.model.ts
import { DonneesMensuellesKpiTauxRecouvrement } from './donnees-mensuselle-kpi-taux-recouvrement';
import { DonneesKpiTauxRecouvrementParDirection } from './donnees-mensuselle-kpi-taux-recouvrement-par-direction';
import { NiveauTension } from './niveau-tension';
import { Direction } from './direction';

export interface StatistiquesMensuellesResponsesKpiTauxRecouvrement {
    donneesMensuellesKpiRecouvrementGeneral: DonneesMensuellesKpiTauxRecouvrement[];
    donneesKpiTauxRecouvrementParDirectionGeneral: DonneesKpiTauxRecouvrementParDirection[];
    tauxRecouvrementCumule: number;
    tauxRecouvrementMoisFacturation: number;
    nombreFacturation: number;
    niveauxTension: NiveauTension[];
    directions: Direction[];
}
