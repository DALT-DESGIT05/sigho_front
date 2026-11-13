export interface PacienteBusqueda {
  paciente_id: number | null;
  persona_id: number;
  origen?: 'LOCAL' | 'SIFSA1';
  codigo_afiliado?: string | null;
  cod_situ?: number | null;
  tipo_documento_id: number;
  tipo_documento: string;
  numero_documento: string | null;
  apellido_paterno: string | null;
  apellido_materno: string | null;
  nombres: string | null;
  nsa: string | null;
  parentesco: string | null;
  tipo_afiliado: 'TITULAR' | 'FAMILIAR' | null;
  celular: string | null;
  correo_electronico: string | null;
  situacion: 'ACTIVIDAD' | 'RETIRO' | null;
  grado_id?: number | null;
  grado_codigo?: string | null;
  grado?: string | null;
  titular_nombre?: string | null;
  titular_grado?: string | null;
  titular_unidad?: string | null;
  sexo: string;
  edad: number | null;
  ind_discapacitado: boolean;
}

export interface ActualizarContactoPacienteRequest {
  persona_id: number;
  celular: string | null;
  correo_electronico: string | null;
}

export interface ActualizarContactoPacienteResponse extends ActualizarContactoPacienteRequest {}

export type SexoCodigo = 'M' | 'F';

export interface RegistrarPacienteNnRequest {
  sexo_codigo: SexoCodigo;
}

export interface RegistrarPacienteNnResponse {
  paciente_id: number;
  codigo_temporal: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  tipo_documento: string;
  numero_documento: null;
  sexo_codigo: SexoCodigo;
  sexo: string;
  es_nn: true;
  requiere_identificacion: true;
}

export interface RegistrarPacienteExtrafapRequest {
  tipo_documento_id: number;
  numero_documento: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  sexo_codigo: SexoCodigo;
  fecha_nacimiento: string | null;
  celular: string | null;
  correo_electronico: string | null;
}

export interface RegistrarPacienteExtrafapResponse {
  paciente_id: number;
  tipo_persona_fap: 2;
  tipo_documento: string;
  numero_documento: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  sexo_codigo: SexoCodigo;
  es_nn: false;
}

export interface RegistrarPacienteFapRequest {
  codigo_afiliado: string;
}

export interface RegistrarPacienteFapResponse {
  paciente_id: number;
  codigo_afiliado: string;
  nsa: string;
  unidad_codigo: number;
  grado_id: number;
  es_nn: false;
}
