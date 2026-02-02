// StatistiqueMensuelKpiDsiDto.ts
import {DonneesMensuelKpiDsi} from './DonneesMensuelKpiDsi';

export interface StatistiqueMensuelKpiDsi {
    donneesMensuelles: DonneesMensuelKpiDsi[];
    tauxDisponibiliteAnnuel: number;
    tempsTotalAnnuel: number;
    tempsIndisponibiliteAnnuel: number;
}
