import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StatistiqueMensuelleResponsesKPIStock } from '../models/statistique-mensuelle-responses-kpi-stock';

@Injectable({
    providedIn: 'root',
})
export class KpiStockService {
    private url = '/ws/statistiques-kpi-stock';

    constructor(private http: HttpClient) {}

    /**
     * Récupère les statistiques mensuelles KPI Stock
     * @param mois Optionnel : mois (1 à 12)
     * @param annee Optionnel : année
     */
    getStatistiquesMensuellesKPIStock(
        mois?: number,
        annee?: number
    ): Observable<StatistiqueMensuelleResponsesKPIStock> {
        let params = new HttpParams();

        if (mois !== null && mois !== undefined) {
            params = params.set('mois', mois.toString());
        }
        if (annee !== null && annee !== undefined) {
            params = params.set('annee', annee.toString());
        }

        return this.http.get<StatistiqueMensuelleResponsesKPIStock>(
            `${this.url}/mensuelles`,
            { params }
        );
    }

    /**
     * Récupère la liste des statuts distincts des commandes
     * @returns Observable avec la liste des statuts
     */
    getStatutsDistincts(): Observable<string[]> {
        return this.http.get<string[]>(`${this.url}/statuts`);
    }
}
