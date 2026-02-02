import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Dashboard } from '../models/dashboard';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private url = '/ws/dashboard';

    constructor(private http: HttpClient) {}

    /**
     * Récupère les indicateurs synthétiques du tableau de bord global.
     * @param annee année cible (ex: 2024)
     * @returns un objet DashboardDto contenant le taux de recouvrement général.
     */
    getDashboard(annee: number): Observable<Dashboard> {
        const params = new HttpParams().set('annee', annee.toString());
        return this.http.get<Dashboard>(`${this.url}`, { params });
    }
}
