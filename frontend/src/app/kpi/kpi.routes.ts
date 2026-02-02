import {Routes} from '@angular/router';

export default [
	{
		path: 'kpi-commercial',
		data: {breadcrumb: 'KPI-COMMERCIAL'},
		loadComponent: () => import('./kpi-commercial/kpi-commercial.component').then((c) => c.KpiCommercialComponent)
	},
	{
		path: 'kpi-commercial/ventes',
		data: {breadcrumb: 'KPI-COMMERCIAL - Ventes'},
		loadComponent: () => import('./kpi-commercial/ventes/ventes.component').then((c) => c.VentesComponent)
	},
	{
		path: 'kpi-commercial/taux-recouvrement',
		data: {breadcrumb: 'KPI-COMMERCIAL - Taux de recouvrement'},
		loadComponent: () => import('./kpi-commercial/taux-recouvrement/kpi-taux-recouvrement.component').then((c) => c.TauxRecouvrementComponent)
	},
	{
		path: 'kpi-commercial/branchements',
		data: {breadcrumb: 'KPI-COMMERCIAL - Branchements'},
		loadComponent: () => import('./kpi-commercial/branchements/branchements.component').then((c) => c.BranchementsComponent)
	},
	{
		path: 'kpi-finance',
		data: {breadcrumb: 'KPI-FINANCE'},
		loadComponent: () => import('./kpi-finance/kpi-finance.component').then((c) => c.KpiFinanceComponent)
	},
	{
		path: 'kpi-dsi',
		data: {breadcrumb: 'KPI-DSI'},
		loadComponent: () => import('./kpi-dsi/kpi-dsi.component').then((c) => c.KpiDsiComponent)
	}
	,
	{
		path: 'kpi-rh',
		data: {breadcrumb: 'KPI-RH'},
		loadComponent: () => import('./kpi-rh/kpi-rh.component').then((c) => c.KpiRhComponent)
	},
	{
		path: 'kpi-stock',
		data: {breadcrumb: 'KPI-STOCK'},
		loadComponent: () => import('./kpi-stock/kpi-stock.component').then((c) => c.KpiStockComponent)
	},
    {
        path: 'kpi-stock/suivi-mouvements',
        data: {breadcrumb: 'KPI-STOCK - Suivi des mouvements'},
        loadComponent: () => import('./kpi-stock/suivi-mouvements/suivi-mouvements.component').then((c) => c.SuiviMouvementsComponent)
    },
    {
        path: 'kpi-stock/analyse-categorie',
        data: {breadcrumb: 'KPI-STOCK - Analyse par catégorie'},
        loadComponent: () => import('./kpi-stock/analyse-categorie/analyse-categorie.component').then((c) => c.AnalyseCategorieComponent)
    },
    {
        path: 'kpi-stock/performance-logistique',
        data: {breadcrumb: 'KPI-STOCK - Performance logistique'},
        loadComponent: () => import('./kpi-stock/performance-logistique/performance-logistique.component').then((c) => c.PerformanceLogistiqueComponent)
    },
    {
        path: 'kpi-stock/analyse-financiere',
        data: {breadcrumb: 'KPI-STOCK - Analyse financière'},
        loadComponent: () => import('./kpi-stock/analyse-financiere/analyse-financiere.component').then((c) => c.AnalyseFinanciereComponent)
    },
	{
		path: 'kpi-technique',
		data: {breadcrumb: 'KPI-TECHNIQUE'},
		loadComponent: () => import('./kpi-technique/kpi-technique.component').then((c) => c.KpiTechniqueComponent)
	}
] as Routes;
