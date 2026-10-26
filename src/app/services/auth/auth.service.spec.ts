import { TestBed } from '@angular/core/testing';
import { BsModalService } from 'ngx-bootstrap/modal';

import { AuthStatus } from '../../enums/auth-status.enum';
import { ImagenCacheService } from '../imagen-cache.service';
import { MenuService } from '../menu.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        { provide: BsModalService, useValue: { hide: vi.fn() } },
        { provide: ImagenCacheService, useValue: { limpiarCache: vi.fn() } },
        { provide: MenuService, useValue: { clearMenu: vi.fn() } },
      ],
    });
    service = TestBed.inject(AuthService);
  });

  afterEach(() => sessionStorage.clear());

  it('clears authentication data from memory and timestamps from session storage', () => {
    sessionStorage.setItem('last_activity', '2026-10-25T12:00:00Z');
    sessionStorage.setItem('fecha_expiracion', '2026-10-26T00:00:00Z');
    service.marcar_autenticado();

    service.expireSession();

    expect(service.authStatus()).toBe(AuthStatus.notAuthenticated);
    expect(service.get_token()).toBeNull();
    expect(sessionStorage.getItem('last_activity')).toBeNull();
    expect(sessionStorage.getItem('fecha_expiracion')).toBeNull();
  });
});
