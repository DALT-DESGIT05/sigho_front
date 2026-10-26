import { Injectable, computed, inject, signal } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { AuthInteface } from '../../interfaces/auth/auth.interface';
import { Usuario } from '../../interfaces/auth/usuario.interface';
import { AuthStatus } from '../../enums/auth-status.enum';
import { MenuService } from '../menu.service';
import { ImagenCacheService } from '../imagen-cache.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly menu_service = inject(MenuService);
  private readonly imagen_cache = inject(ImagenCacheService);
  private readonly modal_service = inject(BsModalService);
  private readonly _current_user = signal<Usuario | null>(null);
  private readonly _auth_status = signal<AuthStatus>(AuthStatus.checking);
  private readonly _token = signal<string | null>(null);
  readonly b_roles = signal<string[]>([]);
  readonly b_permisos = signal<string[]>([]);
  readonly b_fecha_expiracion = signal<AuthInteface['fecha_expiracion'] | null>(null);
  readonly b_last_activity = signal<string | null>(null);
  readonly b_ipress_sigla = signal<string | null>(null);
  readonly b_contrasena_cambiada = signal<number | null>(null);

  readonly currentUser = computed(() => this._current_user());
  readonly authStatus = computed(() => this._auth_status());

  constructor() {
    this._token.set(sessionStorage.getItem('token'));
  }

  has_permiso(permiso: string): boolean { return this.b_permisos().includes(permiso); }
  has_rol(rol: string): boolean { return this.b_roles().includes(rol); }
  get_roles(): string[] { return [...this.b_roles()]; }
  get_token(): string | null { return this._token(); }
  get_fecha_expiracion(): AuthInteface['fecha_expiracion'] | null { return this.b_fecha_expiracion(); }
  get_last_activity(): string | null { return this.b_last_activity(); }
  actualizar_last_activity(last_activity: string | null): void {
    this.b_last_activity.set(last_activity);
    if (last_activity) sessionStorage.setItem('last_activity', last_activity);
    else sessionStorage.removeItem('last_activity');
  }
  has_algun_permiso(permisos: string[]): boolean { return permisos.some((permiso) => this.has_permiso(permiso)); }
  has_algun_rol(roles: string[]): boolean { return roles.some((rol) => this.has_rol(rol)); }

  private normalizar_roles(roles: AuthInteface['roles'] | null | undefined): string[] {
    const propiedades_rol = ['nombre', 'nombre_rol', 'name', 'rol', 'codigo', 'cod_rol'];
    return (roles ?? []).map((rol) => {
      if (typeof rol === 'string') return rol;
      for (const propiedad of propiedades_rol) {
        const valor = rol[propiedad];
        if (typeof valor === 'string') return valor;
        if (valor && typeof valor === 'object') {
          const rol_anidado = valor as Record<string, unknown>;
          const nombre_anidado = rol_anidado['nombre'] ?? rol_anidado['name'];
          if (typeof nombre_anidado === 'string') return nombre_anidado;
        }
      }
      return '';
    }).filter((rol): rol is string => rol.length > 0);
  }

  private normalizar_permisos(permisos: AuthInteface['permisos'] | null | undefined): string[] {
    return this.normalizar_roles(permisos);
  }

  private actualizar_tiempos_sesion(fecha_expiracion: AuthInteface['fecha_expiracion'] | null | undefined, last_activity: string | null | undefined): void {
    this.b_fecha_expiracion.set(fecha_expiracion ?? null);
    this.b_last_activity.set(last_activity ?? null);
    if (fecha_expiracion) sessionStorage.setItem('fecha_expiracion', fecha_expiracion);
    else sessionStorage.removeItem('fecha_expiracion');
    if (last_activity) sessionStorage.setItem('last_activity', last_activity);
    else sessionStorage.removeItem('last_activity');
  }

  expireSession(): void {
    this.modal_service.hide();
    this.imagen_cache.limpiarCache();
    this._current_user.set(null);
    this._token.set(null);
    this.marcar_no_autenticado();
    this.menu_service.clearMenu();
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('last_activity');
    sessionStorage.removeItem('fecha_expiracion');
  }

  establecer_sesion(data: AuthInteface, last_activity: string | null = null): void {
    this.imagen_cache.limpiarCache();
    this._current_user.set(data.usuario);
    this._token.set(data.token);
    sessionStorage.setItem('token', data.token);
    this.b_roles.set(this.normalizar_roles(data.roles));
    this.b_permisos.set(this.normalizar_permisos(data.permisos));
    this.b_ipress_sigla.set(data.ipress_sigla);
    this.b_contrasena_cambiada.set(data.contrasena_cambiada);
    this.marcar_autenticado();
    this.actualizar_tiempos_sesion(data.fecha_expiracion, last_activity ?? data.last_activity);
  }

  marcar_autenticado(): void { this._auth_status.set(AuthStatus.authenticated); }

  marcar_no_autenticado(): void {
    this._current_user.set(null);
    this._token.set(null);
    this.b_roles.set([]);
    this.b_permisos.set([]);
    this.b_fecha_expiracion.set(null);
    this.b_last_activity.set(null);
    this.b_ipress_sigla.set(null);
    this.b_contrasena_cambiada.set(null);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('last_activity');
    sessionStorage.removeItem('fecha_expiracion');
    this._auth_status.set(AuthStatus.notAuthenticated);
  }
}
