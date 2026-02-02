import { Routes } from '@angular/router';

export default [
	// {
	// 	path: 'tableau-de-bord',
	// 	data: { breadcrumb: 'Consommation' },
	// 	loadComponent: () => import('./tableau-de-bord/tableau-de-bord.component').then((c) => c.TableauDeBordStatistiquesComponent)
	// },
	// {
	// 	path: 'branchements',
	// 	//data: {breadcrumb: 'Branchements'},
	// 	loadChildren: () => import('./branchements/branchements.routes')
	// },
	{
		path: 'consommation-par-direction',
		loadComponent: () => import('./consommation/consommation-par-direction.component').then((c) => c.ConsommationParDirectionComponent)
	}
] as Routes;
