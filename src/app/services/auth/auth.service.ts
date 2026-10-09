import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ResponseInteface } from '../../interfaces/response.interface';
import { environment } from '../../../environments/environments';
import { AuthInteface } from '../../interfaces/auth/auth.interface';
import { Usuario } from '../../interfaces/auth/usuario.interface';
import { AuthStatus } from '../../enums/auth-status.enum';
import { Observable, catchError, map, of, switchMap, tap, throwError, timeout } from 'rxjs';
import { MenuService } from '../menu.service';
import { ImagenCacheService } from '../imagen-cache.service';
import { DURACION_MINIMA_LOADING, MOSTRAR_LOADING } from '../../interceptors/loading.interceptor';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl: string = environment.baseUrl;
  private httpClient = inject(HttpClient);
  private menuService = inject(MenuService);
  private imagenCache = inject(ImagenCacheService);
  private readonly modal_service = inject(BsModalService);
  private _currentUser = signal<Usuario | null>(null);
  private _authStatus = signal<AuthStatus>(AuthStatus.checking);
  readonly b_roles = signal<string[]>([]);
  readonly b_permisos = signal<AuthInteface['permisos']>([]);
  readonly b_expiracion = signal<AuthInteface['expiracion'] | null>(null);
  readonly b_last_activity = signal<string | null>(null);

  public currentUser = computed(() => this._currentUser());
  public authStatus = computed(() => this._authStatus());

  has_permiso(permiso: string): boolean {
    return this.b_permisos().includes(permiso);
  }

  has_rol(rol: string): boolean {
    return this.b_roles().includes(rol);
  }

  get_roles(): string[] {
    return [...this.b_roles()];
  }

  get_expiracion(): AuthInteface['expiracion'] | null {
    return this.b_expiracion();
  }

  get_last_activity(): string | null {
    return this.b_last_activity();
  }

  actualizar_last_activity(last_activity: string | null): void {
    this.b_last_activity.set(last_activity);
  }

  has_algun_permiso(permisos: string[]): boolean {
    return permisos.some((permiso) => this.has_permiso(permiso));
  }

  has_algun_rol(roles: string[]): boolean {
    return roles.some((rol) => this.has_rol(rol));
  }

  private normalizar_roles(roles: AuthInteface['roles'] | null | undefined): string[] {
    const propiedades_rol = ['nombre', 'nombre_rol', 'name', 'rol', 'codigo', 'cod_rol'];

    return (roles ?? [])
      .map((rol) => {
        if (typeof rol === 'string') {
          return rol;
        }

        for (const propiedad of propiedades_rol) {
          const valor = rol[propiedad];

          if (typeof valor === 'string') {
            return valor;
          }

          if (valor && typeof valor === 'object') {
            const rol_anidado = valor as Record<string, unknown>;
            const nombre_anidado = rol_anidado['nombre'] ?? rol_anidado['name'];

            if (typeof nombre_anidado === 'string') {
              return nombre_anidado;
            }
          }
        }

        return '';
      })
      .filter((rol): rol is string => rol.length > 0);
  }

  private actualizar_tiempos_memoria(
    expiracion: AuthInteface['expiracion'] | null | undefined,
    last_activity: string | null | undefined
  ): void {
    this.b_expiracion.set(expiracion ?? null);
    this.b_last_activity.set(last_activity ?? null);
  }

  private sessionStorageKeys = [
    'userRole', 'token', 'nsa', 'telefono', 'email',
    'contrasena_cambiada', 'unidad', 'nombre_unidad', 'es_ipress'
  ];

  constructor() {
    sessionStorage.removeItem('expiracion');
    sessionStorage.removeItem('last_activity');
    this.checkAuthStatus().subscribe();
  }

  /** Cierra la sesión en el navegador sin depender de una respuesta de la API. */
  expireSession(): void {
    this.modal_service.hide();
    this.imagenCache.limpiarCache();
    this._currentUser.set(null);
    this.b_roles.set([]);
    this.b_permisos.set([]);
    this.b_expiracion.set(null);
    this.b_last_activity.set(null);
    this._authStatus.set(AuthStatus.notAuthenticated);
    this.menuService.clearMenu();
    this.sessionStorageKeys.forEach(key => sessionStorage.removeItem(key));
    sessionStorage.removeItem('enfermedadActual');
    sessionStorage.removeItem('evaluacion');
    sessionStorage.removeItem('llamado-paciente');
    sessionStorage.removeItem('diagonostico');
    sessionStorage.clear();
  }

  login(usuario: string, contrasena: string, recuerdame: boolean, recaptcha: string): Observable<boolean> {
    this.imagenCache.limpiarCache();

    const url = this.baseUrl + 'v1/login';
    const _recuerdame = recuerdame ? '1' : '0';
    const body = { usuario, contrasena, 'recuerdame': _recuerdame, 'g-recaptcha-response': recaptcha };

    return this.httpClient.post<ResponseInteface<AuthInteface>>(url, body, {
      observe: 'response',
      context: new HttpContext()
        .set(MOSTRAR_LOADING, true)
        .set(DURACION_MINIMA_LOADING, 350)
    })
      .pipe(
        timeout(15000),
        tap((respuesta) => {
          const cuerpo = respuesta.body!;
          const { data } = cuerpo;

          this._currentUser.set(data.usuario);
          this.b_roles.set(this.normalizar_roles(data.roles));
          this.b_permisos.set(data.permisos ?? []);
          this._authStatus.set(AuthStatus.authenticated);
          sessionStorage.setItem('token', data.token);
          sessionStorage.setItem('nsa', data.usuario.nsa);
          sessionStorage.setItem('telefono', data.usuario.telefono!);
          sessionStorage.setItem('email', data.usuario.email!);
          sessionStorage.setItem('contrasena_cambiada', data.usuario.contrasena_cambiada);
          sessionStorage.setItem('unidad', data.unidad);
          sessionStorage.setItem('nombre_unidad', data.nombre_unidad);
          sessionStorage.setItem('es_ipress', String(data.es_ipress));
          this.actualizar_tiempos_memoria(
            data.expiracion,
            respuesta.headers.get('x-last-activity') ?? cuerpo.last_activity
          );
        }),
        switchMap(() => this.menuService.fetchAndCache().pipe(catchError(() => of([])))),
        map(() => true),
        catchError(error => {
          const es_timeout = error?.name === 'TimeoutError';
          const data_error = {
            data: error.error ?? {
              message: es_timeout
                ? 'El servidor no respondió a tiempo. Inténtelo nuevamente.'
                : 'No se pudo conectar con el servidor.',
            },
            status: error.status ?? (es_timeout ? 408 : 0),
          };
          return throwError(() => data_error);
        })
      );
  }

  checkAuthStatus(mostrar_loading = false): Observable<boolean> {
    const url = this.baseUrl + 'v1/check_token';
    const token = sessionStorage.getItem('token');

    if (!token) {
      this._authStatus.set(AuthStatus.notAuthenticated);
      return of(false);
    }

    return this.httpClient.get<ResponseInteface<AuthInteface>>(url, {
      observe: 'response',
      context: new HttpContext()
        .set(MOSTRAR_LOADING, mostrar_loading)
        .set(DURACION_MINIMA_LOADING, 500)
    })
      .pipe(
        map((respuesta) => {
          const cuerpo = respuesta.body!;
          const { data } = cuerpo;

          this._currentUser.set(data.usuario);
          this.b_roles.set(this.normalizar_roles(data.roles));
          this.b_permisos.set(data.permisos ?? []);
          this._authStatus.set(AuthStatus.authenticated);
          sessionStorage.setItem('nsa', data.usuario.nsa);
          sessionStorage.setItem('telefono', data.usuario.telefono!);
          sessionStorage.setItem('email', data.usuario.email!);
          sessionStorage.setItem('contrasena_cambiada', data.usuario.contrasena_cambiada);
          sessionStorage.setItem('unidad', data.unidad);
          sessionStorage.setItem('nombre_unidad', data.nombre_unidad);
          sessionStorage.setItem('es_ipress', String(data.es_ipress));
          this.actualizar_tiempos_memoria(
            data.expiracion,
            respuesta.headers.get('x-last-activity') ?? cuerpo.last_activity
          );
          return true;
        }),
        catchError(() => {
          this.b_roles.set([]);
          this.b_permisos.set([]);
          this.b_expiracion.set(null);
          this.b_last_activity.set(null);
          this._authStatus.set(AuthStatus.notAuthenticated);
          return of(false);
        })
      );
  }

  logout(mostrar_loading = false): Observable<boolean> {
    const url = this.baseUrl + 'v1/cerrar_sesion';
    const token = sessionStorage.getItem('token');

    if (!token) { return of(false); }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.httpClient.delete<ResponseInteface<any>>(url, {
      headers,
      context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
    })
      .pipe(
        map(() => {
          this.expireSession();
          return true;
        }),
        catchError((error) => {
          const data_error = { 'data': error.error, 'status': error.status };
          return throwError(() => data_error);
        })
      );
  }

  two_fa_enable(mostrar_loading = false) {
    const url = this.baseUrl + `v1/2fa/activar`;

    return this.httpClient.post<ResponseInteface<Array<any>>>(url, {  }, {
      context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
    })
      .pipe(
        map(({ message, data, status }) => {
          return { message, data };
        }),
        catchError((error) => {
          const data_error = { 'data': error.error, 'status': error.status }
          return throwError(() => data_error);
        })
      );
  }

  validate_2fa(otp:string, mostrar_loading = false){
    const url = this.baseUrl + `v1/2fa/verificar/`+otp;

    return this.httpClient.post<ResponseInteface<Array<any>>>(url, {  }, {
      context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
    })
      .pipe(
        map(({ message, data, status }) => {
          this._authStatus.set(AuthStatus.authenticated);
          return { message, data };
        }),
        catchError((error) => {
          const data_error = { 'data': error.error, 'status': error.status }
          return throwError(() => data_error);
        })
      );
  }
}
