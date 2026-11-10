import { personalRoutes } from './personal.routes';

describe('personalRoutes', () => {
  it('exposes the personnel scheduling routes', () => {
    expect(personalRoutes.map((route) => route.path)).toEqual([
      '',
      'horarios',
      'turnos',
      'mi-horario',
    ]);
  });
});
