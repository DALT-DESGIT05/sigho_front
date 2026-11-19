import { PrioridadOrdenMedica } from './interconsulta.interface';
import { TriajeDetalleRequest } from './signos-vitales.interface';

export type PrioridadTriaje = 'I' | 'II' | 'III' | 'IV' | 'V';
export type EstadoSeguimientoTriaje = 'PENDIENTE_TRIAJE' | 'TRIADO' | 'ATENCION_MEDICA';

export interface FiltrosSeguimientoTriaje {
  documento: string;
  numero_historia: string;
  motivo_consulta: string;
  estado: string;
  prioridad: string;
  personal: string;
  limite: number;
}

export interface PacienteSeguimientoTriaje {
  paciente_id: number;
  tipo_documento: string | null;
  numero_documento: string | null;
  numero_historia: string | null;
  apellido_paterno?: string | null;
  apellido_materno?: string | null;
  nombres?: string | null;
  nombre_completo: string;
  sexo_codigo?: string | null;
  sexo?: string | null;
  edad: number | null;
  grado_id?: number | null;
  grado?: string | null;
  grado_codigo?: string | null;
  situacion?: string | null;
  es_nn: boolean;
  es_discapacitado?: boolean | null;
  ind_discapacitado?: boolean | number | null;
  es_defensor_patria?: boolean | null;
  ind_defensor_patria?: boolean | number | null;
  tipo_persona_fap?: number | null;
  es_fap?: boolean | null;
}

export interface SeguimientoTriaje {
  atencion_id: number;
  codigo_episodio: string;
  paciente: PacienteSeguimientoTriaje;
  motivo_consulta: string | null;
  motivo_ingreso: string | null;
  estado_seguimiento: EstadoSeguimientoTriaje;
  estado_codigo: string | null;
  estado_nombre: string | null;
  prioridad: string | null;
  prioridad_nombre?: string | null;
  tiempo_maximo_atencion_minutos: number | null;
  area: string | null;
  destino: string | null;
  programacion_personal_id: number | null;
  medico: string | null;
  fecha_hora_ingreso: string;
  fecha_hora_llamada_med: string | null;
  fecha_hora_llegada: string | null;
  fecha_limite_atencion: string | null;
  minutos_restantes: number | null;
  vencido: boolean;
}

export interface PersonalProgramadoEmergencia {
  programacion_personal_id: number;
  personal_id: number;
  nombre_completo: string;
  sexo_sigla: string | null;
  prefijo: string | null;
  especialidad_id: number;
  especialidad: string;
  actividad_medica: string;
  turno: string | null;
  hora_inicio: string;
  hora_fin: string;
}

export interface RegistroTriajeFormValue {
  condicionLlegada: number | null;
  tipoIngreso: string;
  motivoIngreso: number | null;
  observaciones: string;
  temperatura: string;
  paSistolica: string;
  paDiastolica: string;
  saturacion: string;
  fc: string;
  fr: string;
  peso: string;
  talla: string;
  imc: string;
  eva: string;
  prioridad: string;
  motivoConsulta: string;
  destinoAreaId: number | null;
  destinoEspecialidadId: number | null;
  programacionPersonalId: number | null;
}

export interface CrearAtencionRequest {
  paciente_id: number;
  ind_discapacitado: boolean;
  atencion: {
    tipo_paciente_id: number;
    especialidad_id?: number;
    tipo_atencion_id: number;
    numero_historia: string | null;
  };
}

export interface CrearAtencionResponse {
  atencion_id: number;
  codigo_episodio: string;
  paciente_id: number;
  fecha_hora_ingreso: string;
  estado_codigo: string;
  estado_nombre: string;
}

