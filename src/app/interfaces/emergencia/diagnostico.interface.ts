export interface Diagnostico {
  diagnostico_id: number;
  cie10_id: number;
  codigo: string;
  descripcion: string;
  tipo_id: number;
  tipo_codigo: string;
  tipo_nombre: string;
  clasificacion_id: number | null;
  clasificacion_codigo: string | null;
  clasificacion_nombre: string | null;
  observacion: string | null;
}

export interface TipoDiagnostico {
  tipo_id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
}

export interface DiagnosticoCatalogo {
  cie10_id: number;
  codigo: string;
  descripcion: string;
}

export interface DiagnosticoContexto {
  diagnosticos: Diagnostico[];
  tipos: TipoDiagnostico[];
  clasificaciones: TipoDiagnostico[];
}
