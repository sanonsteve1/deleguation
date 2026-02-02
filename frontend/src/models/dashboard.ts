import {EffectifCumul} from './effectif-cumul.model';
import {StatistiqueMensuelleResponsesKPICommercial} from './statistique-mensuelles-responses-kpi-commercial';
import {StatistiqueMensuelleResponsesKpiTechnique} from './statistique-mensuelles-responses-kpi-technique';
import {StatistiqueMensuelKpiDsi} from './StatistiqueMensuelKpiDsi';
import {StatistiqueKpiFinance} from "./EvolutionsKpiFinanceResponse.model";
import {StatistiqueMensuelleResponsesKPIStock} from "./statistique-mensuelle-responses-kpi-stock";


/**
 * Interface représentant les indicateurs du tableau de bord général.
 */
export interface Dashboard {
    /** Effectif cumulé global */
    effectifCumule: EffectifCumul | null;

    /** Statistiques mensuelles KPI commerciales */
    statistiquesCommerciales: StatistiqueMensuelleResponsesKPICommercial | null;

    /** Statistiques mensuelles KPI techniques */
    statistiquesTechniques: StatistiqueMensuelleResponsesKpiTechnique | null;
    /** Statistiques mensuelles KPI techniques */
    statistiquesKpiDSI: StatistiqueMensuelKpiDsi | null;
    statistiquesFinances: StatistiqueKpiFinance | null;

    /** Statistiques mensuelles KPI Stock**/
    statistiquesStock :  StatistiqueMensuelleResponsesKPIStock | null

}
