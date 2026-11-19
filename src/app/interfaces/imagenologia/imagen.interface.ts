export interface ServicioImagen {
  codigo: string;
  nombre: string;
  area_codigo: string;
}

export type CategoriaApoyoImagen =
  | 'radiografias'
  | 'tomografias'
  | 'resonancias'
  | 'ecografias'
  | 'mamografias';

export interface PrioridadImagen {
  prioridad_id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  color: string;
}

export interface OrdenImagen {
  orden_id: number;
  imagen_id: number;
  area_codigo?: string | null;
  area_nombre?: string | null;
  servicio_codigo: string;
  servicio_nombre: string | null;
  diagnostico_id: number;
  diagnostico_codigo: string;
  diagnostico_nombre: string;
  prioridad_id: number;
  prioridad_codigo: string;
  prioridad_nombre: string;
  estado_id: number;
  estado_codigo: string;
  estado_nombre: string;
  estado_imagen_id: number;
  estado_imagen_codigo: string;
  estado_imagen_nombre: string;
  requiere_contraste: boolean | number;
  datos_clinicos: string | null;
  observacion: string | null;
  fecha_hora_orden: string;
}

export interface ApoyoDiagnosticoContexto {
  ordenes: OrdenImagen[];
  prioridades: PrioridadImagen[];
}

export interface RegistrarOrdenImagenRequest {
  atencion_id: number;
  servicio_codigo: string;
  diagnostico_id: number;
  prioridad_id: number;
  requiere_contraste: boolean;
  datos_clinicos: string;
  observacion?: string | null;
}
