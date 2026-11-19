import { PrioridadOrdenMedica } from './interconsulta.interface';

export interface ServicioProcedEnf {
  area_codigo?: string;
  area_nombre?: string;
  codigo: string;
  nombre: string;
  en_uso: boolean | number;
}

export interface OrdenProcedEnf {
  orden_id: number;
  procedimiento_id: number;
  servicio_codigo: string;
  servicio_nombre: string | null;
  prioridad_id: number;
  prioridad_codigo: string;
  prioridad_nombre: string;
  estado_id: number;
  estado_codigo: string;
  estado_nombre: string;
  indicaciones: string | null;
  fecha_hora_orden: string;
}

export interface ProcedEnfContexto {
  ordenes: OrdenProcedEnf[];
  prioridades: PrioridadOrdenMedica[];
  catalogo: ServicioProcedEnf[];
}
