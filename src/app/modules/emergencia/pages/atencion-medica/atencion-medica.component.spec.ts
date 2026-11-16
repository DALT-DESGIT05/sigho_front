import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { environment } from '../../../../../environments/environments';
import { SeguimientoTriaje } from '../../../../interfaces/emergencia/triaje.interface';
import { UtilService } from '../../../../services/util.service';
import { AtencionMedicaComponent, formatear_area_especialidad } from './atencion-medica.component';

describe('AtencionMedicaComponent', () => {
  let fixture: ComponentFixture<AtencionMedicaComponent>;
  let httpTesting: HttpTestingController;

  const atenciones: SeguimientoTriaje[] = [
    crear_atencion({
      atencion_id: 1,
      codigo_episodio: 'EME-00000001',
      medico: null,
      programacion_personal_id: null,
      fecha_hora_llamada_med: null,
      area: 'Consultorio de Emergencia',
      paciente: {
        paciente_id: 1,
        tipo_documento: 'DNI',
        numero_documento: '46825137',
        numero_historia: 'HC-1',
        apellido_paterno: 'MORIANO',
        apellido_materno: 'SAUÑE',
        nombres: 'ANDERSON',
        nombre_completo: 'MORIANO SAUÑE ANDERSON',
        edad: 36,
        grado_codigo: 'COR',
        situacion: 'ACTIVIDAD',
        es_nn: false,
      },
    }),
    crear_atencion({
      atencion_id: 2,
      codigo_episodio: 'EME-00000002',
      medico: 'RAMÍREZ SOTO LUIS',
      programacion_personal_id: 501,
      fecha_hora_llamada_med: '2026-11-05 10:15:00',
      area: 'Tópico de Enfemeria',
      paciente: {
        paciente_id: 2,
        tipo_documento: 'DNI',
        numero_documento: '09413316',
        numero_historia: 'HC-2',
        apellido_paterno: 'BIZARRO',
        apellido_materno: 'ALEJOS',
        nombres: 'LUIS MARINO',
        nombre_completo: 'BIZARRO ALEJOS LUIS MARINO',
        edad: 58,
        grado_codigo: 'TIP',
        situacion: 'RETIRO',
        es_nn: false,
      },
    }),
  ];

  beforeEach(async () => {
    Object.defineProperty(document, 'hidden', { value: false, configurable: true });

    await TestBed.configureTestingModule({
      imports: [AtencionMedicaComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: UtilService,
          useValue: {
            mostrar_error: vi.fn(),
            color_alerta: vi.fn(() => 'warning'),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AtencionMedicaComponent);
    httpTesting = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    httpTesting
      .expectOne((req) => req.url === `${environment.baseUrl}v1/catalogos`)
      .flush({
        data: {
          niveles_triaje: [{ value: 'II', label: 'Emergencia', color: 'NARANJA' }],
        },
      });

    fixture.componentInstance.cargando.set(false);
    fixture.componentInstance.atenciones.set(atenciones);
    fixture.componentInstance['cdr'].markForCheck();
    fixture.detectChanges();
  });

  afterEach(() => httpTesting.verify());

  it('renders listado de pacientes, formats patient name as GRADO (r) APELLIDOS Nombres and formats area', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Listado de Pacientes');
    expect(element.textContent).not.toContain('Cola de Atención Médica');
    expect(element.textContent).toContain('Área/Especialidad');
    expect(element.textContent).not.toContain('Médico responsable');

    // Patient 1 (active)
    expect(element.textContent).toContain('COR MORIANO SAUÑE Anderson');
    // Patient 2 (retired)
    expect(element.textContent).toContain('TIP (r) BIZARRO ALEJOS Luis Marino');

    // Area formatting
    expect(element.textContent).toContain('Consultorio de Emergencia');
    expect(element.textContent).toContain('Tópico');
    expect(element.textContent).not.toContain('Tópico de Enfemeria');
  });

  it('correctly formats area according to clinical specifications', () => {
    expect(formatear_area_especialidad('Consultorio de Emergencia')).toBe(
      'Consultorio de Emergencia',
    );
    expect(formatear_area_especialidad('Tópico de Enfemeria')).toBe('Tópico');
    expect(formatear_area_especialidad('Tópico de Enfermería')).toBe('Tópico');
    expect(formatear_area_especialidad('Topico')).toBe('Tópico');
    expect(formatear_area_especialidad('Trauma shock')).toBe('Trauma shock');
    expect(formatear_area_especialidad('Sala de observación')).toBe('Sala de observación');
    expect(formatear_area_especialidad(null)).toBe('-');
    expect(formatear_area_especialidad('')).toBe('-');
  });
});

function crear_atencion(
  cambios: Partial<SeguimientoTriaje> & { atencion_id: number; codigo_episodio: string },
): SeguimientoTriaje {
  return {
    motivo_consulta: 'Dolor torácico',
    motivo_ingreso: 'Enfermedad súbita',
    estado_seguimiento: 'TRIADO',
    estado_codigo: 'TRIC',
    estado_nombre: 'Triaje completado',
    prioridad: 'II',
    tiempo_maximo_atencion_minutos: 10,
    area: 'Consultorio de Emergencia',
    destino: 'Medicina General',
    fecha_hora_ingreso: '2026-11-05 10:00:00',
    fecha_hora_llamada_med: null,
    fecha_hora_llegada: '2026-11-05 10:05:00',
    fecha_limite_atencion: '2026-11-05 10:15:00',
    minutos_restantes: 5,
    vencido: false,
    medico: null,
    programacion_personal_id: null,
    paciente: {
      paciente_id: cambios.atencion_id,
      tipo_documento: 'DNI',
      numero_documento: '46825137',
      numero_historia: `HC-${cambios.atencion_id}`,
      nombre_completo: `PACIENTE ${cambios.atencion_id}`,
      edad: 36,
      es_nn: false,
    },
    ...cambios,
  };
}
