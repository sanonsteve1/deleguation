// DonneesMensuelKpiDsi.ts
export interface DonneesMensuelKpiDsi {
    mois: number;
    annee: number;

    tauxDisponibilite: number; // ou Double -> number en TS
    tempsTotalMois: number;
    tempsIndisponibiliteMois: number
}
