import { Routes } from '@angular/router';

export default [
	{
		path: '',
		data: { breadcrumb: 'Tableau de bord' },
		loadComponent: () => import('./tableau-de-bord.component').then((c) => c.TableauDeBordComponent)
	}
] as Routes;
