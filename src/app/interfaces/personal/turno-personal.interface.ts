export interface TurnoPersonalApi {
  id_horario_turno: number;
  turno_hora_inicio: string;
  turno_hora_fin: string;
  turno_hora_duracion: number | null;
  turno_desc: string | null;
}
