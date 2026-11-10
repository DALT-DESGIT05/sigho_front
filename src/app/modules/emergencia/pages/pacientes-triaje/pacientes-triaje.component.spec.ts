import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { environment } from '../../../../../environments/environments';
import { SeguimientoTriaje } from '../../../../interfaces/emergencia/triaje.interface';
import { UtilService } from '../../../../services/util.service';
import { PacientesTriajeComponent } from './pacientes-triaje.component';

describe('PacientesTriajeComponent', () => {
  let fixture: ComponentFixture<PacientesTriajeComponent>;
  let component: PacientesTriajeComponent;
  let httpTesting: HttpTestingController;
  const utilService = {
    mostrar_error: vi.fn(),
    mostrar_alerta: vi.fn(),
    color_alerta: vi.fn((color: string | null) => (color === 'ROJO' ? 'danger' : 'warning')),
  };
  const seguimientos: SeguimientoTriaje[] = [
    {
      atencion_id: 1,
      codigo_episodio: 'EME-00000001',
      paciente: {
        paciente_id: 10,
        tipo_documento: 'DNI',
        numero_documento: '46825137',
        numero_historia: 'HC-105842',
        nombre_completo: 'PÉREZ GARCÍA JUAN CARLOS',
        edad: 36,
        es_nn: false,
      },
      motivo_consulta: 'Dolor torácico',
      motivo_ingreso: 'Enfermedad súbita',
      estado_seguimiento: 'TRIADO',
      estado_codigo: 'TRI',
      estado_nombre: 'Triado',
      prioridad: 'I',
      tiempo_maximo_atencion_minutos: 0,
      area: 'Emergencia adultos',
      destino: 'Emergencia adultos',
      programacion_personal_id: 501,
      medico: 'RAMÍREZ SOTO LUIS',
      fecha_hora_ingreso: '2026-10-25 08:35:00',
      fecha_hora_llamada_med: '2026-10-25 08:45:00',
      fecha_hora_llegada: '2026-10-25 08:40:00',
      fecha_limite_atencion: '2026-10-25 08:40:00',
      minutos_restantes: -5,
      vencido: true,
    },
    {
      atencion_id: 2,
      codigo_episodio: 'NN-00000002',
      paciente: {
        paciente_id: 11,
        tipo_documento: 'NN',
        numero_documento: null,
        numero_historia: null,
        nombre_completo: 'NN NN',
        edad: null,
        es_nn: true,
      },
      motivo_consulta: null,
      motivo_ingreso: null,
      estado_seguimiento: 'PENDIENTE_TRIAJE',
      estado_codigo: 'PRE',
      estado_nombre: 'Preregistrada',
      prioridad: null,
      tiempo_maximo_atencion_minutos: null,
      area: 'Emergencia adultos',
      destino: 'Emergencia adultos',
      programacion_personal_id: null,
      medico: null,
      fecha_hora_ingreso: '2026-10-25 09:10:00',
      fecha_hora_llamada_med: null,
      fecha_hora_llegada: null,
      fecha_limite_atencion: null,
      minutos_restantes: null,
      vencido: false,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacientesTriajeComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UtilService, useValue: utilService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PacientesTriajeComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    httpTesting
      .expectOne((request) => request.url === `${environment.baseUrl}v1/catalogos`)
      .flush({
      data: {
        niveles_triaje: [
          { value: 'I', label: 'Resucitación', color: 'ROJO', tiempo_maximo_atencion_minutos: 0 },
          {
            value: 'II',
            label: 'Emergencia',
            color: 'NARANJA',
            tiempo_maximo_atencion_minutos: 10,
          },
        ],
      },
    });
    httpTesting
      .expectOne(
        (request) =>
          request.url === `${environment.baseUrl}v1/emergencia/atenciones/seguimiento` &&
          request.params.get('limite') === '50',
      )
      .flush({ data: seguimientos });
    fixture.detectChanges();
  });

  afterEach(() => httpTesting.verify());

  it('renders real emergency tracking results', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(Object.keys(component.filtros_model())).toEqual([
      'documento',
      'numero_historia',
      'motivo_consulta',
      'estado',
      'prioridad',
      'personal',
      'limite',
    ]);
    expect(element.textContent).not.toContain('HCE - EMERGENCIA: Pacientes de Triaje');
    expect(element.textContent).toContain('EME-00000001');
    expect(element.textContent).toContain('NN-00000002');
    expect(element.textContent).not.toContain('Fecha Límite');
    expect(element.textContent).not.toContain('Min. Restantes');
    expect(element.textContent).not.toContain('Acreditación');
    expect(element.querySelector('app-table')?.textContent).not.toContain('Documento');
    expect(element.querySelector('app-table thead')?.textContent).not.toContain('Historia');
    expect(element.querySelector('app-table thead')?.textContent).toContain('Edad');
    expect(element.textContent).not.toContain('Vencido');
    expect(element.textContent).toContain('Fecha y Hora');
    expect(element.textContent).toContain('Motivo de Ingreso');
    expect(element.textContent).toContain('Médico responsable');
    expect(element.textContent).toContain('RAMÍREZ SOTO LUIS');
    expect(element.textContent).toContain('Sin médico asignado');
    expect(element.textContent).toContain('Estado');
    expect(element.querySelector('app-table')?.textContent).toContain('PÉREZ GARCÍA JUAN CARLOS');
    expect(element.querySelector('app-table table')?.classList.contains('app-table--sm')).toBe(
      true,
    );
    expect(element.querySelectorAll('app-table tbody tr')).toHaveLength(2);
    expect(component.personalOptions()).toEqual([
      { value: '', label: 'Todos' },
      { value: 'RAMÍREZ SOTO LUIS', label: 'RAMÍREZ SOTO LUIS' },
    ]);
  });

  it('sends document, state and priority filters to the backend', () => {
    component.filtros_model.update((filtros) => ({
      ...filtros,
      documento: '7021',
      estado: 'TRIADO',
      prioridad: 'II',
      personal: 'Luis Ramírez',
    }));

    component.consultar();

    const request = httpTesting.expectOne(
      (candidate) => candidate.url === `${environment.baseUrl}v1/emergencia/atenciones/seguimiento`,
    );
    expect(request.request.params.get('documento')).toBe('7021');
    expect(request.request.params.get('estado')).toBe('TRIADO');
    expect(request.request.params.get('prioridad')).toBe('II');
    expect(request.request.params.get('personal')).toBe('Luis Ramírez');
    request.flush({ data: [seguimientos[0]] });
    fixture.detectChanges();

    expect(component.seguimientos()).toHaveLength(1);
  });

  it('consults directly without confirmation when filters are provided', () => {
    component.filtros_model.update((filtros) => ({
      ...filtros,
      documento: '46825137',
    }));
    component.consultar(new Event('submit'));

    const request = httpTesting.expectOne(
      (candidate) => candidate.url === `${environment.baseUrl}v1/emergencia/atenciones/seguimiento`,
    );
    request.flush({ data: [] });
  });

  it('disables the search button when no filters are set', () => {
    expect(component.puede_buscar()).toBe(false);

    component.filtros_model.update((filtros) => ({
      ...filtros,
      estado: 'PENDIENTE_TRIAJE',
    }));
    expect(component.puede_buscar()).toBe(true);
  });

  it('resets the filters and reloads the initial results', () => {
    component.filtros_model.update((filtros) => ({
      ...filtros,
      documento: '7021',
      prioridad: 'II',
      personal: 'RAMÍREZ SOTO LUIS',
    }));
    component.seguimientos.set([]);

    component.limpiar_consulta();

    httpTesting
      .expectOne(
        (request) =>
          request.url === `${environment.baseUrl}v1/emergencia/atenciones/seguimiento` &&
          request.params.get('limite') === '50',
      )
      .flush({ data: seguimientos });

    expect(component.filtros_model()).toEqual({
      documento: '',
      numero_historia: '',
      motivo_consulta: '',
      estado: '',
      prioridad: '',
      personal: '',
      limite: 50,
    });
    expect(component.seguimientos()).toEqual(seguimientos);
  });

  it('shows priority and tracking status badges', () => {
    const element = fixture.nativeElement as HTMLElement;
    const priority_badge = element.querySelector('app-table tbody tr app-badge');

    expect(element.querySelectorAll('app-badge')).toHaveLength(6);
    expect(element.querySelector('app-badge .danger')).toBeTruthy();
    expect(priority_badge?.textContent?.trim()).toBe('I');
    expect(priority_badge?.textContent).not.toContain('Resucitación');
    expect(priority_badge?.querySelector('.priority-badge-solid.danger')).toBeTruthy();
    expect(element.textContent).toContain('Preregistrada');
  });

  it('navigates to admission from the header action', () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.nueva_admision();

    expect(navigate).toHaveBeenCalledWith(['/emergencia/admision']);
  });

  it('opens the triage registration modal for a pending attention', () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const action_buttons = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '.table-actions app-button button',
    );

    expect(action_buttons).toHaveLength(2);
    expect(Array.from(action_buttons).map((button) => button.getAttribute('title'))).toEqual(
      expect.arrayContaining(['Triar', 'Ver ticket']),
    );
    expect(Array.from(action_buttons).every((button) => button.textContent?.trim() === '')).toBe(
      true,
    );

    component.ejecutar_accion({ action: 'triar', row: seguimientos[1] });

    expect(component.mostrar_modal_triaje()).toBe(true);
    expect(component.atencion_en_triaje()?.atencion_id).toBe(2);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('opens the ticket returned after a successful triage and refreshes the queue', () => {
    vi.useFakeTimers();
    const ticket = {
      numero_registro: 'NN-00000002',
      ipress: 'Hospital Central FAP',
      numero_fua: null,
      numero_acreditacion: null,
      nsa: null,
      documento: null,
      destino: null,
      prioridad_codigo: 'III',
      prioridad_color: 'AMARILLO',
      area: 'Emergencia adultos',
      signos_vitales: [
        {
          control_vital_detalle_id: 1,
          parametro_codigo: 'TEMP',
          componente_codigo: null,
          valor: '36.5',
          alerta: null,
        },
      ],
      motivo_consulta: 'Dolor abdominal',
      triado_por: 'ANA PÉREZ GARCÍA',
      fecha_hora: '2026-10-28 10:05:00',
      referencias_pendientes: ['numero_fua', 'numero_acreditacion', 'destino'],
    };
    component.atencion_en_triaje.set(seguimientos[1]);

    component.completar_triaje(ticket);

    httpTesting
      .expectOne(
        (request) =>
          request.url === `${environment.baseUrl}v1/emergencia/atenciones/seguimiento` &&
          request.params.get('limite') === '50',
      )
      .flush({ data: seguimientos });
    component.cerrar_modal_triaje();

    expect(component.ticket_triaje()).toEqual(ticket);
    expect(component.paciente_ticket()).toBe('NN NN');
    expect(component.mostrar_modal_ticket()).toBe(true);
    expect(component.valor_ticket('TEMP')).toBe('36.5');
    expect(component.prioridad_ticket('I', 'Resucitación')).toBe('I - Resucitación');
    expect(component.prioridad_ticket('II')).toBe('II - Emergencia');
    expect(component.fecha_ticket(ticket.fecha_hora)).toBe('2026-10-28');
    expect(component.hora_ticket(ticket.fecha_hora)).toBe('10:05:00');

    component.cerrar_modal_ticket();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('retrieves and opens the ticket for a triaged attention', () => {
    vi.useFakeTimers();
    const ticket = {
      numero_registro: 'EME-00000001',
      ipress: 'Hospital Central FAP',
      numero_fua: null,
      numero_acreditacion: null,
      nsa: '105842',
      documento: '46825137',
      destino: null,
      prioridad_codigo: 'I',
      prioridad_color: 'ROJO',
      area: 'Emergencia adultos',
      signos_vitales: [],
      motivo_consulta: 'Dolor torácico',
      triado_por: 'ANA PÉREZ GARCÍA',
      fecha_hora: '2026-10-25 08:40:00',
      referencias_pendientes: ['numero_fua', 'numero_acreditacion', 'destino'],
    };

    component.ejecutar_accion({ action: 'ver_ticket', row: seguimientos[0] });
    fixture.detectChanges();

    const ticket_button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      'button[title="Ver ticket"]',
    );
    expect(ticket_button?.disabled).toBe(true);
    expect(component.cargando_ticket_atencion_id()).toBe(1);

    const request = httpTesting.expectOne(
      `${environment.baseUrl}v1/emergencia/triajes/ticket?atencion_id=1`,
    );
    expect(request.request.method).toBe('GET');
    request.flush({ data: ticket });

    expect(component.ticket_triaje()).toEqual(ticket);
    expect(component.paciente_ticket()).toBe('PÉREZ GARCÍA JUAN CARLOS');
    expect(component.mostrar_modal_ticket()).toBe(true);
    expect(component.cargando_ticket_atencion_id()).toBeNull();
    vi.clearAllTimers();
    vi.useRealTimers();
  });
});
