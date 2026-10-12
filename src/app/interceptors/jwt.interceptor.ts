import { HttpEventType, HttpInterceptorFn } from '@angular/common/http';
import { Injector, inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environments';
import { MESSAGE_ERROR_DEFAULT_403, TITLE_MODAL } from '../config/constants';
import { AuthService } from '../services/auth/auth.service';
import Swal from 'sweetalert2/dist/sweetalert2.esm.all.js';

let alerta_403_abierta = false;

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {

  const baseUrl:string=environment.baseUrl;
  const url_login = baseUrl + 'v1/auth/login';
  const url_logout = baseUrl + 'v1/auth/cerrar_sesion';
  const injector = inject(Injector);

  const token = sessionStorage.getItem('token');
  const es_api_propia = req.url.startsWith(baseUrl);

  if (es_api_propia && req.url !== url_login && !!token) {

    req=req.clone({
      setHeaders:{
        Authorization:`Bearer ${token}`,
        'Accept': 'application/json',
      }
    });
  }

  const debe_actualizar_actividad =
    es_api_propia &&
    req.url !== url_logout &&
    req.headers.has('Authorization');

  return next(req).pipe(
    tap((evento) => {
      if (debe_actualizar_actividad && evento.type === HttpEventType.Response) {
        const last_activity = evento.headers.get('x-last-activity');
        if (last_activity) {
          injector.get(AuthService).actualizar_last_activity(last_activity);
        }
      }
    }),
    catchError((error) => {
      // Un token vencido o inválido es rechazado por la API con 401. Se limpia
      // la sesión local para que AppComponent redirija al usuario al login.
      if (error.status === 401 && es_api_propia && req.url !== url_login) {
        const router = injector.get(Router);
        const urlActual = router.url;

        injector.get(AuthService).expireSession();
        sessionStorage.setItem('login_reason', 'session_expired');

        if (urlActual.startsWith('/') && !urlActual.startsWith('/auth/')) {
          sessionStorage.setItem('url_actual', urlActual);
        }

        // El 401 ya fue gestionado: no debe llegar al componente que originó
        // la petición para que no muestre el mensaje técnico "Unauthenticated".
        return EMPTY;
      }

      if (error.status === 403 && es_api_propia && req.url !== url_login) {
        mostrar_alerta_sin_permiso();
      }

      return throwError(() => error);
    })
  );
};

function mostrar_alerta_sin_permiso(): void {
  if (alerta_403_abierta) {
    return;
  }

  alerta_403_abierta = true;

  void Swal.fire({
    title: TITLE_MODAL,
    text: MESSAGE_ERROR_DEFAULT_403,
    icon: 'warning',
    confirmButtonText: 'Entendido',
  }).finally(() => {
    alerta_403_abierta = false;
  });
}
