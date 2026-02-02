import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {StatistiqueMensuelKpiDsi} from '../models/StatistiqueMensuelKpiDsi';


@Injectable({
    providedIn: 'root',
})
export class StatistiquesKPIDsiService {
    private url = '/ws/disponibilite';

    constructor(private http: HttpClient) {
    }

    getStatistiquesMensuelles(annee?: number, mois?: number): Observable<StatistiqueMensuelKpiDsi> {
        let params = new HttpParams();
        if (mois) params = params.set('mois', mois.toString());
        if (annee) params = params.set('annee', annee.toString());

        return this.http.get<StatistiqueMensuelKpiDsi>(`${this.url}/statistiques`, {params});
    }

}
