import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environments';
import { PacienteService } from './paciente.service';

describe('PacienteService', () => {
  let service: PacienteService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(PacienteService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('sends the entered term when searching patient options', () => {
    service.buscarPorTermino('PÉREZ 123').subscribe();

    const request = httpTesting.expectOne(
      `${environment.baseUrl}v1/pacientes/buscar?termino=P%C3%89REZ%20123`,
    );

    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('termino')).toBe('PÉREZ 123');
    request.flush({ data: [] });
  });

  it('filters searches for registered EXTRAFAP patients', () => {
    service.buscarPorTermino('PÉREZ 123', 'EXTRAFAP').subscribe();

    const request = httpTesting.expectOne(
      `${environment.baseUrl}v1/pacientes/buscar?termino=P%C3%89REZ%20123&tipo_paciente=EXTRAFAP`,
    );

    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('tipo_paciente')).toBe('EXTRAFAP');
    request.flush({ data: [] });
  });

  it('filters searches for FAP patients and affiliates', () => {
    service.buscarPorTermino('PÉREZ 123', 'FAP').subscribe();

    const request = httpTesting.expectOne(
      `${environment.baseUrl}v1/pacientes/buscar?termino=P%C3%89REZ%20123&tipo_paciente=FAP`,
    );

    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('tipo_paciente')).toBe('FAP');
    request.flush({ data: [] });
  });

  it('registers an unidentified patient with the selected sex', () => {
    service.registrarNn({ sexo_codigo: 'F' }).subscribe();

    const request = httpTesting.expectOne(`${environment.baseUrl}v1/pacientes/nn`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ sexo_codigo: 'F' });
    request.flush({ data: { paciente_id: 99, sexo_codigo: 'F' } });
  });

  it('registers an identified EXTRAFAP patient', () => {
    const payload = {
      tipo_documento_id: 1,
      numero_documento: '12345678',
      nombres: 'JUAN',
      apellido_paterno: 'PEREZ',
      apellido_materno: null,
      sexo_codigo: 'M' as const,
      fecha_nacimiento: '1990-01-15',
      celular: null,
      correo_electronico: 'juan@example.com',
    };

    service.registrarExtrafap(payload).subscribe();

    const request = httpTesting.expectOne(`${environment.baseUrl}v1/pacientes/extrafap`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ data: { paciente_id: 100, tipo_persona_fap: 2, es_nn: false } });
  });

  it('registers a selected FAP affiliate', () => {
    const payload = { codigo_afiliado: '00123456' };

    service.registrarFap(payload).subscribe();

    const request = httpTesting.expectOne(`${environment.baseUrl}v1/pacientes/fap`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ data: { paciente_id: 101, codigo_afiliado: '00123456' } });
  });
});
