import { Routes } from '@angular/router';

export const citasRoutes: Routes = [
  {
    path: 'menu_reservas',
    loadComponent: () =>import('./pages/menu-reservas-page/menu-reservas-page.component').then((m) => m.MenuReservas),
  },

  {
  path: 'reserva_citas',
    loadComponent: () =>import('./pages/reserva-citas-page/reserva-citas-page.component').then(m => m.ReservaCitasPageComponent),
  }
];
