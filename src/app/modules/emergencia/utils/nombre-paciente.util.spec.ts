import { describe, expect, it } from 'vitest';
import { PacienteSeguimientoTriaje } from '../../../interfaces/emergencia/triaje.interface';
import { formatear_nombre_paciente } from './nombre-paciente.util';

describe('formatear_nombre_paciente', () => {
  const paciente: PacienteSeguimientoTriaje = {
    paciente_id: 1,
    tipo_documento: 'DNI',
    numero_documento: '12345678',
    numero_historia: null,
    apellido_paterno: 'MORIANO',
    apellido_materno: 'SAUÑE',
    nombres: 'ANDERSON',
    nombre_completo: 'MORIANO SAUÑE ANDERSON',
    edad: 40,
    grado_codigo: 'COR',
    situacion: 'ACTIVIDAD',
    es_nn: false,
  };

  it('prefixes the grade for an active-duty patient', () => {
    expect(formatear_nombre_paciente(paciente)).toBe('COR MORIANO SAUÑE Anderson');
  });

  it('adds (r) after the grade for a retired patient', () => {
    expect(formatear_nombre_paciente({ ...paciente, situacion: 'RETIRO' })).toBe(
      'COR (r) MORIANO SAUÑE Anderson',
    );
  });

  it('uses grado if grado_codigo is not present', () => {
    expect(
      formatear_nombre_paciente({
        ...paciente,
        grado_codigo: null,
        grado: 'COR',
        situacion: 'RETIRO',
      }),
    ).toBe('COR (r) MORIANO SAUÑE Anderson');
  });

  it('shows only the name when there is no grade', () => {
    expect(
      formatear_nombre_paciente({ ...paciente, grado_codigo: null, situacion: 'RETIRO' }),
    ).toBe('MORIANO SAUÑE Anderson');
  });
});
