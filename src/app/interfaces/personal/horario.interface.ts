export type EstadoProgramacion = 'BORRADOR' | 'PUBLICADO' | 'CANCELADO';
export type TonoTurno = 'manana' | 'tarde' | 'noche' | 'guardia' | 'descanso';

export interface PersonalHorario {
  id: number;
  nombreCompleto: string;
  iniciales: string;
  tipo: string;
  area: string;
  cargo: string;
}

export interface TurnoHorario {
  id: number;
  codigo: string;
  nombre: string;
  horaInicio: string;
  horaFin: string;
  horas: number;
  tono: TonoTurno;
  activo: boolean;
}

export interface ProgramacionHorario {
  id: number;
  personalId: number;
  turnoId: number;
  fecha: string;
  estado: EstadoProgramacion;
  observacion: string;
}

export interface DiaCalendario {
  fecha: string;
  numero: number;
  nombreCorto: string;
  esFinDeSemana: boolean;
  esHoy: boolean;
}
