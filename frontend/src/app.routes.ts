import { Routes } from '@angular/router';
import { AppLayout } from '@/layout/components/app.layout';
import { authGuard } from './guards/auth.guard';

export const appRoutes: Routes = [
	{
		path: '',
		component: AppLayout,
		canActivate: [authGuard],
		children: [
			{path: '', redirectTo: '/accueil', pathMatch: 'full'},
			{
				path: 'accueil',
				data: {breadcrumb: 'Accueil'},
				loadChildren: () => import('@/accueil/accueil.routes').then(m => m.accueilRoutes)
			},
			{
				path: 'suivi-agents',
				data: {breadcrumb: 'Suivi Agents'},
				loadChildren: () => import('@/suivi-agents/suivi-agents.routes').then(m => m.suiviAgentsRoutes)
			}
		]
	},
	{
		path: 'connexion',
		loadComponent: () => import('@/login/login').then((c) => c.Login)
	},
	{path: '**', redirectTo: '/connexion'}
];
