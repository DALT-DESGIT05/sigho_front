import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, finalize, map, of, tap, throwError, timeout } from 'rxjs';
import { environment } from '../../../environments/environments';
import { AuthInteface } from '../../interfaces/auth/auth.interface';
import { ResponseInteface } from '../../interfaces/response.interface';
import { DURACION_MINIMA_LOADING, MOSTRAR_LOADING } from '../../interceptors/loading.interceptor';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private readonly base_url = environment.baseUrl;
  private readonly http_client = inject(HttpClient);
  private readonly auth_service = inject(AuthService);

  constructor() {
    this.check_auth_status(true).subscribe();
  }

  login(usuario: string, contrasena: string, recuerdame: boolean, recaptcha: string): Observable<boolean> {
    const body = { usuario, contrasena, recuerdame: recuerdame ? '1' : '0', 'g-recaptcha-response': recaptcha };
    return this.http_client.post<ResponseInteface<AuthInteface>>(`${this.base_url}v1/auth/login/login`, body, {
      observe: 'response',
      context: new HttpContext().set(MOSTRAR_LOADING, true).set(DURACION_MINIMA_LOADING, 350),
    }).pipe(
      timeout(15000),
      tap((respuesta) => this.auth_service.establecer_sesion(
        respuesta.body!.data,
        respuesta.headers.get('x-last-activity') ?? respuesta.body!.last_activity
      )),
      map(() => true),
      catchError((error) => {
        const es_timeout = error?.name === 'TimeoutError';
        return throwError(() => ({
          data: error.error ?? {
            message: es_timeout
              ? 'El servidor no respondi\u00f3 a tiempo. Int\u00e9ntelo nuevamente.'
              : 'No se pudo conectar con el servidor.',
          },
          status: error.status ?? (es_timeout ? 408 : 0),
        }));
      })
    );
  }

  check_auth_status(mostrar_loading = false): Observable<boolean> {
    if (!this.auth_service.get_token()) {
      this.auth_service.marcar_no_autenticado();
      return of(false);
    }

    return this.http_client.get<ResponseInteface<AuthInteface>>(`${this.base_url}v1/auth/login/check_token`, {
      observe: 'response',
      context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading).set(DURACION_MINIMA_LOADING, 500),
    }).pipe(
      map((respuesta) => {
        this.auth_service.establecer_sesion(
          respuesta.body!.data,
          respuesta.headers.get('x-last-activity') ?? respuesta.body!.last_activity
        );
        return true;
      }),
      catchError(() => {
        this.auth_service.marcar_no_autenticado();
        return of(false);
      })
    );
  }

  logout(mostrar_loading = false): Observable<boolean> {
    const token = this.auth_service.get_token();
    if (!token) return of(false);

    return this.http_client.delete<ResponseInteface<unknown>>(`${this.base_url}v1/auth/login/cerrar_sesion`, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
      context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
    }).pipe(
      map(() => true),
      finalize(() => this.auth_service.expireSession()),
      catchError((error) => throwError(() => ({ data: error.error, status: error.status })))
    );
  }

  two_fa_enable(mostrar_loading = false) {
    return this.http_client.post<ResponseInteface<Array<any>>>(`${this.base_url}v1/2fa/activar`, {}, {
      context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
    }).pipe(
      map(({ message, data }) => ({ message, data })),
      catchError((error) => throwError(() => ({ data: error.error, status: error.status })))
    );
  }

  validate_2fa(otp: string, mostrar_loading = false) {
    return this.http_client.post<ResponseInteface<Array<any>>>(`${this.base_url}v1/2fa/verificar/${otp}`, {}, {
      context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
    }).pipe(
      map(({ message, data }) => {
        this.auth_service.marcar_autenticado();
        return { message, data };
      }),
      catchError((error) => throwError(() => ({ data: error.error, status: error.status })))
    );
  }
}
