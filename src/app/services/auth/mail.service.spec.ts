import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environments';
import { MOSTRAR_LOADING } from '../../interceptors/loading.interceptor';
import { MailService } from './mail.service';

describe('MailService', () => {
  let service: MailService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(MailService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('requests global loading while validating the recovery email', () => {
    service.validar_correo('usuario', 'usuario@fap.mil.pe', 0, '127.0.0.1', 'captcha').subscribe();

    const request = httpTesting.expectOne(`${environment.baseUrl}v1/usuario/validar_correo`);
    expect(request.request.context.get(MOSTRAR_LOADING)).toBe(true);
    request.flush({ data: { message: 'ok' } });
  });

  it('requests global loading while resetting the password', () => {
    service.restablecer_by_correo('clave-segura', 'clave-segura', 'codigo', 'usuario', 'usuario@fap.mil.pe', 0, '127.0.0.1').subscribe();

    const request = httpTesting.expectOne(`${environment.baseUrl}v1/usuario/restablecer_by_correo`);
    expect(request.request.context.get(MOSTRAR_LOADING)).toBe(true);
    request.flush({ data: {} });
  });
});
