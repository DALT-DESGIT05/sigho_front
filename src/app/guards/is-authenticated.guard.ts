import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { inject } from '@angular/core';
import { AuthStatus } from '../enums/auth-status.enum';

export const isAuthenticatedGuard: CanActivateFn = () => {
  const authService=inject(AuthService);
  const router=inject(Router);

  if(authService.authStatus()===AuthStatus.notAuthenticated){
    return router.createUrlTree(['/auth/login']);
  }

  return true;
};
