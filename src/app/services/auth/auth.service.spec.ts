import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BsModalService } from 'ngx-bootstrap/modal';

import { environment } from '../../../environments/environments';
import { MOSTRAR_LOADING } from '../../interceptors/loading.interceptor';
import { ImagenCacheService } from '../imagen-cache.service';
import { MenuService } from '../menu.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: BsModalService, useValue: { hide: vi.fn() } },
        { provide: ImagenCacheService, useValue: { limpiarCache: vi.fn() } },
        { provide: MenuService, useValue: { clearMenu: vi.fn(), fetchAndCache: vi.fn() } },
      ],
    });
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    sessionStorage.clear();
  });

  it('requests loading through the interceptor when checking a stored token at startup', () => {
    sessionStorage.setItem('token', 'token-de-prueba');
    TestBed.inject(AuthService);

    const request = httpTesting.expectOne(`${environment.baseUrl}v1/auth/check_token`);
    expect(request.request.context.get(MOSTRAR_LOADING)).toBe(true);
    request.flush({
      data: {
        usuario: { nsa: '123', telefono: '', email: '', contrasena_cambiada: '0' },
        roles: [],
        permisos: [],
        unidad: '',
        nombre_unidad: '',
        es_ipress: false,
      },
    });
  });
});
