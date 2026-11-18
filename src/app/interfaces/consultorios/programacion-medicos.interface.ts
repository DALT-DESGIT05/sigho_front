// Registrar programación médica
export interface StoreProgramacionMedico {
  persona: number;
  especialidad: number;
  fecha_inicio: string;
  fecha_fin: string;
  turno: number;
  actividad_medica_ipress: number;
  hora_inicio: string;
  hora_fin: string;
}

// Filtros para consultar programaciones por mes
export interface FiltrosProgramacionMedicoMes {
  persona: number;
  mes: number;
  anio: number;
}

// Respuesta de Laravel
// Respuesta de Laravel
export interface ProgramacionMedicoMes {
  codigo_programacion_medico: number;
  fecha: string;
  hora_inicio: string | null;
  hora_fin: string | null;
  cant_cupos: number;
  intervalo: number;
  actividad_medica_ipress: number;
  actividad_medica_descripcion: string | null; // NUEVO
  turno: number;
  turno_descripcion: string | null; // NUEVO
  publicado: number;
}

export interface ProgramacionMedico {
  id: number;
  fecha: string;
  turno: string;
  actividad_medica: string;
  hora_inicio: string;
  hora_termino: string;
  cupos: number;
  reservados: number | string;
  adicionales: number | string;
  disponibles: number | string;
}
