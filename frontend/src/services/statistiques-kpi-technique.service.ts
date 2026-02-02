import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StatistiqueMensuelleResponsesKpiTechnique } from '../models/statistique-mensuelles-responses-kpi-technique';

@Injectable({
    providedIn: 'root',
})
export class StatistiquesKPITechniqueService {
    private url = '/ws/statistiques-kpi-technique';

    constructor(private http: HttpClient) {}

    getStatistiquesMensuellesKPI(
        mois?: number,
        annee?: number,
        niveauTensionId?: number
    ): Observable<StatistiqueMensuelleResponsesKpiTechnique> {
        let params = new HttpParams();

        if (mois !== null && mois !== undefined) {
            params = params.set('mois', mois.toString());
        }
        if (annee !== null && annee !== undefined) {
            params = params.set('annee', annee.toString());
        }
        if (niveauTensionId !== null && niveauTensionId !== undefined) {
            params = params.set('niveauTensionId', niveauTensionId.toString());
        }

        return this.http.get<StatistiqueMensuelleResponsesKpiTechnique>(
            `${this.url}/mensuelles`,
            { params }
        );
    }
}
