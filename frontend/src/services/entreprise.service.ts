import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { urls } from './api-urls';
import { Entreprise, CreateEntrepriseDto, UpdateEntrepriseDto } from '../models/entreprise.model';

@Injectable({
    providedIn: 'root'
})
export class EntrepriseService {
    private baseUrl = urls.entreprise;

    constructor(private http: HttpClient) {}

    /**
     * Récupère toutes les entreprises
     */
    getAllEntreprises(): Observable<Entreprise[]> {
        return this.http.get<Entreprise[]>(this.baseUrl);
    }

    /**
     * Récupère une entreprise par son ID
     */
    getEntrepriseById(id: number): Observable<Entreprise> {
        return this.http.get<Entreprise>(`${this.baseUrl}/${id}`);
    }

    /**
     * Crée une nouvelle entreprise
     */
    createEntreprise(dto: CreateEntrepriseDto): Observable<Entreprise> {
        return this.http.post<Entreprise>(this.baseUrl, dto);
    }

    /**
     * Met à jour une entreprise
     */
    updateEntreprise(id: number, dto: UpdateEntrepriseDto): Observable<Entreprise> {
        return this.http.put<Entreprise>(`${this.baseUrl}/${id}`, dto);
    }

    /**
     * Supprime une entreprise
     */
    deleteEntreprise(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
}
