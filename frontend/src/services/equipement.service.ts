import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Equipement } from '../models/equipement';

@Injectable({
  providedIn: 'root'
})
export class EquipementService {
  private apiUrl = '/ws/equipement';

  constructor(private http: HttpClient) { }

  /**
   * Récupère tous les équipements
   */
  getAllEquipements(): Observable<Equipement[]> {
    return this.http.get<Equipement[]>(this.apiUrl);
  }

  /**
   * Récupère un équipement par son ID
   */
  getEquipementById(id: number): Observable<Equipement> {
    return this.http.get<Equipement>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupère les équipements d'une catégorie
   */
  getEquipementsByCategorie(categorieId: number): Observable<Equipement[]> {
    return this.http.get<Equipement[]>(`${this.apiUrl}/categorie/${categorieId}`);
  }

  /**
   * Récupère les équipements par code de catégorie
   */
  getEquipementsByCodeCategorie(codeCategorie: string): Observable<Equipement[]> {
    return this.http.get<Equipement[]>(`${this.apiUrl}/categorie-code/${codeCategorie}`);
  }

  /**
   * Recherche d'équipements par code
   */
  searchEquipementsByCode(code: string): Observable<Equipement[]> {
    const params = new HttpParams().set('code', code);
    return this.http.get<Equipement[]>(`${this.apiUrl}/search/code`, { params });
  }

  /**
   * Recherche d'équipements par libellé
   */
  searchEquipementsByLibelle(libelle: string): Observable<Equipement[]> {
    const params = new HttpParams().set('libelle', libelle);
    return this.http.get<Equipement[]>(`${this.apiUrl}/search/libelle`, { params });
  }
}

