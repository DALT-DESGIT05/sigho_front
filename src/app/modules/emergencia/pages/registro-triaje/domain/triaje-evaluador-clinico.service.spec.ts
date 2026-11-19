import { TestBed } from '@angular/core/testing';
import { TriajeEvaluadorClinicoService } from './triaje-evaluador-clinico.service';
import { CODIGOS_CONDICION_LLEGADA, CODIGOS_PRIORIDAD } from './triaje.constants';

describe('TriajeEvaluadorClinicoService', () => {
  let service: TriajeEvaluadorClinicoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TriajeEvaluadorClinicoService);
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debe disparar Prioridad I y alertas críticas si la saturación es < 90%', () => {
    const decision = service.evaluar({
      saturacion: '88',
      paSistolica: '120',
      paDiastolica: '80',
      fc: '75',
      fr: '16',
      temperatura: '36.5',
      eva: '0',
    });

    expect(decision.tieneCritico).toBe(true);
    expect(decision.prioridadSugerida).toBe(CODIGOS_PRIORIDAD.I);
    expect(decision.prioridad1Bloqueada).toBe(false);
    expect(decision.alertasCriticas.length).toBeGreaterThan(0);
    expect(decision.alertasCriticas[0].parametro).toBe('Sat. O₂');
  });

  it('debe bloquear Prioridad I si todos los signos son normales', () => {
    const decision = service.evaluar({
      saturacion: '98',
      paSistolica: '120',
      paDiastolica: '80',
      fc: '75',
      fr: '16',
      temperatura: '36.5',
      eva: '0',
      condicionLlegadaCodigo: CODIGOS_CONDICION_LLEGADA.CAMINANDO,
    });

    expect(decision.tieneCritico).toBe(false);
    expect(decision.todosNormales).toBe(true);
    expect(decision.prioridad1Bloqueada).toBe(true);
    expect(decision.prioridadSugerida).toBe(CODIGOS_PRIORIDAD.IV);
  });

  it('debe bloquear Prioridad I si el paciente llega caminando sin signos críticos', () => {
    const decision = service.evaluar({
      saturacion: '95',
      paSistolica: '130',
      paDiastolica: '85',
      fc: '80',
      fr: '18',
      temperatura: '38.0',
      eva: '4',
      condicionLlegadaCodigo: CODIGOS_CONDICION_LLEGADA.CAMINANDO,
    });

    expect(decision.tieneCritico).toBe(false);
    expect(decision.prioridad1Bloqueada).toBe(true);
    expect(decision.prioridadSugerida).toBe(CODIGOS_PRIORIDAD.III);
  });

  it('debe sugerir Prioridad II si el dolor es severo (EVA >= 7)', () => {
    const decision = service.evaluar({
      saturacion: '96',
      paSistolica: '130',
      paDiastolica: '85',
      fc: '80',
      fr: '18',
      temperatura: '37.0',
      eva: '8',
    });

    expect(decision.tieneCritico).toBe(false);
    expect(decision.prioridadSugerida).toBe(CODIGOS_PRIORIDAD.II);
  });

  it('debe forzar Prioridad I sin bloqueo si el paciente es NN', () => {
    const decision = service.evaluar({
      esPacienteNn: true,
      condicionLlegadaCodigo: CODIGOS_CONDICION_LLEGADA.CAMINANDO,
    });

    expect(decision.prioridadSugerida).toBe(CODIGOS_PRIORIDAD.I);
    expect(decision.prioridad1Bloqueada).toBe(false);
  });
});
