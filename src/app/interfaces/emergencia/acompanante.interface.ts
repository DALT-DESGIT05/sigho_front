export interface AcompananteFormValue {
  fap: boolean;
  extrafap: boolean;
  tipoDocumentoId: number | null;
  numero: string;
  sexoCodigo: string;
  fechaNacimiento: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  parentescoId: number | null;
  celular: string;
  correoElectronico: string;
}

export interface AcompananteBusqueda {
  persona_id: number;
  registrado_como_acompanante: boolean;
  tipo_documento_id: number;
  tipo_documento: string;
  numero_documento: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  nombres: string;
  sexo_codigo: string;
  sexo: string;
  fecha_nacimiento: string | null;
  celular: string | null;
  correo_electronico: string | null;
  tipo_persona_fap: 0 | 1 | 2;
  parentesco_id: number | null;
  parentesco: string | null;
}

export interface RegistrarAcompananteRequest {
  paciente_id: number;
  tipo_documento_id: number;
  numero_documento: string;
  sexo_codigo: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  fecha_nacimiento: string | null;
  parentesco_id: number;
  tipo_acompanante: 0 | 1;
  celular: string | null;
  correo_electronico: string | null;
}

export interface RegistrarAcompananteResponse {
  paciente_id: number;
  acompanante_id: number;
  tipo_documento_id: number;
  numero_documento: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  parentesco_id: number;
  parentesco: string;
  tipo_acompanante: 0 | 1;
}
