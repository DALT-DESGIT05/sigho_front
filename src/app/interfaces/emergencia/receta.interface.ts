export interface Farmacia {
  idfarm: number;
  nomfarm: string;
  desfarm: string;
}

export interface Medicamento {
  codigo_medicamento: string;
  nombre_medicamento: string;
  stock: number;
  petit: string;
  unidad_medida: string;
  color_celda: string;
  codigo_farmacia: number;
  nombre_farmacia: string;
}

export interface Dosis {
  codigo: string;
  nombre: string;
}

export interface Frecuencia {
  codigo: string;
  nombre: string;
}

export interface ViaAdministracion {
  codigo: string;
  nombre: string;
}

export interface RecetaMedica {
  total: number;
  idtemrec: string;
  item: string;
  forma: string;
  via: string;
  dosisyfrecuencia: string;
  turno: string;
  cantidad: number;
  duracion: number;
  codcie10: string;
  indicacion: string;
  nomcomercial: string;
  codsiga: string;
  codudm: string;
  dosis: string;
  frecuencia: string;
  ult_disp: string;
}

export interface RecetaResponse {
  data: RecetaMedica[];
  existe_receta_imprimir?: boolean;
  indicaciones_generales?: string;
}

export interface RecetaMedicaMedicamento {
  idtemrec: number;
  idpres: number;
  codcie10: string;
  iditem: number;
  durtrat: number;
  durdosis: number;
  durfrec: number;
  cant: number;
  desindic: string;
  tipoadmi: number;
  estado: string;
  usucre: string;
  feccre: string;
  idfarm: number;
  idrec: number;
}

export interface HistorialReceta {
  rn: number;
  idrec: number;
  numregis: string;
  codproc: string;
  tipoatenc: string;
  fecaten: string | Date;
  numsec: number;
}

export interface HistorialRecetaDetalle {
  iditem: number;
  item: string;
  forma: string;
  via: string;
  dosis: string;
  frecuencia: string;
  cantidad: number;
  duracion: number;
  indicaciones: string;
}
