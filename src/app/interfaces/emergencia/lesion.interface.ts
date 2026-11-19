export interface CatalogoItem {
  id: number;
  codigo: string;
  nombre: string;
}

export interface SitioOcurrenciaItem extends CatalogoItem {
  tipo_sitio_id: number;
}

export interface CatalogosLesionesResponse {
  agentes_lesion: CatalogoItem[];
  moviles_agresion: CatalogoItem[];
  regiones_corporales: CatalogoItem[];
  tipos_sitio: CatalogoItem[];
  sitios_ocurrencia: SitioOcurrenciaItem[];
  tipos_evento: CatalogoItem[];
  tipos_lesion: CatalogoItem[];
  parentescos: CatalogoItem[];
}

/** Datos de T_PERSONA para registrar a un agresor que aún no existe como persona. */
export interface AgresorPersonaDatos {
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  sexo_id: number;
  tipo_documento_id: number;
  numero_documento: string | null;
  fecha_nacimiento: string | null;
  celular: string | null;
  correo_electronico: string | null;
  fap: boolean;
  /** Agresor desconocido: se registra como persona NN, igual que el paciente NN. */
  nn: boolean;
}

export interface LesionDetalleItem {
  id_lesion_at?: number | null;
  agente_lesion_id: number | null;
  agente_lesion_nombre?: string | null;
  region_corporal_id: number | null;
  region_corporal_nombre?: string | null;
  tipo_lesion_id: number | null;
  tipo_lesion_nombre?: string | null;
  descripcion: string;
}

export interface AgresorDetalleItem {
  persona_id: number | null;
  nombre_agresor: string | null;
  persona: AgresorPersonaDatos | null;
  movil_agresion_id: number | null;
  movil_agresion_nombre?: string | null;
  parentesco_id: number | null;
  parentesco_nombre?: string | null;
}

export interface AtencionLesionResponse {
  id_atencion_lesion: number;
  id_aten: number;
  sitio_ocurrencia_id: number | null;
  sitio_ocurrencia_nombre: string | null;
  tipo_sitio_id: number | null;
  tipo_sitio_nombre: string | null;
  tipo_evento_id: number | null;
  tipo_evento_nombre: string | null;
  fecha_ocurrencia: string | null;
  ind_alcohol_6h: boolean;
  ind_notif_minpub: boolean;
  fecha_notificacion: string | null;
  observacion: string | null;
  lesiones: LesionDetalleItem[];
  agresores: AgresorDetalleItem[];
}

export interface AtencionLesionPayload {
  sitio_ocurrencia_id: number | null;
  tipo_evento_id: number | null;
  fecha_ocurrencia: string | null;
  ind_alcohol_6h: boolean;
  ind_notif_minpub: boolean;
  fecha_notificacion: string | null;
  observacion: string | null;
  lesiones: Array<{
    agente_lesion_id: number | null;
    region_corporal_id: number | null;
    tipo_lesion_id: number | null;
    descripcion: string | null;
  }>;
  agresores: Array<{
    persona_id: number | null;
    persona: Partial<AgresorPersonaDatos> | null;
    movil_agresion_id: number | null;
    parentesco_id: number | null;
  }>;
}
