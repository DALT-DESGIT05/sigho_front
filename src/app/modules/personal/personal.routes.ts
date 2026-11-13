import { Routes } from '@angular/router';

export const personalRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'horarios' },
  {
    path: 'horarios',
    loadComponent: () => import('./pages/programacion-personal/programacion-personal.component').then((m) => m.ProgramacionPersonalComponent),
  },
  {
    path: 'turnos',
    loadComponent: () => import('./pages/catalogo-turnos/catalogo-turnos.component').then((m) => m.CatalogoTurnosComponent),
  },
  {
    path: 'mi-horario',
    loadComponent: () => import('./pages/mi-horario/mi-horario.component').then((m) => m.MiHorarioComponent),
  },
];
