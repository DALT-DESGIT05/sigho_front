import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import Swal from 'sweetalert2/dist/sweetalert2.esm.all.js';
import { vi } from 'vitest';
import { environment } from '../../../../../environments/environments';
import { UtilService } from '../../../../services/util.service';
import { RegistroTriajeComponent } from './registro-triaje.component';

describe('RegistroTriajeComponent', () => {
  let fixture: ComponentFixture<RegistroTriajeComponent>;
  let component: RegistroTriajeComponent;
  let http_testing: HttpTestingController;
  const util_service = {
    mostrar_alerta: vi.fn(),
    mostrar_error: vi.fn(),
    temperature_status: vi.fn(() => 'secondary'),
    saturation_status: vi.fn(() => 'secondary'),
    heart_rate_status: vi.fn(() => 'secondary'),
    respiratory_rate_status: vi.fn(() => 'secondary'),
    imc_status: vi.fn(() => 'secondary'),
    systolic_status: vi.fn(() => 'secondary'),
    diastolic_status: vi.fn(() => 'secondary'),
    estado_desde_maestro: vi.fn(() => null),
    progress_bar_classes: vi.fn(() => ''),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroTriajeComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ atencion_id: '101' }) } },
        },
        { provide: UtilService, useValue: util_service },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroTriajeComponent);
    component = fixture.componentInstance;
    http_testing = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    const detail_request = http_testing.expectOne(
      (request) =>
        request.url === `${environment.baseUrl}v1/emergencia/atenciones/101/contexto-medico`,
    );
    detail_request.flush({
      data: {
        atencion_id: 101,
        codigo_episodio: 'EME-00000101',
        fecha_hora_ingreso: '2026-10-28 10:00:00',
        estado_codigo: 'REG',
        estado_nombre: 'Registrada',
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
    http_testing.expectOne(`${environment.baseUrl}v1/catalogos`).flush({
      data: {
        tipos_documento: [{ value: 10, codigo: 'DNI', label: 'Documento Nacional de Identidad' }],
        sexos: [
          { value: 1, codigo: 'M', label: 'Masculino' },
          { value: 2, codigo: 'F', label: 'Femenino' },
        ],
        parentescos: [{ value: 20, codigo: 'PAD', label: 'Padre' }],
        condiciones_llegada: [{ value: 40, label: 'Ambulatorio' }],
        motivos_ingreso: [{ value: 50, label: 'Accidente' }],
        areas: [
          { value: 25, codigo: 'CON-EMER', label: 'Consultorio de Emergencia' },
          { value: 21, codigo: 'TRMSH', label: 'Trauma shock' },
        ],
        areas_emergencia: [
          { value: 25, codigo: 'CON-EMER', label: 'Consultorio de Emergencia' },
          { value: 21, codigo: 'TRMSH', label: 'Trauma shock' },
        ],
        destinos_consultorio: [{ value: 13, label: 'Medicina Interna' }],
        niveles_triaje: [
          {
            value: 'I',
            label: 'Resucitación',
            color: 'ROJO',
            tiempo_maximo_atencion_minutos: 0,
          },
          {
            value: 'III',
            label: 'Urgencia',
            color: 'AMARILLO',
            tiempo_maximo_atencion_minutos: 60,
          },
        ],
      },
    });
    http_testing.expectOne(`${environment.baseUrl}v1/catalogos/signos-vitales`).flush({
      data: {
        parametros: [
          {
            codigo: 'TEMP',
            nombre: 'Temperatura',
            tipo_parametro: 'Signo vital',
            tipo_dato: 'DECIMAL',
            cantidad_decimales: 1,
            permite_negativo: false,
            genera_alerta: true,
            requiere_observacion: false,
            valor_minimo_admisible: 25,
            valor_maximo_admisible: 45,
            unidad_medida_id: 266,
            unidad_medida_nombre: 'GRADOS CELSIUS',
            requiere_componentes: false,
            componentes: [],
            rangos_normales: [],
            niveles_alerta: [],
          },
          {
            codigo: 'EVA',
            nombre: 'Escala EVA',
            tipo_parametro: 'Escala clínica',
            tipo_dato: 'ENTERO',
            cantidad_decimales: 0,
            permite_negativo: false,
            genera_alerta: true,
            requiere_observacion: false,
            valor_minimo_admisible: 0,
            valor_maximo_admisible: 10,
            unidad_medida_id: 64,
            unidad_medida_nombre: 'UNIDAD',
            requiere_componentes: false,
            componentes: [],
            rangos_normales: [],
            niveles_alerta: [],
          },
        ],
      },
    });
    fixture.detectChanges();
  });

  it('forces priority I and Trauma Shock for an NN patient', () => {
    const detalle = component.detalle_atencion();
    expect(detalle).not.toBeNull();

    component.detalle_atencion.set({
      ...detalle!,
      paciente: { ...detalle!.paciente, es_nn: true },
    });
    (component as unknown as { aplicar_reglas_paciente_nn: () => void }).aplicar_reglas_paciente_nn();
    fixture.detectChanges();

    expect(component.triaje_model().prioridad).toBe('I');
    expect(component.triaje_model().destinoAreaId).toBe(21);
    expect(component.prioridadesVisibles().map((prioridad) => prioridad.value)).toEqual(['I']);
    expect(component.destinoOptionsVisibles()).toEqual([
      { value: 21, codigo: 'TRMSH', label: 'Trauma shock' },
    ]);

    component.update_priority('III');
    expect(component.triaje_model().prioridad).toBe('I');
  });

  afterEach(() => {
    util_service.imc_status.mockReturnValue('secondary');
    http_testing.verify();
  });

  it('loads the existing emergency attention without displaying its summary', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent;

    expect(component.detalle_atencion()?.atencion_id).toBe(101);
    expect(text).not.toContain('Episodio de Emergencia');
    expect(text).not.toContain('EME-00000101');
    expect(text).not.toContain('PÉREZ JUAN');
    expect(text).not.toContain('Buscar historia clínica');
    http_testing.expectNone(`${environment.baseUrl}v1/pacientes/nn`);
    http_testing.expectNone(`${environment.baseUrl}v1/emergencia/atenciones`);
  });

  it('uses standard card-general sections matching other modules', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelectorAll('app-card-general')).toHaveLength(3);
    expect(element.querySelector('app-card-general')?.textContent).toContain('Valorización');
  });

  it('does not render companion registration in triage', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('app-acompanante-modal')).toBeNull();
    expect(element.textContent).not.toContain('Registrar acompañante');
  });

  it('activates compact columns only at the large modal breakpoint', () => {
    component.pasoActual.set(2);
    fixture.detectChanges();

    const columns = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll(
        '.vital-sign-card, .triage-attention-grid > div',
      ),
    );

    expect(
      columns.some((column) =>
        Array.from(column.classList).some((class_name) => class_name.startsWith('col-md-')),
      ),
    ).toBe(false);
    expect(
      columns.some((column) =>
        Array.from(column.classList).some((class_name) => class_name.startsWith('col-lg-')),
      ),
    ).toBe(true);
  });

  it('uses compact clinical abbreviations without losing full field titles', () => {
    component.pasoActual.set(2);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Temp. (°C)');
    expect(element.textContent).toContain('PAS (mmHg)');
    expect(element.textContent).toContain('PAD (mmHg)');
    expect(element.textContent).toContain('Sat. O₂ (%)');
    expect(element.textContent).toContain('FC (lpm)');
    expect(element.textContent).toContain('FR (rpm)');
    expect(element.querySelector('[title="Frecuencia cardíaca"]')).toBeTruthy();
  });

  it('submits triage against the existing attention without creating patient or attention', async () => {
    vi.spyOn(Swal, 'fire').mockResolvedValue({ isConfirmed: true } as never);
    const triaje_registrado = vi.fn();
    component.triaje_registrado.subscribe(triaje_registrado);
    component.triaje_model.update((value) => ({
      ...value,
      condicionLlegada: 40,
      motivoIngreso: 50,
      prioridad: 'III',
      motivoConsulta: 'Dolor abdominal',
      destinoAreaId: 25,
      destinoEspecialidadId: 13,
      temperatura: '37.2',
    }));

    await component.guardar_triaje();

    http_testing.expectNone(`${environment.baseUrl}v1/pacientes/nn`);
    http_testing.expectNone(`${environment.baseUrl}v1/emergencia/atenciones`);
    const request = http_testing.expectOne(`${environment.baseUrl}v1/emergencia/triajes`);
    expect(request.request.body).toMatchObject({
      atencion_id: 101,
      triaje: {
        condicion_llegada_id: 40,
        motivo_ingreso_id: 50,
        nivel_triaje_codigo: 'III',
        motivo_consulta: 'Dolor abdominal',
        destino_area_id: 25,
        destino_especialidad_id: 13,
      },
    });
    request.flush({
      data: {
        atencion_id: 101,
        triaje_id: 2,
        control_vital_id: 3,
        prioridad_codigo: 'III',
        prioridad_nombre: 'Urgencia',
        prioridad_color: 'AMARILLO',
        tiempo_maximo_atencion_minutos: 60,
        destino_area_id: 25,
        area_nombre: 'Consultorio de Emergencia',
        fecha_hora_llegada: '2026-10-28 10:05:00',
        fecha_limite_atencion: '2026-10-28 11:05:00',
        detalles: [],
        ticket: {
          numero_registro: 'EME-00000101',
          numero_fua: null,
          numero_acreditacion: null,
          nsa: '654321',
          documento: '12345678',
          destino: 'Medicina Interna',
          prioridad_codigo: 'III',
          prioridad_color: 'AMARILLO',
          area: 'Consultorio de Emergencia',
          signos_vitales: [],
          motivo_consulta: 'Dolor abdominal',
          triado_por: 'ENFERMERA DE PRUEBA',
          fecha_hora: '2026-10-28 10:05:00',
          referencias_pendientes: ['numero_fua', 'numero_acreditacion'],
        },
      },
      message: 'Triaje registrado correctamente.',
    });

    expect(component.registroGuardado()).toBe(true);
    expect(triaje_registrado).toHaveBeenCalledWith(
      expect.objectContaining({ numero_registro: 'EME-00000101' }),
    );
  });

  it('rejects an incomplete blood-pressure pair before making a request', async () => {
    component.triaje_model.update((value) => ({
      ...value,
      condicionLlegada: 40,
      motivoIngreso: 50,
      prioridad: 'III',
      motivoConsulta: 'Evaluación',
      destinoAreaId: 21,
    }));
    component.triajeForm.paSistolica().value.set('120');

    await component.guardar_triaje();

    expect(util_service.mostrar_alerta).toHaveBeenCalledWith(
      'Ingrese las presiones sistólica y diastólica.',
      'warning',
    );
    http_testing.expectNone(`${environment.baseUrl}v1/emergencia/triajes`);
  });

  it('does not display validation errors until submit is requested', async () => {
    component.triajeForm.prioridad().markAsTouched();
    component.triajeForm.motivoConsulta().markAsTouched();
    component.triajeForm.destinoAreaId().markAsTouched();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('.is-invalid, .priority-fieldset--invalid')).toHaveLength(0);
    expect(component.validacion_solicitada()).toBe(false);

    await component.guardar_triaje();
    fixture.detectChanges();

    expect(
      element.querySelectorAll('.is-invalid, .priority-fieldset--invalid').length,
    ).toBeGreaterThan(0);
    expect(component.validacion_solicitada()).toBe(true);
  });

  it('displays valuation errors when advancing with required fields empty', () => {
    component.avanzar_a_signos_vitales();
    fixture.detectChanges();

    const alerts = fixture.nativeElement.querySelectorAll('.app-select__error');

    expect(component.pasoActual()).toBe(1);
    expect(alerts).toHaveLength(2);
    expect(
      Array.from(alerts).every((error) =>
        (error as HTMLElement).textContent?.includes('obligatorio'),
      ),
    ).toBe(true);
  });

  it('keeps attention fields top-aligned when validation errors are displayed', () => {
    component.validacion_solicitada.set(true);
    component.triajeForm.prioridad().markAsTouched();
    component.triajeForm.motivoConsulta().markAsTouched();
    component.triajeForm.destinoAreaId().markAsTouched();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const attention_grid = element.querySelector('.triage-attention-grid');
    const validation_errors = element.querySelectorAll(
      '.triage-attention-grid [role="alert"], .triage-attention-grid .app-input-text__error',
    );

    expect(attention_grid).toBeTruthy();
    expect(attention_grid?.classList.contains('align-items-end')).toBe(false);
    expect(validation_errors).toHaveLength(3);
    expect(Array.from(validation_errors).every((error) => error.textContent?.trim())).toBe(true);
  });

  it('shows the calculated BMI classification beside the compact field', () => {
    util_service.imc_status.mockReturnValue('danger');
    component.pasoActual.set(2);
    component.triaje_model.update((value) => ({ ...value, peso: '90', talla: '165' }));
    fixture.detectChanges();

    const classification = (fixture.nativeElement as HTMLElement).querySelector(
      '.imc-classification__value',
    );

    expect(component.triaje_model().imc).toBe('33.06');
    expect(classification?.textContent?.trim()).toBe('Obesidad grado I');
    expect(classification?.classList.contains('imc-classification__value--danger')).toBe(true);
  });

  it('does not silently omit an entered vital sign missing from the clinical catalog', async () => {
    component.triaje_model.update((value) => ({
      ...value,
      condicionLlegada: 40,
      motivoIngreso: 50,
      prioridad: 'III',
      motivoConsulta: 'Evaluación',
      destinoAreaId: 21,
      fc: '72',
    }));

    await component.guardar_triaje();

    expect(util_service.mostrar_alerta).toHaveBeenCalledWith(
      'El parámetro clínico FC no está disponible.',
      'warning',
    );
    http_testing.expectNone(`${environment.baseUrl}v1/emergencia/triajes`);
  });

  it('conditionally requires destination specialty only when Area is CON-EMER', () => {
    component.pasoActual.set(2);
    component.triaje_model.update((value) => ({
      ...value,
      destinoAreaId: 25,
      destinoEspecialidadId: null,
    }));
    fixture.detectChanges();

    expect(component.esAreaConsultorioEmergencia()).toBe(true);
    expect(component.triajeForm.destinoEspecialidadId().valid()).toBe(false);

    component.triaje_model.update((value) => ({
      ...value,
      destinoAreaId: 21,
    }));
    fixture.detectChanges();

    expect(component.esAreaConsultorioEmergencia()).toBe(false);
    expect(component.triajeForm.destinoEspecialidadId().valid()).toBe(true);
  });

  it('synchronizes EVA range slider and input box bidirectionally', () => {
    const slider = fixture.nativeElement.querySelector('#eva-range') as HTMLInputElement;
    const inputControl = fixture.nativeElement.querySelector(
      '.eva-input-box input',
    ) as HTMLInputElement;

    expect(slider).not.toBeNull();
    expect(inputControl).not.toBeNull();
    expect(component.triaje_model().eva).toBe('0');

    inputControl.value = '7';
    inputControl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.triaje_model().eva).toBe('7');
    expect(slider.value).toBe('7');
    expect(component.eva_description()).toBe('Severo');

    slider.value = '3';
    slider.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.triaje_model().eva).toBe('3');
    expect(inputControl.value).toBe('3');
    expect(component.eva_description()).toBe('Leve');
  });

  it('calculates BMI accurately handling both cm and meters and suggests priority I on critical vitals', () => {
    // Test BMI in meters (1.70 m) and with comma
    expect(component.calcular_imc('70', '1.70')).toBe('24.22');
    expect(component.calcular_imc('70,5', '170')).toBe('24.39');

    // Test critical vitals alert & automatic priority suggestion
    component.triaje_model.update((value) => ({
      ...value,
      prioridad: 'III',
      fc: '135',
      saturacion: '88',
    }));
    fixture.detectChanges();

    const alertas = component.alertasCriticasSignosVitales();
    expect(alertas.length).toBe(2);
    expect(alertas.some((a) => a.parametro === 'FC')).toBe(true);
    expect(alertas.some((a) => a.parametro === 'Sat. O₂')).toBe(true);

    // The effect should suggest and upgrade priority to 'I'
    expect(component.triaje_model().prioridad).toBe('I');

    // Verify alert element in template
    const alertBox = fixture.nativeElement.querySelector('.alert-danger');
    expect(alertBox).not.toBeNull();
    expect(alertBox.textContent).toContain('Signos vitales críticos');
  });
});
