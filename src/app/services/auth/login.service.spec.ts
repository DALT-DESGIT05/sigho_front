import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { BsModalService } from 'ngx-bootstrap/modal';

import { environment } from '../../../environments/environments';
import { AuthStatus } from '../../enums/auth-status.enum';
import { MOSTRAR_LOADING } from '../../interceptors/loading.interceptor';
import { AuthService } from './auth.service';
import { ImagenCacheService } from '../imagen-cache.service';
import { MenuService } from '../menu.service';
import { LoginService } from './login.service';

describe('LoginService', () => {
  let http_testing: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: BsModalService, useValue: { hide: vi.fn() } },
        { provide: ImagenCacheService, useValue: { limpiarCache: vi.fn() } },
        { provide: MenuService, useValue: { clearMenu: vi.fn(), fetchAndCache: () => of([]) } },
      ],
    });
    http_testing = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http_testing.verify();
    sessionStorage.clear();
  });

  it('restores authentication with a token stored in session storage at startup', () => {
    sessionStorage.setItem('token', 'token-de-prueba');
    TestBed.inject(LoginService);

    const request = http_testing.expectOne(`${environment.baseUrl}v1/auth/login/check_token`);
    expect(request.request.context.get(MOSTRAR_LOADING)).toBe(true);
    request.flush({
      data: {
        usuario: { codigo_persona: 1, nombres: 'Usuario', apellido_paterno: 'Prueba', apellido_materno: null },
        token: 'token-de-prueba',
        roles: [],
        permisos: [],
        last_activity: '2026-10-25T12:00:00Z',
        fecha_expiracion: '2026-10-26T00:00:00Z',
        ipress_sigla: null,
        contrasena_cambiada: 0,
      },
    });

    expect(TestBed.inject(AuthService).authStatus()).toBe(AuthStatus.authenticated);
    expect(sessionStorage.getItem('token')).toBe('token-de-prueba');
  });
});
