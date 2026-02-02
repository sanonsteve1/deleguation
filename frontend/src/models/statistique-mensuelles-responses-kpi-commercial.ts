import { DonneesMensuellesKPICommercial } from './donnees-mensuselle-kpi-commerciale';
import { NiveauTension } from './niveau-tension';
import { ModeFacturation } from './mode-facturation';
import {TaxePrepaye} from "./taxe-prepaye";
import {TaxePostpaye} from "./taxe-postpaye";

export interface StatistiqueMensuelleResponsesKPICommercial {
	donneesMensuelleGenerale: DonneesMensuellesKPICommercial[];
	donneesMensuelleMT: DonneesMensuellesKPICommercial[];
	donneesMensuelleBT: DonneesMensuellesKPICommercial[];
    evolutionTauxRecouvrement: DonneesMensuellesKPICommercial[];

	totalAbonnesPostpaye: number;
	totalAbonnesPrepaye: number;
	totalVenteMT: number;
	totalVenteBT: number;
    totalVenteBTEtMT: number;

	consommationKwhMois: number;
	consommationFcfaMois: number;

	cumulConsommationKwh: number;
	cumulConsommationFcfa: number;
    cumulBranchement: number;
    cumulAbonnes: number;

	abonnesMois: number;
	abonnesMoisMT: number;
	abonnesMoisBT: number;
	abonneMoisPostpaye: number;
	abonneMoisPrepaye: number;
    nombreBranchementMois: number;

	// Données de branchements (optionnelles pour le moment)
	nombreBranchementsMois?: number;
	nombreBranchementsMoisPrecedent?: number;

	// Taux de rendement (optionnel)
	tauxRendementMois?: number;

	// Taux de recouvrement (optionnel)
	tauxRecouvrementMois?: number;
	tauxRecouvrementCumule?: number;

	taxePrepaye: TaxePrepaye;
	taxePostpaye: TaxePostpaye;

	niveauxTension: NiveauTension[];
	modesFacturation: NiveauTension[];
}
