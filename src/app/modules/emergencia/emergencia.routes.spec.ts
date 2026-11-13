import { emergenciaRoutes } from './emergencia.routes';

describe('emergenciaRoutes', () => {
  it('exposes the emergency triage routes', () => {
    expect(emergenciaRoutes.map(route => route.path)).toEqual([
      '',
      'pacientes-triaje',
      'atencion-medica/:atencion_id',
      'atencion-medica',
      'admision',
      'registro-triaje/:atencion_id',
    ]);
    expect(emergenciaRoutes.some((route) => route.path === 'registro-triaje')).toBe(false);
  });
});
