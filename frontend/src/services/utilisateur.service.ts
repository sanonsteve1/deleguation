import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { urls } from './api-urls';
import { Utilisateur, CreateUtilisateurDto, UpdateUtilisateurDto } from '../models/utilisateur.model';

@Injectable({
    providedIn: 'root'
})
export class UtilisateurService {
    private baseUrl = urls.utilisateur;

    constructor(private http: HttpClient) {}

    /**
     * Récupère tous les utilisateurs
     */
    getAllUtilisateurs(): Observable<Utilisateur[]> {
        return this.http.get<any[]>(this.baseUrl).pipe(
            map(users => users.map(user => this.mapToUtilisateur(user)))
        );
    }

    /**
     * Récupère un utilisateur par son ID
     */
    getUtilisateurById(id: number): Observable<Utilisateur> {
        return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
            map(user => this.mapToUtilisateur(user))
        );
    }

    /**
     * Crée un nouvel utilisateur
     */
    createUtilisateur(dto: CreateUtilisateurDto): Observable<Utilisateur> {
        return this.http.post<any>(this.baseUrl, dto).pipe(
            map(user => this.mapToUtilisateur(user))
        );
    }

    /**
     * Met à jour un utilisateur
     */
    updateUtilisateur(id: number, dto: UpdateUtilisateurDto): Observable<Utilisateur> {
        return this.http.put<any>(`${this.baseUrl}/${id}`, dto).pipe(
            map(user => this.mapToUtilisateur(user))
        );
    }

    /**
     * Convertit un objet JSON en instance de classe Utilisateur
     */
    mapToUtilisateur(data: any): Utilisateur {
        const utilisateur = new Utilisateur();
        utilisateur.id = data.id;
        utilisateur.username = data.username;
        utilisateur.login = data.username; // Alias
        utilisateur.nom = data.nom;
        utilisateur.prenoms = data.prenoms;
        utilisateur.telephone = data.telephone;
        utilisateur.role = data.role;
        utilisateur.statut = data.statut;
        utilisateur.fonctionnalites = data.fonctionnalites || [];
        // Gérer l'entreprise (peut être un objet ou null)
        if (data.entreprise) {
            if (typeof data.entreprise === 'string') {
                // Compatibilité avec l'ancien format
                utilisateur.entreprise = data.entreprise;
            } else {
                utilisateur.entreprise = data.entreprise;
            }
        }
        return utilisateur;
    }

    /**
     * Supprime un utilisateur
     */
    deleteUtilisateur(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
}
