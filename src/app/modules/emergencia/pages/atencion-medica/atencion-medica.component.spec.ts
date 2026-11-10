import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { environment } from '../../../../../environments/environments';
import { SeguimientoTriaje } from '../../../../interfaces/emergencia/triaje.interface';
import { UtilService } from '../../../../services/util.service';
import { AtencionMedicaComponent } from './atencion-medica.component';

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
    }),
    crear_atencion({
      atencion_id: 2,
      codigo_episodio: 'EME-00000002',
      medico: 'RAMÍREZ SOTO LUIS',
      programacion_personal_id: 501,
      fecha_hora_llamada_med: '2026-11-05 10:15:00',
    }),
  ];

  beforeEach(async () => {
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
    httpTesting
      .expectOne(`${environment.baseUrl}v1/emergencia/cola-medica`)
      .flush({ data: atenciones });
    fixture.detectChanges();
  });

  afterEach(() => httpTesting.verify());

  it('shows the physician assignment and medical attention state', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Médico responsable');
    expect(element.textContent).toContain('Sin médico asignado');
    expect(element.textContent).toContain('RAMÍREZ SOTO LUIS');
    expect(element.textContent).toContain('Lista para atención');
    expect(element.textContent).toContain('Atención iniciada');
  });
});

function crear_atencion(
  cambios: Pick<
    SeguimientoTriaje,
    | 'atencion_id'
    | 'codigo_episodio'
    | 'medico'
    | 'programacion_personal_id'
    | 'fecha_hora_llamada_med'
  >,
): SeguimientoTriaje {
  return {
    ...cambios,
    paciente: {
      paciente_id: cambios.atencion_id,
      tipo_documento: 'DNI',
      numero_documento: '46825137',
      numero_historia: `HC-${cambios.atencion_id}`,
      nombre_completo: `PACIENTE ${cambios.atencion_id}`,
      edad: 36,
      es_nn: false,
    },
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
    fecha_hora_llegada: '2026-11-05 10:05:00',
    fecha_limite_atencion: '2026-11-05 10:15:00',
    minutos_restantes: 5,
    vencido: false,
  };
}
