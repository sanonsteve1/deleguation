import { Routes } from '@angular/router';

export const suiviAgentsRoutes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./dashboard-manager/dashboard-manager.component').then(c => c.DashboardManagerComponent),
        data: { breadcrumb: 'Dashboard Manager' }
    },
    {
        path: 'sessions',
        loadComponent: () => import('./sessions-en-cours/sessions-en-cours.component').then(c => c.SessionsEnCoursComponent),
        data: { breadcrumb: 'Sessions en Cours' }
    },
    {
        path: 'carte',
        loadComponent: () => import('./visualisation-carte/visualisation-carte.component').then(c => c.VisualisationCarteComponent),
        data: { breadcrumb: 'Visualisation Carte' }
    },
    {
        path: 'rapports',
        loadComponent: () => import('./rapports/rapports.component').then(c => c.RapportsComponent),
        data: { breadcrumb: 'Rapports et Statistiques' }
    },
    {
        path: 'gestion-agents',
        loadComponent: () => import('./gestion-agents/gestion-agents.component').then(c => c.GestionAgentsComponent),
        data: { breadcrumb: 'Gestion des Agents' }
    },
    {
        path: 'gestion-entreprises',
        loadComponent: () => import('./gestion-entreprises/gestion-entreprises.component').then(c => c.GestionEntreprisesComponent),
        data: { breadcrumb: 'Gestion des Entreprises' }
    },
    {
        path: 'alertes',
        loadComponent: () => import('./alertes/alertes.component').then(c => c.AlertesComponent),
        data: { breadcrumb: 'Alertes' }
    },
    {
        path: 'temps-travail',
        loadComponent: () => import('./temps-travail/temps-travail.component').then(c => c.TempsTravailComponent),
        data: { breadcrumb: 'Temps de Travail' }
    },
    {
        path: 'session/:id',
        loadComponent: () => import('./detail-session/detail-session.component').then(c => c.DetailSessionComponent),
        data: { breadcrumb: 'Détail Session' }
    },
    {
        path: 'carte/:id',
        loadComponent: () => import('./visualisation-carte/visualisation-carte.component').then(c => c.VisualisationCarteComponent),
        data: { breadcrumb: 'Visualisation Carte' }
    }
];
