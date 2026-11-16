import { ReprogramacionCitasPageComponent } from './pages/reprogramacion-citas-page/reprogramacion-citas-page.component';
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
  {
    path: 'adicional',
    loadComponent: () =>import('./pages/adicional-page/adicional-page.component').then(m => m.AdicionalPageComponent)
  },
   {
    path: 'reprogramacion-citas',
    loadComponent: () =>import('./pages/reprogramacion-citas-page/reprogramacion-citas-page.component').then(m => m.ReprogramacionCitasPageComponent)
  },

]
