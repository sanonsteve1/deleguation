import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategorieEquipement } from '../models/categorie-equipement';

@Injectable({
  providedIn: 'root'
})
export class CategorieEquipementService {
  private apiUrl = '/ws/categorie-equipement';

  constructor(private http: HttpClient) { }

  /**
   * Récupère toutes les catégories principales avec leurs sous-catégories
   */
  getCategoriesPrincipales(): Observable<CategorieEquipement[]> {
    return this.http.get<CategorieEquipement[]>(`${this.apiUrl}/principales`);
  }

  /**
   * Récupère toutes les catégories
   */
  getAllCategories(): Observable<CategorieEquipement[]> {
    return this.http.get<CategorieEquipement[]>(this.apiUrl);
  }

  /**
   * Récupère une catégorie par son code
   */
  getCategorieByCode(code: string): Observable<CategorieEquipement> {
    return this.http.get<CategorieEquipement>(`${this.apiUrl}/${code}`);
  }

  /**
   * Récupère les sous-catégories d'une catégorie parente
   */
  getSousCategories(parentId: number): Observable<CategorieEquipement[]> {
    return this.http.get<CategorieEquipement[]>(`${this.apiUrl}/parent/${parentId}/sous-categories`);
  }
}

