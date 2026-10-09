import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { inject } from '@angular/core';
import { AuthStatus } from '../enums/auth-status.enum';

export const isAuthenticatedGuard: CanActivateFn = (route, state) => {
  const authService=inject(AuthService);
  const router=inject(Router);

  if(authService.authStatus()===AuthStatus.notAuthenticated){
    sessionStorage.setItem('url_actual', state.url);
    return router.createUrlTree(['/auth/login']);
  }

  return true;
};
