import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layout/dashboard/dashboard-layout/dashboard-layout.component';
import { LoginLayoutComponent } from './layout/login/login-layout/login-layout.component';
import { isAuthenticatedGuard } from './guards/is-authenticated.guard';
import { isNotAuthenticatedGuard } from './guards/is-not-authenticated.guard';

export const routes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [isAuthenticatedGuard],
    canActivateChild: [isAuthenticatedGuard],
    loadChildren: () => import('./modules/home/home.routes').then((m) => m.homeRoutes),
  },
  {
    path: 'auth',
    component: LoginLayoutComponent,
    canActivate: [isNotAuthenticatedGuard],
    loadChildren: () => import('./modules/auth/auth.routes').then((m) => m.authRoutes),
  },
  { path: '**', redirectTo: '' },
];
