import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Statut } from '../models/statut.model';
import { ChangementStatut } from '../models/changement-statut.model';
import { urls } from './api-urls';

@Injectable({
    providedIn: 'root'
})
export class StatutService {
    private apiUrl = urls.statuts;
    private changementsUrl = urls.changementsStatut;

    constructor(private http: HttpClient) {}

    /**
     * Récupère tous les statuts disponibles
     */
    getAllStatuts(): Observable<Statut[]> {
        return this.http.get<Statut[]>(this.apiUrl);
    }

    /**
     * Récupère un statut par son code
     */
    getStatutByCode(codeStatut: string): Observable<Statut> {
        return this.http.get<Statut>(`${this.apiUrl}/${codeStatut}`);
    }

    /**
     * Récupère tous les changements de statut d'une session
     */
    getChangementsParSession(sessionId: number): Observable<ChangementStatut[]> {
        return this.http.get<ChangementStatut[]>(`${this.changementsUrl}/session/${sessionId}`);
    }
}
