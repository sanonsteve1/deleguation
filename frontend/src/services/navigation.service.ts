import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class NavigationService {
    readonly URL_SLASH = '/';
    readonly URL_CONNEXION = 'connexion';

    constructor(private readonly router: Router) {}

    public async goTo(route: string): Promise<void> {
        await this.router.navigate([route]);
    }

    /**
     * Retourne true si la page de connexion est affichée.
     */
    isLogin(): boolean {
        return this.router.url === this.construireUrl(this.URL_CONNEXION);
    }

    isPassword(): boolean {
        return this.router.url.includes('/password');
    }

    goToHome(): void {
        this.goTo('/accueil');
    }

    goToDetailProjet(idProjet: null): void {
        console.log(`/projet/detail-projet/${idProjet}`);
        this.goTo(`/projet/detail-projet/${idProjet}`);
    }

    /**
     * Redirige vers la page de connexion.
     */
    goTologin(): void {
        this.goTo(this.URL_CONNEXION);
    }

    getCurrentUrl(): string {
        return this.router.url;
    }

    getHostname(): string {
        return window.location.hostname;
    }

    isHome() {
        return this.router.url.includes('/accueil');
    }

    private construireUrl(partialUrl: string): string {
        return [this.URL_SLASH, partialUrl].join('');
    }
}
