import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "@environments/environment";
import {urls} from "./api-urls";
import {EffectifCumul} from "../models/effectif-cumul.model";

@Injectable({
    providedIn: 'root'
})
export class EffectifService {

    private apiUrl = urls.effectifs;

    constructor(private http: HttpClient) {}

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        });
    }

    getEffectifGeneral(direction?: string): Observable<EffectifCumul> {
        let options: { headers: HttpHeaders; params?: HttpParams } = { headers: this.getHeaders() };

        if (direction) {
            options = {
                ...options,
                params: new HttpParams().set('direction', direction)
            };
        }

        return this.http.get<EffectifCumul>(`${this.apiUrl}/effectif-general`, options);
    }

}
