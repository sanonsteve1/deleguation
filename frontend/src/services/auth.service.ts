import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, Observable } from 'rxjs';
import { Utilisateur } from '../models/utilisateur.model';
import { LoginPassword } from '../models/login-password.model';
import { AST } from 'eslint';
import { NavigationService } from './navigation.service';
import { Token } from '../models/token.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private url = '/ws/securite';

    utilisateur = new BehaviorSubject(null as Utilisateur);
    utilisateurObservable = this.utilisateur.asObservable();

    constructor(
        private readonly http: HttpClient,
        private readonly jwtHelper: JwtHelperService,
        private readonly navigationService: NavigationService
    ) {}

    static updateAccessToken(token: string): void {
        localStorage.removeItem('access_token');
        localStorage.setItem('access_token', token);
    }

    /**
     * Retourne l'utilisateur connecté.
     */
    getUtilisateurConnecte(): Utilisateur {
        if (this.isAuthenticated()) {
            return this.decodeToken(this.getToken());
        }
        return null;
    }

    decodeToken(jwt: string): Utilisateur {
        const utilisateur = new Utilisateur();
        const token = this.jwtHelper.decodeToken(jwt);
        utilisateur.id = token.id;
        utilisateur.nom = token.nom;
        utilisateur.prenoms = token.prenoms;
        utilisateur.username = token.username;
        utilisateur.login = token.username; // Alias pour compatibilité
        utilisateur.role = token.role;
        utilisateur.fonctionnalites = token.fonctionnalites || [];
        utilisateur.statut = token.statut;
        // Gérer l'entreprise (peut être un objet ou null)
        if (token.entreprise) {
            utilisateur.entreprise = token.entreprise;
        }

        return utilisateur;
    }

    getRole(): string {
        return this.getUtilisateurConnecte() ? this.getUtilisateurConnecte().role : null;
    }

    getFonctionnalites(): string[] {
        return this.getUtilisateurConnecte() ? this.getUtilisateurConnecte().fonctionnalites : [];
    }

    /**
     * Authentifie l'utilisateur.
     *
     * @param loginPassword l'objet contenant le login et le mot de passe de l'utilisateur.
     * @return le {@link Token} de l'utilisateur authentifié.
     */
    authentifier(loginPassword: LoginPassword): Observable<Token> {
        return this.http.post<Token>(this.url + '/auth', loginPassword);
    }

    /**
     * Vérifie si l'utilisateur est authentifié et si le token est toujours valide.
     * @private
     */
    isAuthenticated(): boolean {
        const token = localStorage.getItem('access_token');
        return token && !this.jwtHelper.isTokenExpired(token);
    }

    private getToken(): string {
        const token = localStorage.getItem('access_token');
        return token ? token : '';
    }

    updateUtilisateurConnecte() {
        this.utilisateur.next(this.getUtilisateurConnecte());
    }

    authentifierUtilisateurOnea(): Observable<Token> {
        return this.authentifier(new LoginPassword({ username: 'onea', password: 'eburtis2020' }));
    }

    /**
     * Retourne true si l'utilisateur a droit à une fonctionnalité
     *
     * @param codeFonctionnalite le code de la fonctionnalité.
     */
    hasFonctionnalite(codeFonctionnalite: string): boolean {
        return this.getFonctionnalites().includes(codeFonctionnalite);
    }

    /**
     * Redirige vers la page de connexion si l'utilisateur n'est pas authentifié.
     */
    afficherConnexionSiNonAuthentifier() {
        if (!this.isAuthenticated()) {
            this.navigationService.goTologin();
        }
    }

    /**
     * Déconnecte l'utilisateur.
     */
    deconnecter(): void {
        localStorage.removeItem('access_token');
        this.utilisateur.next(null);
        this.navigationService.goTologin();
    }
}
