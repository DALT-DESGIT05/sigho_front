export interface CatalogoEmergenciaOption {
  value: number;
  label: string;
}

export interface TipoDocumentoEmergenciaOption extends CatalogoEmergenciaOption {
  codigo: string;
}

export interface CatalogoEmergenciaCodigoOption extends CatalogoEmergenciaOption {
  codigo: string;
}

export interface CatalogoNivelTriajeOption {
  value: string;
  label: string;
  color: string;
  tiempo_maximo_atencion_minutos: number;
}

export interface CatalogosEmergencia {
  tipos_documento: TipoDocumentoEmergenciaOption[];
  sexos: CatalogoEmergenciaCodigoOption[];
  parentescos: CatalogoEmergenciaCodigoOption[];
  condiciones_llegada: CatalogoEmergenciaOption[];
  motivos_ingreso: CatalogoEmergenciaOption[];
  tipos_paciente: CatalogoEmergenciaCodigoOption[];
  especialidades: CatalogoEmergenciaOption[];
  ipress: CatalogoEmergenciaOption[];
  procedencias: CatalogoEmergenciaCodigoOption[];
  areas_emergencia: CatalogoEmergenciaCodigoOption[];
  destinos_consultorio: CatalogoEmergenciaOption[];
  areas?: CatalogoEmergenciaCodigoOption[];
  niveles_triaje: CatalogoNivelTriajeOption[];
}

export interface CatalogoComponenteClinico {
  codigo: string;
  nombre: string;
  orden: number;
  unidad_medida_id: number;
  unidad_medida_nombre: string | null;
  puntaje_minimo: number | null;
  puntaje_maximo: number | null;
}

export interface CatalogoRangoClinico {
  nombre: string;
  valor_minimo: number | null;
  valor_maximo: number | null;
  poblacion: string | null;
  sexo: string | null;
  edad_minima: number | null;
  edad_maxima: number | null;
  unidad_medida_id: number;
  unidad_medida_nombre: string | null;
}

export interface CatalogoAlertaClinica {
  codigo: string;
  nombre: string;
  valor_minimo: number | null;
  valor_maximo: number | null;
  severidad: string | null;
  color: string | null;
  genera_alerta: boolean;
  mensaje: string | null;
}

export interface CatalogoParametroClinico {
  codigo: string;
  nombre: string;
  tipo_parametro: string;
  tipo_dato: string;
  cantidad_decimales: number;
  permite_negativo: boolean;
  genera_alerta: boolean;
  requiere_observacion: boolean;
  valor_minimo_admisible: number | null;
  valor_maximo_admisible: number | null;
  unidad_medida_id: number;
  unidad_medida_nombre: string | null;
  requiere_componentes: boolean;
  componentes: CatalogoComponenteClinico[];
  rangos_normales: CatalogoRangoClinico[];
  niveles_alerta: CatalogoAlertaClinica[];
}

export interface CatalogosSignosVitales {
  parametros: CatalogoParametroClinico[];
}
