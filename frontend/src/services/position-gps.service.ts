import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PositionGps } from '../models/position-gps.model';
import { urls } from './api-urls';
import { calculerDistanceTotale } from '../models/position-gps.model';

@Injectable({
    providedIn: 'root'
})
export class PositionGpsService {
    private apiUrl = urls.positions;

    constructor(private http: HttpClient) {}

    /**
     * Récupère toutes les positions GPS d'une session
     */
    getPositionsParSession(sessionId: number): Observable<PositionGps[]> {
        console.log(`[PositionGpsService] Récupération des positions pour la session ${sessionId}`);
        return this.http.get<PositionGps[]>(`${this.apiUrl}/session/${sessionId}`);
    }

    /**
     * Calcule la distance totale parcourue pour une session
     */
    calculerDistanceTotaleSession(sessionId: number): Observable<number> {
        return new Observable(observer => {
            this.getPositionsParSession(sessionId).subscribe({
                next: (positions) => {
                    const distance = calculerDistanceTotale(positions);
                    observer.next(distance);
                    observer.complete();
                },
                error: (error) => observer.error(error)
            });
        });
    }

    /**
     * Récupère les positions GPS et calcule la distance
     */
    getPositionsAvecDistance(sessionId: number): Observable<{ positions: PositionGps[]; distance: number }> {
        return new Observable(observer => {
            this.getPositionsParSession(sessionId).subscribe({
                next: (positions) => {
                    const distance = calculerDistanceTotale(positions);
                    observer.next({ positions, distance });
                    observer.complete();
                },
                error: (error) => observer.error(error)
            });
        });
    }
}
