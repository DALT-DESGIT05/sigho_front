import { TestBed } from '@angular/core/testing';
import { HorarioMockService } from './horario-mock.service';

describe('HorarioMockService', () => {
  let service: HorarioMockService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HorarioMockService);
  });

  it('creates a draft assignment when the person has no shift that day', () => {
    const persona = service.personal()[0];
    const fecha = '2030-01-15';

    service.guardarProgramacion(persona.id, fecha, 2, 'Cobertura de tarde');

    const asignacion = service.programaciones().find(
      (item) => item.personalId === persona.id && item.fecha === fecha,
    );

    expect(asignacion?.turnoId).toBe(2);
    expect(asignacion?.estado).toBe('BORRADOR');
    expect(asignacion?.observacion).toBe('Cobertura de tarde');
  });

  it('updates the existing assignment instead of duplicating it', () => {
    const persona = service.personal()[0];
    const fecha = '2030-01-16';

    service.guardarProgramacion(persona.id, fecha, 1, '');
    service.guardarProgramacion(persona.id, fecha, 3, 'Cambio a noche');

    const asignaciones = service.programaciones().filter(
      (item) => item.personalId === persona.id && item.fecha === fecha,
    );

    expect(asignaciones).toHaveLength(1);
    expect(asignaciones[0].turnoId).toBe(3);
    expect(asignaciones[0].observacion).toBe('Cambio a noche');
  });

  it('publishes every draft assignment', () => {
    const persona = service.personal()[1];
    const fecha = '2030-02-10';
    service.guardarProgramacion(persona.id, fecha, 4, '');

    service.publicarBorradores();

    expect(service.programaciones().some((item) => item.estado === 'BORRADOR')).toBe(false);
    expect(service.programaciones().find((item) => item.personalId === persona.id && item.fecha === fecha)?.estado)
      .toBe('PUBLICADO');
  });

  it('creates and updates shifts without touching other shifts', () => {
    const cantidadInicial = service.turnos().length;

    service.guardarTurno({
      codigo: 'E',
      nombre: 'Especial',
      horaInicio: '10:00',
      horaFin: '12:00',
      horas: 2,
      tono: 'guardia',
      activo: true,
    });

    const creado = service.turnos().find((turno) => turno.codigo === 'E');
    expect(service.turnos()).toHaveLength(cantidadInicial + 1);
    expect(creado?.id).toBeGreaterThan(0);

    service.guardarTurno({ ...creado!, nombre: 'Especial actualizado' });

    expect(service.turnos()).toHaveLength(cantidadInicial + 1);
    expect(service.turnos().find((turno) => turno.codigo === 'E')?.nombre).toBe('Especial actualizado');
  });
});
