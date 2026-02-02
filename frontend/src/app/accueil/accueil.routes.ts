import { Routes } from '@angular/router';

export const accueilRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./accueil.component').then(c => c.AccueilComponent)
    }
];

