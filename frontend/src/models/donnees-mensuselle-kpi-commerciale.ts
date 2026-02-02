export interface DonneesMensuellesKPICommercial {
	mois: number;
	annee: number;
	consommationKwh: number;
	montantConsomme: number;
	nombreAbonne: number;
	nombreBranchements?: number;
    tauxRecouvrement: number;// Optionnel - nombre de branchements pour le mois
}
