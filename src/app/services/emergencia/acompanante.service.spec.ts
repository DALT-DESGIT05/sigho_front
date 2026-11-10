import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environments';
import { AcompananteService } from './acompanante.service';

describe('AcompananteService', () => {
  let service: AcompananteService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AcompananteService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('searches people by term and companion type', () => {
    service.buscar('ANA PEREZ', 0).subscribe();

    const request = httpTesting.expectOne(
      `${environment.baseUrl}v1/acompanantes/buscar?termino=ANA%20PEREZ&tipo_acompanante=0`,
    );
    expect(request.request.method).toBe('GET');
    request.flush({ data: [] });
  });

  it('registers and links a companion to a patient', () => {
    const requestBody = {
      paciente_id: 10,
      tipo_documento_id: 1,
      numero_documento: '12345678',
      sexo_codigo: 'F',
      nombres: 'ANA',
      apellido_paterno: 'PÉREZ',
      apellido_materno: 'SOTO',
      fecha_nacimiento: '1990-05-10',
      parentesco_id: 1,
      tipo_acompanante: 0 as const,
      celular: '999888777',
      correo_electronico: 'ana@example.com',
    };

    service.registrar(requestBody).subscribe();

    const request = httpTesting.expectOne(`${environment.baseUrl}v1/acompanantes`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(requestBody);
    request.flush({ data: { paciente_id: 10, acompanante_id: 90 } });
  });
});
