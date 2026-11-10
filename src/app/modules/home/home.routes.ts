import { Routes } from '@angular/router';

export const homeRoutes: Routes = [
  {
    path: 'emergencia',
    loadChildren: () => import('../emergencia/emergencia.routes').then((m) => m.emergenciaRoutes),
  },
  {
    path: 'personal',
    loadChildren: () => import('../personal/personal.routes').then((m) => m.personalRoutes),
  },
  {
    path: '',
    loadComponent: () => import('./pages/home-page/home-page.component').then((m) => m.HomePageComponent),
  },
];
