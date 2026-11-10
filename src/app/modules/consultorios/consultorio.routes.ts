import { Routes } from '@angular/router';

export const consultorioRoutes: Routes = [

   {
    path: '',
    redirectTo: 'programacion-medicos',
    pathMatch: 'full'
  },
  {
    path: 'programacion-medicos',
    loadComponent: () =>import('./pages/programacion-medicos-page/programacion-medicos-page.component').then(m => m.ProgramacionMedicosPage)
  },

]
