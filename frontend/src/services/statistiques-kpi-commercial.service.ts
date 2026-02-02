import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StatistiqueMensuelleResponsesKPICommercial } from '../models/statistique-mensuelles-responses-kpi-commercial';

@Injectable({
	providedIn: 'root',
})
export class StatistiquesKPICommercialService {
	private url = '/ws/statistiques-kpi-commercial';

	constructor(private http: HttpClient) {}

	getStatistiquesMensuellesKPI(
		mois?: number,
		annee?: number,
		niveauTensionId?: number,
		modeFacturationId?: number
	): Observable<StatistiqueMensuelleResponsesKPICommercial> {
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
		if (modeFacturationId !== null && modeFacturationId !== undefined) {
			params = params.set('modeFacturationId', modeFacturationId.toString());
		}

		return this.http.get<StatistiqueMensuelleResponsesKPICommercial>(
			`${this.url}/mensuelles`,
			{ params }
		);
	}
}
