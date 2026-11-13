import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import {
  DetalleAtencionResponse,
  EvaluacionMedicaData,
  ExamenRegional,
} from '../../../../../interfaces/emergencia/triaje.interface';
import { UtilService } from '../../../../../services/util.service';
import { MedicalTabsComponent } from './medical-tabs.component';

describe('MedicalTabsComponent', () => {
  let fixture: ComponentFixture<MedicalTabsComponent>;
  let component: MedicalTabsComponent;
  const util_service = {
    mostrar_alerta: vi.fn(),
  };

  const detalle: DetalleAtencionResponse = {
    atencion_id: 101,
    programacion_personal_id: 501,
    codigo_episodio: 'EME-00000101',
    fecha_hora_ingreso: '2026-11-04 09:00:00',
    fecha_hora_llamada_med: '2026-11-04 09:05:00',
    estado_codigo: 'REG',
    estado_nombre: 'Registrada',
    estado_seguimiento: 'TRIADO',
    triaje_registrado: true,
    paciente: {
      paciente_id: 10,
      tipo_documento_id: 1,
      tipo_documento: 'DNI',
      numero_documento: '12345678',
      numero_historia: 'HC-10',
      nombre_completo: 'PACIENTE DE PRUEBA',
      sexo_codigo: 'M',
      sexo: 'Masculino',
      edad: 30,
      grado_id: null,
      grado_codigo: null,
      grado: null,
      codigo_afiliado: null,
      nsa: null,
      celular: null,
      correo_electronico: null,
      situacion: null,
      parentesco: null,
      es_nn: false,
    },
    atencion: {
      tipo_paciente_id: 1,
      especialidad_id: 2,
      procedencia_id: 3,
      numero_historia: 'HC-10',
    },
  };

  const formulario_valido = (): EvaluacionMedicaData => ({
    tiempo_enfermedad: 'Dos días',
    motivo_consulta: 'Dolor abdominal',
    anamnesis: 'Dolor progresivo',
    examen_regional: '',
    signos_y_sintomas: 'Paciente consciente y orientado',
    relato: '',
    plan_tratamiento: '',
    tipo_reg_evaluac: 1,
  });

  const examen_conservado = (): ExamenRegional => ({
    examen_id: 1,
    codigo: 'GEN',
    nombre: 'Estado general',
    estado_id: 108,
    estado_codigo: 'CONSER',
    estado_nombre: 'Conservado',
    estado_tipo: 'CONSERVADO',
    observacion: null,
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicalTabsComponent],
      providers: [{ provide: UtilService, useValue: util_service }],
    }).compileComponents();

    fixture = TestBed.createComponent(MedicalTabsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('detalle', detalle);
    fixture.componentRef.setInput('formulario', formulario_valido());
    fixture.componentRef.setInput('examenes_regionales', [examen_conservado()]);
    fixture.componentRef.setInput('estados_examen_regional', [
      {
        estado_id: 108,
        estado_codigo: 'CONSER',
        estado_nombre: 'Conservado',
        estado_tipo: 'CONSERVADO',
      },
      {
        estado_id: 109,
        estado_codigo: 'PATOL',
        estado_nombre: 'Patológico',
        estado_tipo: 'PATOLOGICO',
      },
      {
        estado_id: 110,
        estado_codigo: 'NOEVL',
        estado_nombre: 'No evaluado',
        estado_tipo: 'NO_EVALUADO',
      },
    ]);
    fixture.detectChanges();
    util_service.mostrar_alerta.mockClear();
  });

  it('does not show mandatory errors before a save attempt', () => {
    fixture.componentRef.setInput('formulario', {
      ...formulario_valido(),
      motivo_consulta: '',
    });
    fixture.detectChanges();

    expect(component.campo_evaluacion_invalido('motivo_consulta')).toBe(false);
    expect(fixture.nativeElement.querySelectorAll('.is-invalid')).toHaveLength(0);
  });

  it('blocks saving and shows errors after an incomplete save attempt', () => {
    const guardar = vi.fn();
    component.guardar.subscribe(guardar);
    fixture.componentRef.setInput('formulario', {
      ...formulario_valido(),
      motivo_consulta: '',
    });

    component.solicitar_guardado_evaluacion(new Event('click'));
    fixture.detectChanges();

    expect(guardar).not.toHaveBeenCalled();
    expect(component.validacion_evaluacion_solicitada()).toBe(true);
    expect(component.pestana_activa()).toBe('enfermedad');
    expect(fixture.nativeElement.querySelectorAll('.is-invalid').length).toBeGreaterThan(0);
  });

  it('removes a text field error as soon as the field becomes valid', () => {
    fixture.componentRef.setInput('formulario', {
      ...formulario_valido(),
      signos_y_sintomas: '',
    });
    component.campoActualizado.subscribe(({ campo, event }) => {
      fixture.componentRef.setInput('formulario', {
        ...component.formulario(),
        [campo]: (event.target as HTMLTextAreaElement).value,
      });
    });
    component.solicitar_guardado_evaluacion(new Event('click'));
    fixture.detectChanges();

    const examen_clinico = fixture.nativeElement.querySelector(
      'textarea[class*="is-invalid"]',
    ) as HTMLTextAreaElement;
    expect(examen_clinico).not.toBeNull();

    examen_clinico.value = 'Paciente consciente, orientado y estable';
    examen_clinico.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.campo_evaluacion_invalido('signos_y_sintomas')).toBe(false);
    expect(examen_clinico.classList.contains('is-invalid')).toBe(false);
    expect(examen_clinico.nextElementSibling).toBeNull();
  });

  it('requires a cause when a regional system is not evaluated', () => {
    const examen = examen_conservado();
    examen.estado_id = 110;
    examen.estado_codigo = 'NOEVL';
    examen.estado_nombre = 'No evaluado';
    examen.estado_tipo = 'NO_EVALUADO';
    fixture.componentRef.setInput('examenes_regionales', [examen]);

    component.solicitar_guardado_evaluacion(new Event('click'));

    expect(component.observacion_regional_invalida(examen)).toBe(true);
    expect(component.pestana_activa()).toBe('evaluacion');
  });

  it('removes the regional classification error immediately after selecting one', () => {
    const examen = examen_conservado();
    examen.estado_id = null;
    examen.estado_codigo = null;
    examen.estado_nombre = null;
    examen.estado_tipo = null;
    fixture.componentRef.setInput('examenes_regionales', [examen]);
    component.solicitar_guardado_evaluacion(new Event('click'));
    fixture.detectChanges();

    const fila = fixture.nativeElement.querySelector(
      '.regional-row--invalid',
    ) as HTMLTableRowElement;
    const conservado = fila.querySelector('input[type="checkbox"]') as HTMLInputElement;
    conservado.checked = true;
    conservado.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component.clasificacion_regional_invalida(examen)).toBe(false);
    expect(fila.classList.contains('regional-row--invalid')).toBe(false);
    expect(fila.querySelector('.regional-field-error')).toBeNull();
  });

  it.each([
    ['PATOLOGICO', 109, 'observación clínica'],
    ['NO_EVALUADO', 110, 'causa de no evaluación'],
  ] as const)(
    'removes the %s detail error immediately after typing its %s',
    (estado_tipo, estado_id, detalle) => {
      const examen = examen_conservado();
      examen.estado_id = estado_id;
      examen.estado_codigo = estado_tipo === 'PATOLOGICO' ? 'PATOL' : 'NOEVL';
      examen.estado_nombre = estado_tipo === 'PATOLOGICO' ? 'Patológico' : 'No evaluado';
      examen.estado_tipo = estado_tipo;
      fixture.componentRef.setInput('examenes_regionales', [examen]);
      component.solicitar_guardado_evaluacion(new Event('click'));
      fixture.detectChanges();

      const campo_detalle = fixture.nativeElement.querySelector(
        'input.form-control.is-invalid',
      ) as HTMLInputElement;
      expect(campo_detalle).not.toBeNull();

      campo_detalle.value = detalle;
      campo_detalle.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(component.observacion_regional_invalida(examen)).toBe(false);
      expect(campo_detalle.classList.contains('is-invalid')).toBe(false);
      expect(campo_detalle.nextElementSibling).toBeNull();
    },
  );

  it('emits save when the complete structured evaluation is valid', () => {
    const guardar = vi.fn();
    component.guardar.subscribe(guardar);
    const event = new Event('click');

    component.solicitar_guardado_evaluacion(event);

    expect(guardar).toHaveBeenCalledWith(event);
  });

  it('does not emit a modality change after the evaluation was registered', () => {
    const tipo_actualizado = vi.fn();
    component.tipoRegionalActualizado.subscribe(tipo_actualizado);
    fixture.componentRef.setInput('evaluacion_registrada', true);

    component.seleccionar_tipo_regional(2);

    expect(tipo_actualizado).not.toHaveBeenCalled();
  });

  it('emits guardarLaboratorio with prioridad_id, diagnostico_id and servicios when all are selected', () => {
    const guardar = vi.fn();
    component.guardarLaboratorio.subscribe(guardar);

    component.servicios_laboratorio_seleccionados.add('0017');
    component.prioridad_laboratorio_id = 2;
    component.diagnostico_laboratorio_id = 15;

    component.guardar_laboratorio();

    expect(guardar).toHaveBeenCalledWith({
      prioridad_id: 2,
      diagnostico_id: 15,
      servicios: ['0017'],
    });
  });

  it('does not emit guardarLaboratorio if diagnostico_laboratorio_id is null', () => {
    const guardar = vi.fn();
    component.guardarLaboratorio.subscribe(guardar);

    component.servicios_laboratorio_seleccionados.add('0017');
    component.prioridad_laboratorio_id = 2;
    component.diagnostico_laboratorio_id = null;

    component.guardar_laboratorio();

    expect(guardar).not.toHaveBeenCalled();
  });
});
