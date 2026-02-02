import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SessionTravail, SessionTravailDto } from '../models/session-travail.model';
import { urls } from './api-urls';

@Injectable({
    providedIn: 'root'
})
export class SessionTravailService {
    private apiUrl = urls.sessions;

    constructor(private http: HttpClient) {}

    /**
     * Récupère la session en cours de l'utilisateur connecté
     */
    getSessionEnCours(): Observable<SessionTravail> {
        return this.http.get<SessionTravail>(`${this.apiUrl}/en-cours`);
    }

    /**
     * Récupère l'historique des sessions
     * @param dateDebut Date de début (optionnel)
     * @param dateFin Date de fin (optionnel)
     * @param utilisateurId ID de l'utilisateur (optionnel)
     */
    getHistoriqueSessions(
        dateDebut?: Date,
        dateFin?: Date,
        utilisateurId?: number
    ): Observable<SessionTravail[]> {
        let params = new HttpParams();
        
        if (dateDebut) {
            params = params.set('dateDebut', dateDebut.toISOString());
        }
        if (dateFin) {
            params = params.set('dateFin', dateFin.toISOString());
        }
        if (utilisateurId) {
            params = params.set('utilisateurId', utilisateurId.toString());
        }

        return this.http.get<SessionTravail[]>(`${this.apiUrl}/historique`, {
            params
        });
    }

    /**
     * Récupère une session par son ID
     */
    getSessionById(id: number): Observable<SessionTravail> {
        return this.http.get<SessionTravail>(`${this.apiUrl}/${id}`);
    }

    /**
     * Récupère toutes les sessions en cours (pour les managers)
     */
    getAllSessionsEnCours(): Observable<SessionTravail[]> {
        // Note: Cette méthode pourrait nécessiter un endpoint spécifique côté backend
        // Pour l'instant, on utilise l'historique avec un filtre
        return this.http.get<SessionTravail[]>(`${this.apiUrl}/historique`);
    }
}
