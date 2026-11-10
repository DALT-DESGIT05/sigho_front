import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environments';
import { ProgramacionPersonalService } from './programacion-personal.service';

describe('ProgramacionPersonalService', () => {
  let service: ProgramacionPersonalService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProgramacionPersonalService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(ProgramacionPersonalService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('lists programming using the database field names returned by the API', () => {
    service.listar('2026-10').subscribe();

    const request = httpTesting.expectOne(
      `${environment.baseUrl}v1/personal/programaciones?mes=2026-10`,
    );

    expect(request.request.method).toBe('GET');
    request.flush({ data: [] });
  });

  it('lists configured turns using the database field names returned by the API', () => {
    service.listarTurnos().subscribe();

    const request = httpTesting.expectOne(`${environment.baseUrl}v1/personal/turnos`);

    expect(request.request.method).toBe('GET');
    request.flush({ data: [] });
  });

  it('creates a universal schedule header', () => {
    service.crearHorario({
      id_persona_personal: 55,
      id_especialidad: 2,
      id_am_ipress: 3,
      id_estado: 1,
      hor_mes: 10,
      hor_dia: 26,
      hor_objetivo: 8,
    }).subscribe();

    const request = httpTesting.expectOne(`${environment.baseUrl}v1/personal/horarios`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body.id_estado).toBe(1);
    request.flush({ data: { id_horario: 900 } });
  });

  it('creates a programming row and changes a schedule state', () => {
    service.crearProgramacion(900, {
      id_persona_personal: 55,
      id_horario_turno: 4,
      id_especialidad: 2,
      hor_fecha: '2026-10-26',
      hor_hora: 8,
    }).subscribe();

    const programmingRequest = httpTesting.expectOne(`${environment.baseUrl}v1/personal/horarios/900/programaciones`);
    expect(programmingRequest.request.method).toBe('POST');
    programmingRequest.flush({ data: { id_prog_per: 901 } });

    service.actualizarEstado(900, 2).subscribe();
    const stateRequest = httpTesting.expectOne(`${environment.baseUrl}v1/personal/horarios/900/estado`);
    expect(stateRequest.request.method).toBe('PATCH');
    expect(stateRequest.request.body).toEqual({ id_estado: 2 });
    stateRequest.flush({ data: [] });
  });

  it('creates and updates a universal turn', () => {
    const payload = {
      turno_hora_inicio: '07:00',
      turno_hora_fin: '13:00',
      turno_hora_duracion: 6,
      turno_desc: 'Mañana',
    };

    service.crearTurno(payload).subscribe();
    const createRequest = httpTesting.expectOne(`${environment.baseUrl}v1/personal/turnos`);
    expect(createRequest.request.method).toBe('POST');
    createRequest.flush({ data: { id_horario_turno: 4 } });

    service.actualizarTurno(4, payload).subscribe();
    const updateRequest = httpTesting.expectOne(`${environment.baseUrl}v1/personal/turnos/4`);
    expect(updateRequest.request.method).toBe('PUT');
    updateRequest.flush({ data: [] });
  });
});
