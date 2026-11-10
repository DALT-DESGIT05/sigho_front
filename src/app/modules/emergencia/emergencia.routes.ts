import { Routes } from '@angular/router';

export const emergenciaRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'pacientes-triaje',
  },
  {
    path: 'pacientes-triaje',
    loadComponent: () => import('./pages/pacientes-triaje/pacientes-triaje.component').then((m) => m.PacientesTriajeComponent),
  },
  {
    path: 'atencion-medica/:atencion_id',
    loadComponent: () => import('./pages/atencion-medica-detalle/atencion-medica-detalle.component').then((m) => m.AtencionMedicaDetalleComponent),
  },
  {
    path: 'atencion-medica',
    loadComponent: () => import('./pages/atencion-medica/atencion-medica.component').then((m) => m.AtencionMedicaComponent),
  },
  {
    path: 'admision',
    loadComponent: () => import('./pages/admision/admision.components').then((m) => m.AdmisionComponents),
  },
  {
    path: 'registro-triaje/:atencion_id',
    loadComponent: () => import('./pages/registro-triaje/registro-triaje.component').then((m) => m.RegistroTriajeComponent),
  },
];
