export interface TriajeDetalleRequest {
  parametro_codigo: string;
  componente_codigo: string | null;
  valor: number;
}

export interface SignoVitalDetalleHistorial {
  control_vital_detalle_id: number;
  parametro_codigo: string;
  componente_codigo: string | null;
  valor: number;
  alerta_id: number | null;
  alerta_codigo: string | null;
  alerta_color: string | null;
  alerta_genera: boolean | null;
}

export interface ControlVitalHistorial {
  id_control_vital: number;
  fecha_hora: string;
  valor_imc?: string | null;
  observaciones: string | null;
  origen_codigo: string;
  origen_nombre: string;
  detalles: SignoVitalDetalleHistorial[];
}

export interface RegistrarSignosVitalesRequest {
  observaciones: string | null;
  detalles: TriajeDetalleRequest[];
}
