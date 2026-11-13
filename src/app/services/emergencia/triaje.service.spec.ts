import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environments';
import {
  CrearAtencionRequest,
  FiltrosSeguimientoTriaje,
  RegistrarTriajeRequest,
} from '../../interfaces/emergencia/triaje.interface';
import { TriajeService } from './triaje.service';

describe('TriajeService', () => {
  let service: TriajeService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TriajeService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('creates an emergency attention through its own endpoint', async () => {
    const request: CrearAtencionRequest = {
      paciente_id: 123,
      ind_discapacitado: false,
      atencion: {
        tipo_paciente_id: 1,
        especialidad_id: 13,
        procedencia_id: 1,
        numero_historia: '654321',
      },
    };

    const responsePromise = firstValueFrom(service.crearAtencion(request));
    const httpRequest = httpTesting.expectOne(`${environment.baseUrl}v1/emergencia/atenciones`);
    expect(httpRequest.request.method).toBe('POST');
    expect(httpRequest.request.body).toEqual(request);
    httpRequest.flush({ data: { atencion_id: 101 } });

    await expect(responsePromise).resolves.toMatchObject({ data: { atencion_id: 101 } });
  });

  it('registers triage without sending a client timestamp', async () => {
    const request: RegistrarTriajeRequest = {
      atencion_id: 101,
      triaje: {
        condicion_llegada_id: 40,
        motivo_ingreso_id: 50,
        nivel_triaje_codigo: 'III',
        motivo_consulta: 'Dolor abdominal',
        destino_area_id: 8,
        observacion: null,
      },
      control_vital: {
        observaciones: null,
        detalles: [{ parametro_codigo: 'TEMP', componente_codigo: null, valor: 37.2 }],
      },
    };

    const responsePromise = firstValueFrom(service.registrar(request));
    const httpRequest = httpTesting.expectOne(`${environment.baseUrl}v1/emergencia/triajes`);
    expect(httpRequest.request.method).toBe('POST');
    expect(httpRequest.request.body).toEqual(request);
    expect(httpRequest.request.body.control_vital.fecha_hora).toBeUndefined();
    httpRequest.flush({ data: { atencion_id: 101, triaje_id: 2 } });

    await expect(responsePromise).resolves.toMatchObject({ data: { triaje_id: 2 } });
  });

  it('loads an attention detail using the attention id query parameter', async () => {
    const responsePromise = firstValueFrom(service.obtener_contexto_medico(101));
    const request = httpTesting.expectOne(
      (candidate) => candidate.url === `${environment.baseUrl}v1/emergencia/atenciones/101/contexto-medico`,
    );

    expect(request.request.method).toBe('GET');
    request.flush({
      data: {
        atencion_id: 101,
        codigo_episodio: 'EME-00000101',
        fecha_hora_ingreso: '2026-10-28 10:00:00',
        estado_codigo: 'PRE',
        estado_nombre: 'Preregistrada',
        estado_seguimiento: 'PENDIENTE_TRIAJE',
        triaje_registrado: false,
        paciente: {
          paciente_id: 123,
          tipo_documento_id: 10,
          tipo_documento: 'DNI',
          numero_documento: '12345678',
          numero_historia: '654321',
          nombre_completo: 'PÉREZ JUAN',
          sexo_codigo: 'M',
          sexo: 'Masculino',
          edad: 30,
          parentesco: 'Titular',
          es_nn: false,
        },
        atencion: {
          tipo_paciente_id: 1,
          especialidad_id: 13,
          procedencia_id: 1,
          numero_historia: '654321',
        },
      },
    });

    await expect(responsePromise).resolves.toMatchObject({
      data: { atencion_id: 101, triaje_registrado: false },
    });
  });

  it('sends only populated tracking filters', async () => {
    const filtros: FiltrosSeguimientoTriaje = {
      documento: '12345678',
      numero_historia: '',
      motivo_consulta: 'dolor',
      estado: 'TRIADO',
      prioridad: 'II',
      personal: '',
      limite: 25,
    };

    const responsePromise = firstValueFrom(service.seguimiento(filtros));
    const request = httpTesting.expectOne(
      (candidate) => candidate.url === `${environment.baseUrl}v1/emergencia/atenciones/seguimiento`,
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('documento')).toBe('12345678');
    expect(request.request.params.get('motivo_consulta')).toBe('dolor');
    expect(request.request.params.get('estado')).toBe('TRIADO');
    expect(request.request.params.get('prioridad')).toBe('II');
    expect(request.request.params.get('limite')).toBe('25');
    expect(request.request.params.has('numero_historia')).toBe(false);
    request.flush({ data: [] });

    await expect(responsePromise).resolves.toMatchObject({ data: [] });
  });
});
