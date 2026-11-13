export interface ProgramacionPersonalApi {
  id_prog_per: number;
  id_persona_personal: number;
  id_horario: number;
  id_horario_turno: number;
  id_especialidad: number;
  hor_fecha: string;
  hor_hora: number;
  hor_obs: string | null;
  nro_consul: string | null;
  cant_cupos: number | null;
  intervalos: number | null;
  canti_adi: number | null;
  turno_hora_inicio: string;
  turno_hora_fin: string;
  turno_hora_duracion: number | null;
  turno_desc: string | null;
  des_consul: string | null;
  person_nom: string | null;
  person_ape_pat: string | null;
  person_ape_mat: string | null;
  id_tipo_personal: number;
  nsa: string | null;
}
