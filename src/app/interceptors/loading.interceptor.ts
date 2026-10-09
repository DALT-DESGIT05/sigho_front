import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

/** Activa el loading global solo en las peticiones que lo soliciten explícitamente. */
export const MOSTRAR_LOADING = new HttpContextToken<boolean>(() => false);
export const DURACION_MINIMA_LOADING = new HttpContextToken<number>(() => 350);

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.context.get(MOSTRAR_LOADING)) {
    return next(req);
  }

  const loadingService = inject(LoadingService);
  loadingService.iniciar(req.context.get(DURACION_MINIMA_LOADING));

  return next(req).pipe(
    finalize(() => loadingService.finalizar())
  );
};
