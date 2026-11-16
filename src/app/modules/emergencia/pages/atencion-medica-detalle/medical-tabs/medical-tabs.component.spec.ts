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

  it('allows saving even when optional text fields are empty', () => {
    const guardar = vi.fn();
    component.guardarEvaluacion.subscribe(guardar);
    fixture.componentRef.setInput('formulario', {
      ...formulario_valido(),
      motivo_consulta: '',
      signos_y_sintomas: '',
    });

    component.solicitar_guardado_evaluacion(new Event('click'));

    expect(guardar).toHaveBeenCalled();
  });

  it('requires an observation when a regional system is pathological', () => {
    const examen = examen_conservado();
    examen.estado_id = 109;
    examen.estado_codigo = 'PATOL';
    examen.estado_nombre = 'Patológico';
    examen.estado_tipo = 'PATOLOGICO';
    fixture.componentRef.setInput('examenes_regionales', [examen]);

    component.solicitar_guardado_evaluacion(new Event('click'));

    expect(component.observacion_regional_invalida(examen)).toBe(true);
  });

  it('removes the regional classification error immediately after selecting one', () => {
    component.seleccionar_pestana('evaluacion');
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
    expect(fila).not.toBeNull();
    const conservado = fila.querySelector('input[type="checkbox"]') as HTMLInputElement;
    conservado.checked = true;
    conservado.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component.clasificacion_regional_invalida(examen)).toBe(false);
    expect(fila.classList.contains('regional-row--invalid')).toBe(false);
    expect(fila.querySelector('.regional-field-error')).toBeNull();
  });

  it('removes the PATOLOGICO detail error immediately after typing its observation', () => {
    component.seleccionar_pestana('evaluacion');
    const examen = examen_conservado();
    examen.estado_id = 109;
    examen.estado_codigo = 'PATOL';
    examen.estado_nombre = 'Patológico';
    examen.estado_tipo = 'PATOLOGICO';
    fixture.componentRef.setInput('examenes_regionales', [examen]);
    component.solicitar_guardado_evaluacion(new Event('click'));
    fixture.detectChanges();

    const campo_detalle = fixture.nativeElement.querySelector(
      'input.form-control.is-invalid',
    ) as HTMLInputElement;
    expect(campo_detalle).not.toBeNull();

    campo_detalle.value = 'observación clínica';
    campo_detalle.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.observacion_regional_invalida(examen)).toBe(false);
    expect(campo_detalle.classList.contains('is-invalid')).toBe(false);
    expect(campo_detalle.nextElementSibling).toBeNull();
  });

  it('emits save when the complete structured evaluation is valid', () => {
    const guardar = vi.fn();
    component.guardarEvaluacion.subscribe(guardar);
    const event = new Event('click');

    component.solicitar_guardado_evaluacion(event);

    expect(guardar).toHaveBeenCalledWith(event);
  });

  it('allows modality change even if evaluation was registered', () => {
    const tipo_actualizado = vi.fn();
    component.tipoRegionalActualizado.subscribe(tipo_actualizado);
    fixture.componentRef.setInput('evaluacion_registrada', true);

    component.seleccionar_tipo_regional(2);

    expect(tipo_actualizado).toHaveBeenCalledWith(2);
  });
});
