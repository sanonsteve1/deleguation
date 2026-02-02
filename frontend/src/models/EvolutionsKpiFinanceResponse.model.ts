import {DonneesMensuellesKpiFinance} from "./donneesMensuellesKpiFinance.model";


export interface StatistiqueKpiFinance {
    evolutionCa: DonneesMensuellesKpiFinance[];
    evolutionCapex: DonneesMensuellesKpiFinance[];
    evolutionOpex: DonneesMensuellesKpiFinance[];
    ratioOpexCa: DonneesMensuellesKpiFinance[];
    cumulAnnuelCa: number;
    cumulAnnuelCapex: number;
    cumulAnnuelOpex: number;
    cumulAnnuelRatio: number;
    cumulMensuelCa: number;
    cumulMensuelCapex: number;
    cumulMensuelOpex: number;
    cumulMensuelRatio: number;
}
