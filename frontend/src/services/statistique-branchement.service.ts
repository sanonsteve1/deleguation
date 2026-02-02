import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { urls } from './api-urls';
import { StatistiqueAmperage } from '../models/statistique-amperage';
import { StatistiqueRegion } from '../models/statistique-region';
import { StatistiqueAgence } from '../models/statistique-agence';
import { ResumeStatistiques } from '../models/resume-statistiques';
import { RegionData, AgenceData, AmperageData, PhaseData, TypeBranchementData, SourceDonneesData, AnneeData, MoisData } from '../models/filtre-options.model';

@Injectable({
    providedIn: 'root'
})
export class StatistiqueBranchementService {
    private apiUrl = urls.statistiques;

    constructor(private http: HttpClient) {}

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        });
    }

    /**
     * Récupère les statistiques globales par ampérage
     */
    getStatistiquesParAmperage(): Observable<StatistiqueAmperage[]> {
        return this.http.get<StatistiqueAmperage[]>(`${this.apiUrl}/amperage`, { headers: this.getHeaders() });
    }

    /**
     * Récupère les statistiques par ampérage pour une région
     * @param departementId ID du département
     */
    getStatistiquesParAmperageEtRegion(departementId: number): Observable<StatistiqueAmperage[]> {
        return this.http.get<StatistiqueAmperage[]>(`${this.apiUrl}/amperage/region/${departementId}`, { headers: this.getHeaders() });
    }

    /**
     * Récupère les statistiques par ampérage pour une agence
     * @param agenceId ID de l'agence
     */
    getStatistiquesParAmperageEtAgence(agenceId: number): Observable<StatistiqueAmperage[]> {
        return this.http.get<StatistiqueAmperage[]>(`${this.apiUrl}/amperage/agence/${agenceId}`, { headers: this.getHeaders() });
    }

    /**
     * Récupère les statistiques par région
     */
    getStatistiquesParRegion(): Observable<StatistiqueRegion[]> {
        return this.http.get<StatistiqueRegion[]>(`${this.apiUrl}/regions`, { headers: this.getHeaders() });
    }

    /**
     * Récupère les statistiques globales par agence
     */
    getStatistiquesParAgence(): Observable<StatistiqueAgence[]> {
        return this.http.get<StatistiqueAgence[]>(`${this.apiUrl}/agences`, { headers: this.getHeaders() });
    }

    /**
     * Récupère les statistiques par agence pour une région
     * @param departementId ID du département
     */
    getStatistiquesParAgenceEtRegion(departementId: number): Observable<StatistiqueAgence[]> {
        return this.http.get<StatistiqueAgence[]>(`${this.apiUrl}/agences/region/${departementId}`, { headers: this.getHeaders() });
    }

    /**
     * Récupère un résumé global de toutes les statistiques
     */
    getResumeStatistiques(): Observable<ResumeStatistiques> {
        return this.http.get<ResumeStatistiques>(`${this.apiUrl}/resume`, { headers: this.getHeaders() });
    }

    /**
     * Récupère les statistiques par région pour un ampérage spécifique
     * @param amperageId ID de l'ampérage
     */
    getStatistiquesParRegionEtAmperage(amperageId: number): Observable<StatistiqueRegion[]> {
        return this.http.get<StatistiqueRegion[]>(`${this.apiUrl}/regions/amperage/${amperageId}`, { headers: this.getHeaders() });
    }

    /**
     * Récupère les statistiques par agence pour un ampérage spécifique
     * @param amperageId ID de l'ampérage
     */
    getStatistiquesParAgenceEtAmperage(amperageId: number): Observable<StatistiqueAgence[]> {
        return this.http.get<StatistiqueAgence[]>(`${this.apiUrl}/agences/amperage/${amperageId}`, { headers: this.getHeaders() });
    }

    /**
     * Récupère les statistiques par ampérage pour une phase spécifique
     * @param phase Phase du branchement
     */
    getStatistiquesParAmperageEtPhase(phase: string): Observable<StatistiqueAmperage[]> {
        return this.http.get<StatistiqueAmperage[]>(`${this.apiUrl}/amperage/phase/${phase}`, { headers: this.getHeaders() });
    }

    /**
     * Récupère les statistiques par région pour une phase spécifique
     * @param phase Phase du branchement
     */
    getStatistiquesParRegionEtPhase(phase: string): Observable<StatistiqueRegion[]> {
        return this.http.get<StatistiqueRegion[]>(`${this.apiUrl}/regions/phase/${phase}`, { headers: this.getHeaders() });
    }

    /**
     * Récupère les statistiques par agence pour une phase spécifique
     * @param phase Phase du branchement
     */
    getStatistiquesParAgenceEtPhase(phase: string): Observable<StatistiqueAgence[]> {
        return this.http.get<StatistiqueAgence[]>(`${this.apiUrl}/agences/phase/${phase}`, { headers: this.getHeaders() });
    }

    /**
     * Récupère les statistiques par ampérage pour un type de branchement spécifique
     * @param typeBranchement Type de branchement
     */
    getStatistiquesParAmperageEtTypeBranchement(typeBranchement: string): Observable<StatistiqueAmperage[]> {
        return this.http.get<StatistiqueAmperage[]>(`${this.apiUrl}/amperage/type/${typeBranchement}`, { headers: this.getHeaders() });
    }

    /**
     * Récupère les statistiques par région pour un type de branchement spécifique
     * @param typeBranchement Type de branchement
     */
    getStatistiquesParRegionEtTypeBranchement(typeBranchement: string): Observable<StatistiqueRegion[]> {
        return this.http.get<StatistiqueRegion[]>(`${this.apiUrl}/regions/type/${typeBranchement}`, { headers: this.getHeaders() });
    }

    /**
     * Récupère les statistiques par agence pour un type de branchement spécifique
     * @param typeBranchement Type de branchement
     */
    getStatistiquesParAgenceEtTypeBranchement(typeBranchement: string): Observable<StatistiqueAgence[]> {
        return this.http.get<StatistiqueAgence[]>(`${this.apiUrl}/agences/type/${typeBranchement}`, { headers: this.getHeaders() });
    }

    /**
     * Récupère les statistiques par ampérage pour une source de données spécifique
     * @param sourceDonnees Source de données
     */
    getStatistiquesParAmperageEtSource(sourceDonnees: string): Observable<StatistiqueAmperage[]> {
        return this.http.get<StatistiqueAmperage[]>(`${this.apiUrl}/amperage/source/${sourceDonnees}`, { headers: this.getHeaders() });
    }

    /**
     * Récupère les statistiques par région pour une source de données spécifique
     * @param sourceDonnees Source de données
     */
    getStatistiquesParRegionEtSource(sourceDonnees: string): Observable<StatistiqueRegion[]> {
        return this.http.get<StatistiqueRegion[]>(`${this.apiUrl}/regions/source/${sourceDonnees}`, { headers: this.getHeaders() });
    }

    /**
     * Récupère les statistiques par agence pour une source de données spécifique
     * @param sourceDonnees Source de données
     */
    getStatistiquesParAgenceEtSource(sourceDonnees: string): Observable<StatistiqueAgence[]> {
        return this.http.get<StatistiqueAgence[]>(`${this.apiUrl}/agences/source/${sourceDonnees}`, { headers: this.getHeaders() });
    }

    /**
     * Récupère les statistiques par ampérage avec filtres multiples combinés
     */
    getStatistiquesParAmperageAvecFiltres(params: { annee?: number; mois?: number; departementIds?: number[]; agenceIds?: number[]; amperageIds?: number[]; phases?: string[]; typeBranchements?: string[]; sourceDonnees?: string[] }): Observable<StatistiqueAmperage[]> {
        let queryParams = new URLSearchParams();
        if (params.annee) queryParams.append('annee', params.annee.toString());
        if (params.mois) queryParams.append('mois', params.mois.toString());
        if (params.departementIds) params.departementIds.forEach(id => queryParams.append('departementIds', id.toString()));
        if (params.agenceIds) params.agenceIds.forEach(id => queryParams.append('agenceIds', id.toString()));
        if (params.amperageIds) params.amperageIds.forEach(id => queryParams.append('amperageIds', id.toString()));
        if (params.phases) params.phases.forEach(phase => queryParams.append('phases', phase));
        if (params.typeBranchements) params.typeBranchements.forEach(type => queryParams.append('typeBranchements', type));
        if (params.sourceDonnees) params.sourceDonnees.forEach(source => queryParams.append('sourceDonnees', source));

        return this.http.get<StatistiqueAmperage[]>(`${this.apiUrl}/amperage/filtres?${queryParams.toString()}`, { headers: this.getHeaders() });
    }

    /**
     * Récupère les statistiques par région avec filtres multiples combinés
     */
    getStatistiquesParRegionAvecFiltres(params: { annee?: number; mois?: number; departementIds?: number[]; agenceIds?: number[]; amperageIds?: number[]; phases?: string[]; typeBranchements?: string[]; sourceDonnees?: string[] }): Observable<StatistiqueRegion[]> {
        let queryParams = new URLSearchParams();
        if (params.annee) queryParams.append('annee', params.annee.toString());
        if (params.mois) queryParams.append('mois', params.mois.toString());
        if (params.departementIds) params.departementIds.forEach(id => queryParams.append('departementIds', id.toString()));
        if (params.agenceIds) params.agenceIds.forEach(id => queryParams.append('agenceIds', id.toString()));
        if (params.amperageIds) params.amperageIds.forEach(id => queryParams.append('amperageIds', id.toString()));
        if (params.phases) params.phases.forEach(phase => queryParams.append('phases', phase));
        if (params.typeBranchements) params.typeBranchements.forEach(type => queryParams.append('typeBranchements', type));
        if (params.sourceDonnees) params.sourceDonnees.forEach(source => queryParams.append('sourceDonnees', source));

        return this.http.get<StatistiqueRegion[]>(`${this.apiUrl}/regions/filtres?${queryParams.toString()}`, { headers: this.getHeaders() });
    }

    /**
     * Récupère les statistiques par agence avec filtres multiples combinés
     */
    getStatistiquesParAgenceAvecFiltres(params: { annee?: number; mois?: number; departementIds?: number[]; agenceIds?: number[]; amperageIds?: number[]; phases?: string[]; typeBranchements?: string[]; sourceDonnees?: string[] }): Observable<StatistiqueAgence[]> {
        let queryParams = new URLSearchParams();
        if (params.annee) queryParams.append('annee', params.annee.toString());
        if (params.mois) queryParams.append('mois', params.mois.toString());
        if (params.departementIds) params.departementIds.forEach(id => queryParams.append('departementIds', id.toString()));
        if (params.agenceIds) params.agenceIds.forEach(id => queryParams.append('agenceIds', id.toString()));
        if (params.amperageIds) params.amperageIds.forEach(id => queryParams.append('amperageIds', id.toString()));
        if (params.phases) params.phases.forEach(phase => queryParams.append('phases', phase));
        if (params.typeBranchements) params.typeBranchements.forEach(type => queryParams.append('typeBranchements', type));
        if (params.sourceDonnees) params.sourceDonnees.forEach(source => queryParams.append('sourceDonnees', source));

        return this.http.get<StatistiqueAgence[]>(`${this.apiUrl}/agences/filtres?${queryParams.toString()}`, { headers: this.getHeaders() });
    }

    // ========== MÉTHODES POUR FILTRAGE EN CASCADE ==========

    /**
     * Récupère les régions disponibles selon les filtres appliqués
     */
    getRegionsDisponibles(params: { annee?: number; mois?: number; amperageIds?: number[]; phases?: string[]; typeBranchements?: string[]; sourceDonnees?: string[] }): Observable<RegionData[]> {
        let queryParams = new URLSearchParams();
        if (params.annee) queryParams.append('annee', params.annee.toString());
        if (params.mois) queryParams.append('mois', params.mois.toString());
        if (params.amperageIds) params.amperageIds.forEach(id => queryParams.append('amperageIds', id.toString()));
        if (params.phases) params.phases.forEach(phase => queryParams.append('phases', phase));
        if (params.typeBranchements) params.typeBranchements.forEach(type => queryParams.append('typeBranchements', type));
        if (params.sourceDonnees) params.sourceDonnees.forEach(source => queryParams.append('sourceDonnees', source));

        return this.http.get<RegionData[]>(`${this.apiUrl}/filtres/regions?${queryParams.toString()}`, { headers: this.getHeaders() });
    }

    /**
     * Récupère les agences disponibles selon les filtres appliqués
     */
    getAgencesDisponibles(params: { annee?: number; mois?: number; departementIds?: number[]; amperageIds?: number[]; phases?: string[]; typeBranchements?: string[]; sourceDonnees?: string[] }): Observable<AgenceData[]> {
        let queryParams = new URLSearchParams();
        if (params.annee) queryParams.append('annee', params.annee.toString());
        if (params.mois) queryParams.append('mois', params.mois.toString());
        if (params.departementIds) params.departementIds.forEach(id => queryParams.append('departementIds', id.toString()));
        if (params.amperageIds) params.amperageIds.forEach(id => queryParams.append('amperageIds', id.toString()));
        if (params.phases) params.phases.forEach(phase => queryParams.append('phases', phase));
        if (params.typeBranchements) params.typeBranchements.forEach(type => queryParams.append('typeBranchements', type));
        if (params.sourceDonnees) params.sourceDonnees.forEach(source => queryParams.append('sourceDonnees', source));

        return this.http.get<AgenceData[]>(`${this.apiUrl}/filtres/agences?${queryParams.toString()}`, { headers: this.getHeaders() });
    }

    /**
     * Récupère les ampérages disponibles selon les filtres appliqués
     */
    getAmperagesDisponibles(params: { annee?: number; mois?: number; departementIds?: number[]; agenceIds?: number[]; phases?: string[]; typeBranchements?: string[]; sourceDonnees?: string[] }): Observable<AmperageData[]> {
        let queryParams = new URLSearchParams();
        if (params.annee) queryParams.append('annee', params.annee.toString());
        if (params.mois) queryParams.append('mois', params.mois.toString());
        if (params.departementIds) params.departementIds.forEach(id => queryParams.append('departementIds', id.toString()));
        if (params.agenceIds) params.agenceIds.forEach(id => queryParams.append('agenceIds', id.toString()));
        if (params.phases) params.phases.forEach(phase => queryParams.append('phases', phase));
        if (params.typeBranchements) params.typeBranchements.forEach(type => queryParams.append('typeBranchements', type));
        if (params.sourceDonnees) params.sourceDonnees.forEach(source => queryParams.append('sourceDonnees', source));

        return this.http.get<AmperageData[]>(`${this.apiUrl}/filtres/amperages?${queryParams.toString()}`, { headers: this.getHeaders() });
    }

    /**
     * Récupère les phases disponibles selon les filtres appliqués
     */
    getPhasesDisponibles(params: { annee?: number; mois?: number; departementIds?: number[]; agenceIds?: number[]; amperageIds?: number[]; typeBranchements?: string[]; sourceDonnees?: string[] }): Observable<any[]> {
        let queryParams = new URLSearchParams();
        if (params.annee) queryParams.append('annee', params.annee.toString());
        if (params.mois) queryParams.append('mois', params.mois.toString());
        if (params.departementIds) params.departementIds.forEach(id => queryParams.append('departementIds', id.toString()));
        if (params.agenceIds) params.agenceIds.forEach(id => queryParams.append('agenceIds', id.toString()));
        if (params.amperageIds) params.amperageIds.forEach(id => queryParams.append('amperageIds', id.toString()));
        if (params.typeBranchements) params.typeBranchements.forEach(type => queryParams.append('typeBranchements', type));
        if (params.sourceDonnees) params.sourceDonnees.forEach(source => queryParams.append('sourceDonnees', source));

        return this.http.get<any[]>(`${this.apiUrl}/filtres/phases?${queryParams.toString()}`, { headers: this.getHeaders() });
    }

    /**
     * Récupère les types de branchement disponibles selon les filtres appliqués
     */
    getTypesBranchementDisponibles(params: { annee?: number; mois?: number; departementIds?: number[]; agenceIds?: number[]; amperageIds?: number[]; phases?: string[]; sourceDonnees?: string[] }): Observable<any[]> {
        let queryParams = new URLSearchParams();
        if (params.annee) queryParams.append('annee', params.annee.toString());
        if (params.mois) queryParams.append('mois', params.mois.toString());
        if (params.departementIds) params.departementIds.forEach(id => queryParams.append('departementIds', id.toString()));
        if (params.agenceIds) params.agenceIds.forEach(id => queryParams.append('agenceIds', id.toString()));
        if (params.amperageIds) params.amperageIds.forEach(id => queryParams.append('amperageIds', id.toString()));
        if (params.phases) params.phases.forEach(phase => queryParams.append('phases', phase));
        if (params.sourceDonnees) params.sourceDonnees.forEach(source => queryParams.append('sourceDonnees', source));

        return this.http.get<any[]>(`${this.apiUrl}/filtres/types-branchement?${queryParams.toString()}`, { headers: this.getHeaders() });
    }

    /**
     * Récupère les sources de données disponibles selon les filtres appliqués
     */
    getSourcesDonneesDisponibles(params: { annee?: number; mois?: number; departementIds?: number[]; agenceIds?: number[]; amperageIds?: number[]; phases?: string[]; typeBranchements?: string[] }): Observable<any[]> {
        let queryParams = new URLSearchParams();
        if (params.annee) queryParams.append('annee', params.annee.toString());
        if (params.mois) queryParams.append('mois', params.mois.toString());
        if (params.departementIds) params.departementIds.forEach(id => queryParams.append('departementIds', id.toString()));
        if (params.agenceIds) params.agenceIds.forEach(id => queryParams.append('agenceIds', id.toString()));
        if (params.amperageIds) params.amperageIds.forEach(id => queryParams.append('amperageIds', id.toString()));
        if (params.phases) params.phases.forEach(phase => queryParams.append('phases', phase));
        if (params.typeBranchements) params.typeBranchements.forEach(type => queryParams.append('typeBranchements', type));

        return this.http.get<any[]>(`${this.apiUrl}/filtres/sources-donnees?${queryParams.toString()}`, { headers: this.getHeaders() });
    }

    /**
     * Récupère les années disponibles selon les filtres appliqués
     */
    getAnneesDisponibles(params: { departementIds?: number[]; agenceIds?: number[]; amperageIds?: number[]; phases?: string[]; typeBranchements?: string[]; sourceDonnees?: string[] }): Observable<AnneeData[]> {
        let queryParams = new URLSearchParams();
        if (params.departementIds) params.departementIds.forEach(id => queryParams.append('departementIds', id.toString()));
        if (params.agenceIds) params.agenceIds.forEach(id => queryParams.append('agenceIds', id.toString()));
        if (params.amperageIds) params.amperageIds.forEach(id => queryParams.append('amperageIds', id.toString()));
        if (params.phases) params.phases.forEach(phase => queryParams.append('phases', phase));
        if (params.typeBranchements) params.typeBranchements.forEach(type => queryParams.append('typeBranchements', type));
        if (params.sourceDonnees) params.sourceDonnees.forEach(source => queryParams.append('sourceDonnees', source));

        return this.http.get<AnneeData[]>(`${this.apiUrl}/filtres/annees?${queryParams.toString()}`, { headers: this.getHeaders() });
    }

    /**
     * Récupère les mois disponibles selon les filtres appliqués
     */
    getMoisDisponibles(params: { annee?: number; departementId?: number; agenceId?: number; amperageId?: number; phase?: string; typeBranchement?: string; sourceDonnees?: string }): Observable<any[]> {
        let queryParams = new URLSearchParams();
        if (params.annee) queryParams.append('annee', params.annee.toString());
        if (params.departementId) queryParams.append('departementId', params.departementId.toString());
        if (params.agenceId) queryParams.append('agenceId', params.agenceId.toString());
        if (params.amperageId) queryParams.append('amperageId', params.amperageId.toString());
        if (params.phase) queryParams.append('phase', params.phase);
        if (params.typeBranchement) queryParams.append('typeBranchement', params.typeBranchement);
        if (params.sourceDonnees) queryParams.append('sourceDonnees', params.sourceDonnees);

        return this.http.get<any[]>(`${this.apiUrl}/filtres/mois?${queryParams.toString()}`, { headers: this.getHeaders() });
    }
}
