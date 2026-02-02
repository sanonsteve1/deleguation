import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {StatistiqueKpiFinance} from "../models/EvolutionsKpiFinanceResponse.model";

@Injectable({
    providedIn: 'root'
})
export class StatistiquesKPIFinanceService {

    private url = '/ws/statistiques-kpi-finance';

    constructor(private http: HttpClient) {}

    /**
     * Récupère toutes les évolutions KPI Finance (CA, CAPEX, OPEX)
     * sans filtre d'année ni de mois.
     */
    getAllEvolutionsKpiFinance(mois?: number, annee?: number,): Observable<StatistiqueKpiFinance> {
        let params = new HttpParams();

        if (mois !== null && mois !== undefined) {
            params = params.set('mois', mois.toString());
        }
        if (annee !== null && annee !== undefined) {
            params = params.set('annee', annee.toString());
        }
        return this.http.get<StatistiqueKpiFinance>(`${this.url}/mensuelles`, { params });
    }
}

