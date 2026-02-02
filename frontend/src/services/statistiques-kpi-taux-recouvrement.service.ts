import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StatistiquesMensuellesResponsesKpiTauxRecouvrement } from '../models/statistique-mensuelles-responses-kpi-taux-recouvrement';

@Injectable({
    providedIn: 'root',
})
export class StatistiquesKpiTauxRecouvrementService {
    private url = '/ws/kpi-taux-recouvrement';

    constructor(private http: HttpClient) {}

    /**
     * Récupère les statistiques mensuelles du taux de recouvrement
     * @param mois Optionnel : numéro du mois (1-12)
     * @param annee Année
     * @param directionId Optionnel : ID de la direction
     * @param niveauTensionId Optionnel : ID du niveau de tension
     * @returns Observable de StatistiquesMensuellesResponsesKpiTauxRecouvrement
     */
    getStatistiquesMensuellesTauxRecouvrement(
        mois?: number,
        annee?: number,
        directionId?: number,
        niveauTensionId?: number
    ): Observable<StatistiquesMensuellesResponsesKpiTauxRecouvrement> {
        let params = new HttpParams();

        if (mois !== null && mois !== undefined) {
            params = params.set('mois', mois.toString());
        }
        if (annee !== null && annee !== undefined) {
            params = params.set('annee', annee.toString());
        }
        if (directionId !== null && directionId !== undefined) {
            params = params.set('directionId', directionId.toString());
        }
        if (niveauTensionId !== null && niveauTensionId !== undefined) {
            params = params.set('niveauTensionId', niveauTensionId.toString());
        }

        return this.http.get<StatistiquesMensuellesResponsesKpiTauxRecouvrement>(
            `${this.url}/mensuelles`,
            { params }
        );
    }
}
