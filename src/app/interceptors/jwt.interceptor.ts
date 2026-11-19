import { HttpEventType, HttpInterceptorFn } from '@angular/common/http';
import { Injector, inject } from '@angular/core';
import { catchError, EMPTY, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environments';
import { MESSAGE_ERROR_DEFAULT_403, TITLE_MODAL } from '../config/constants';
import { AuthService } from '../services/auth/auth.service';
import Swal from 'sweetalert2/dist/sweetalert2.esm.all.js';

let alerta_403_abierta = false;

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {

  const baseUrl:string=environment.baseUrl;
  const url_login = baseUrl + 'v1/auth/login/login';
  const url_logout = baseUrl + 'v1/auth/login/cerrar_sesion';
  const injector = inject(Injector);

  const auth_service = injector.get(AuthService);
  const token = auth_service.get_token();
  const es_api_propia = req.url.startsWith(baseUrl);

  if (es_api_propia) {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (req.url !== url_login && !!token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    req = req.clone({ setHeaders: headers });
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
          auth_service.actualizar_last_activity(last_activity);
        }
      }
    }),
    catchError((error) => {
      if (error.status === 401 && es_api_propia && req.url !== url_login) {
        injector.get(AuthService).expireSession();
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
    confirmButtonColor: '#3085d6',
  }).finally(() => {
    alerta_403_abierta = false;
  });
}
