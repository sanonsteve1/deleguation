import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConsommationParDirection } from '../models/consommation-par-direction';
import { StatistiquesConsommationResponse } from '../models/statistiques-consommation-response';
import { StatistiquesMensuellesResponse } from '../models/statistiques-mensuelles-response';

@Injectable({
    providedIn: 'root'
})
export class StatistiquesConsommationService {
    private url = '/ws/statistiques-consommation';

    constructor(private http: HttpClient) {}

    getStatistiquesAgregees(annee: number, mois?: number, directionId?: number, niveauTensionId?: number, modeFacturationId?: number, categorieClientId?: number): Observable<StatistiquesConsommationResponse> {
        let params = new HttpParams().set('annee', annee.toString());

        if (mois !== null && mois !== undefined) {
            params = params.set('mois', mois.toString());
        }
        if (directionId !== null && directionId !== undefined) {
            params = params.set('directionId', directionId.toString());
        }
        if (niveauTensionId !== null && niveauTensionId !== undefined) {
            params = params.set('niveauTensionId', niveauTensionId.toString());
        }
        if (modeFacturationId !== null && modeFacturationId !== undefined) {
            params = params.set('modeFacturationId', modeFacturationId.toString());
        }
        if (categorieClientId !== null && categorieClientId !== undefined) {
            params = params.set('categorieClientId', categorieClientId.toString());
        }

        return this.http.get<StatistiquesConsommationResponse>(`${this.url}/agregees`, { params });
    }

    getStatistiquesMensuelles(annee: number, directionId?: number, niveauTensionId?: number, modeFacturationId?: number, categorieClientId?: number): Observable<StatistiquesMensuellesResponse> {
        let params = new HttpParams().set('annee', annee.toString());

        if (directionId !== null && directionId !== undefined) {
            params = params.set('directionId', directionId.toString());
        }
        if (niveauTensionId !== null && niveauTensionId !== undefined) {
            params = params.set('niveauTensionId', niveauTensionId.toString());
        }
        if (modeFacturationId !== null && modeFacturationId !== undefined) {
            params = params.set('modeFacturationId', modeFacturationId.toString());
        }
        if (categorieClientId !== null && categorieClientId !== undefined) {
            params = params.set('categorieClientId', categorieClientId.toString());
        }

        return this.http.get<StatistiquesMensuellesResponse>(`${this.url}/mensuelles`, { params });
    }

    getConsommationsParDirection(
        annee: number,
        mois?: number,
        niveauTensionId?: number,
        modeFacturationId?: number,
        categorieClientId?: number
    ): Observable<ConsommationParDirection[]> {
        let params = new HttpParams().set('annee', annee.toString());

        if (mois !== null && mois !== undefined) {
            params = params.set('mois', mois.toString());
        }
        if (niveauTensionId !== null && niveauTensionId !== undefined) {
            params = params.set('niveauTensionId', niveauTensionId.toString());
        }
        if (modeFacturationId !== null && modeFacturationId !== undefined) {
            params = params.set('modeFacturationId', modeFacturationId.toString());
        }
        if (categorieClientId !== null && categorieClientId !== undefined) {
            params = params.set('categorieClientId', categorieClientId.toString());
        }

        return this.http.get<ConsommationParDirection[]>(
            `${this.url}/par-direction`,
            { params }
        );
    }
}
