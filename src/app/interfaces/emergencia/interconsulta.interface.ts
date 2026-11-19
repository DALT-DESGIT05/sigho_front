export interface PrioridadOrdenMedica {
  prioridad_id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  color: string;
}

export interface AreaInterconsulta {
  area_id: number;
  nombre: string;
}

export interface EspecialidadInterconsulta {
  especialidad_id: number;
  nombre: string;
  area_id?: number | null;
}

export interface PersonalInterconsulta {
  programacion_personal_id: number;
  especialidad_id: number;
  especialidad: string;
  nombre_completo: string;
  turno: string;
  hora_inicio: string;
  hora_fin: string;
}

export interface OrdenInterconsulta {
  interconsulta_id: number;
  orden_id: number;
  prioridad_id: number;
  prioridad_codigo: string;
  prioridad_nombre: string;
  diagnostico_id: number;
  diagnostico_codigo: string;
  diagnostico_nombre: string;
  especialidad_id: number;
  especialidad_nombre: string;
  area_id: number;
  area_nombre: string;
  programacion_personal_id: number;
  personal_nombre: string;
  que_solicita: string;
  observaciones: string | null;
  estado_codigo: string;
  estado_nombre: string;
  fecha_hora_orden: string;
}

export interface InterconsultaContexto {
  ordenes: OrdenInterconsulta[];
  areas: AreaInterconsulta[];
  especialidades: EspecialidadInterconsulta[];
  personal: PersonalInterconsulta[];
  prioridades: PrioridadOrdenMedica[];
}
