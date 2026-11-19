export interface AlergiaPaciente {
  alergia_id: number;
  sustancia_id: number;
  sustancia_codigo: string;
  sustancia_nombre: string;
  tipo_id: number;
  tipo_codigo: string;
  tipo_nombre: string;
  gravedad_id: number;
  gravedad_codigo: string;
  gravedad_nombre: string;
  via_administracion_id: number | null;
  via_administracion_codigo: string | null;
  via_administracion_nombre: string | null;
  reaccion: string | null;
  edad_reaccion: number | null;
  fecha_ultima_reaccion: string | null;
  descripcion_adicional: string | null;
  fecha_registro: string;
}

export interface TipoAlergeno {
  tipo_id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
}

export interface SustanciaAlergena {
  sustancia_id: number;
  tipo_id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
}

export interface GravedadAlergia {
  gravedad_id: number;
  codigo: string;
  nombre: string;
}

export interface ViaAdministracionAlergia {
  via_administracion_id: number;
  codigo: string;
  nombre: string;
}

export interface AlergiaContexto {
  alergias: AlergiaPaciente[];
  tipos: TipoAlergeno[];
  sustancias: SustanciaAlergena[];
  gravedades: GravedadAlergia[];
  vias: ViaAdministracionAlergia[];
}

export interface RegistrarAlergiaRequest {
  atencion_id: number;
  alergia_id?: number;
  sustancia_id: number;
  gravedad_id: number;
  via_administracion_id: number | null;
  reaccion: string | null;
  edad_reaccion: number | null;
  fecha_ultima_reaccion: string | null;
  descripcion_adicional: string | null;
}
