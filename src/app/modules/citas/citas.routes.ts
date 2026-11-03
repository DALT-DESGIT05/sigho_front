import { Routes } from '@angular/router';

export const citasRoutes: Routes = [
  {
    path: 'menu_reservas',
    loadComponent: () =>import('./pages/menu-reservas-page/menu-reservas-page.component').then((m) => m.MenuReservas),
  },
];