export interface DetalleAtencionPaciente {
  paciente_id: number;
  tipo_documento_id: number | null;
  tipo_documento: string | null;
  numero_documento: string | null;
  numero_historia: string | null;
  apellido_paterno?: string | null;
  apellido_materno?: string | null;
  nombres?: string | null;
  nombre_completo: string;
  sexo_codigo: string | null;
  sexo: string | null;
  edad: number | null;
  grado_id: number | null;
  grado: string | null;
  grado_codigo: string | null;
  codigo_afiliado: string | null;
  cod_situ?: number | null;
  es_afiliado?: boolean;
  nsa: string | null;
  celular: string | null;
  correo_electronico: string | null;
  situacion: string | null;
  parentesco: string | null;
  codigo_parentesco?: string | null;
  titular_nombre?: string | null;
  titular_grado?: string | null;
  titular_unidad?: string | null;
  es_nn: boolean;
  es_discapacitado?: boolean | null;
  ind_discapacitado?: boolean | number | null;
  es_defensor_patria?: boolean | null;
  ind_defensor_patria?: boolean | number | null;
  tipo_persona_fap?: number | null;
  es_fap?: boolean | null;
}

export interface DetalleAtencionDatos {
  tipo_paciente_id: number;
  especialidad_id: number;
  procedencia_id: number;
  numero_historia: string | null;
}

export interface MedicoTratanteAtencion {
  nombre_completo: string;
  cmp?: string | null;
  rne?: string | null;
  nsa?: string | null;
  especialidad?: string | null;
}

export interface DetalleAtencionResponse {
  atencion_id: number;
  programacion_personal_id: number | null;
  medico_tratante?: MedicoTratanteAtencion | null;
  codigo_episodio: string;
  fecha_hora_ingreso: string;
  fecha_hora_llamada_med: string | null;
  fecha_hora_egr: string | null;
  estado_codigo: string | null;
  estado_nombre: string | null;
  estado_seguimiento: EstadoSeguimientoTriaje;
  triaje_registrado: boolean;
  motivo_ingreso_id?: number | null;
  motivo_ingreso?: string | null;
  motivo_consulta?: string | null;
  paciente: DetalleAtencionPaciente;
  atencion: DetalleAtencionDatos;
}

export interface RegistrarTriajeRequest {
  atencion_id: number;
  triaje: {
    condicion_llegada_id: number;
    motivo_ingreso_id: number;
    nivel_triaje_codigo: string;
    motivo_consulta: string;
    destino_area_id: number;
    destino_especialidad_id?: number | null;
    programacion_personal_id?: number | null;
    observacion: string | null;
  };
  control_vital: {
    observaciones: string | null;
    detalles: TriajeDetalleRequest[];
  };
}

export interface RegistrarTriajeAlertaResponse {
  codigo: string;
  color: string | null;
  genera_alerta: boolean;
}

export interface RegistrarTriajeDetalleResponse {
  control_vital_detalle_id: number;
  parametro_codigo: string;
  componente_codigo: string | null;
  valor: string;
  alerta: RegistrarTriajeAlertaResponse | null;
}

export interface TriajeTicket {
  numero_registro: string;
  ipress: string | null;
  ipress_sigla?: string | null;
  nsa: string | null;
  documento: string | null;
  acompanante?: string | null;
  destino: string | null;
  prioridad_codigo: string;
  prioridad_nombre?: string | null;
  prioridad_color: string;
  area: string;
  signos_vitales: RegistrarTriajeDetalleResponse[];
  motivo_consulta: string;
  triado_por: string;
  fecha_hora: string;
}

export interface RegistrarTriajeResponse {
  atencion_id: number;
  triaje_id: number;
  control_vital_id: number;
  prioridad_codigo: string;
  prioridad_nombre: string;
  prioridad_color: string;
  tiempo_maximo_atencion_minutos: number;
  destino_area_id: number;
  area_nombre: string;
  destino_especialidad_id?: number | null;
  destino_especialidad_nombre?: string | null;
  fecha_hora_llegada: string;
  fecha_limite_atencion: string;
  detalles: RegistrarTriajeDetalleResponse[];
  ticket: TriajeTicket;
}

export * from './alergia.interface';
export * from './cierre-atencion.interface';
export * from './descanso-medico.interface';
export * from './diagnostico.interface';
export * from './evaluacion.interface';
export * from './interconsulta.interface';
export * from './lesion.interface';
export * from './procedimiento-enfermeria.interface';
export * from './signos-vitales.interface';
export * from '../imagenologia/imagen.interface';
export * from '../laboratorio/laboratorio.interface';
export * from '../hospitalizacion/hospitalizacion.interface';
