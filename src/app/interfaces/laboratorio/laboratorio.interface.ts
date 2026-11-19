export interface PrioridadLaboratorio {
  prioridad_id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  color: string;
}

export interface ServicioLaboratorio {
  area_codigo: string;
  area_nombre: string;
  codigo: string;
  nombre: string;
  en_uso: boolean | number;
}

export interface OrdenLaboratorio {
  orden_id: number;
  laboratorio_id: number;
  servicio_codigo: string;
  servicio_nombre: string | null;
  area_codigo: string;
  area_nombre: string;
  prioridad_id: number;
  prioridad_codigo: string;
  prioridad_nombre: string;
  estado_id: number;
  estado_codigo: string;
  estado_nombre: string;
  estado_laboratorio_id: number;
  estado_laboratorio_codigo: string;
  estado_laboratorio_nombre: string;
  fecha_hora_orden: string;
}

export interface LaboratorioContexto {
  ordenes: OrdenLaboratorio[];
  prioridades: PrioridadLaboratorio[];
  catalogo: ServicioLaboratorio[];
}

export interface ExamenHistorialLaboratorio {
  laboratorio_id: number;
  servicio_codigo: string;
  servicio_nombre: string;
  area_nombre: string;
  estado_nombre: string;
}

export interface OrdenHistorialLaboratorio {
  orden_id: number;
  atencion_id: number;
  fecha_hora_orden: string | null;
  prioridad_nombre: string;
  estado_nombre: string;
  examenes: ExamenHistorialLaboratorio[];
}

export interface HistorialLaboratorioContexto {
  ordenes: OrdenHistorialLaboratorio[];
}

export interface ExamenResultadoLaboratorio {
  codigo_examen: string;
  area_nombre: string;
  examen: string;
  sub_examen: string;
  resultado: string;
  unidades: string;
  referencia: string;
  fecha_resultado: string | null;
}

export interface OrdenResultadoLaboratorio {
  nro_registro: string;
  nro_orden: string;
  procedencia: string;
  situacion: string;
  medico: string;
  fecha_resultado: string | null;
  examenes: ExamenResultadoLaboratorio[];
}

export interface ResultadosLaboratorioContexto {
  ordenes: OrdenResultadoLaboratorio[];
}
