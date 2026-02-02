import { Routes } from '@angular/router';

export default [
    {
        path: '',
        data: { breadcrumb: 'Branchements' },
        loadComponent: () => import('./branchements.component').then((c) => c.BranchementsComponent)
    }
] as Routes;
