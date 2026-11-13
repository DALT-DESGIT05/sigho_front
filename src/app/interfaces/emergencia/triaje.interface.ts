export type PrioridadTriaje = 'I' | 'II' | 'III' | 'IV' | 'V';
export type EstadoSeguimientoTriaje = 'PENDIENTE_TRIAJE' | 'TRIADO';

export interface FiltrosSeguimientoTriaje {
  documento: string;
  numero_historia: string;
  motivo_consulta: string;
  estado: EstadoSeguimientoTriaje | '';
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
  edad: number | null;
  grado_id?: number | null;
  grado?: string | null;
  grado_codigo?: string | null;
  situacion?: string | null;
  es_nn: boolean;
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

export interface TriajeDetalleRequest {
  parametro_codigo: string;
  componente_codigo: string | null;
  valor: number;
}

export interface CrearAtencionRequest {
  paciente_id: number;
  ind_discapacitado: boolean;
  atencion: {
    tipo_paciente_id: number;
    especialidad_id?: number;
    procedencia_id: number;
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
  nsa: string | null;
  celular: string | null;
  correo_electronico: string | null;
  situacion: string | null;
  parentesco: string | null;
  titular_nombre?: string | null;
  titular_grado?: string | null;
  titular_unidad?: string | null;
  es_nn: boolean;
}

export interface DetalleAtencionDatos {
  tipo_paciente_id: number;
  especialidad_id: number;
  procedencia_id: number;
  numero_historia: string | null;
}

export interface DetalleAtencionResponse {
  atencion_id: number;
  programacion_personal_id: number | null;
  codigo_episodio: string;
  fecha_hora_ingreso: string;
  fecha_hora_llamada_med: string | null;
  estado_codigo: string | null;
  estado_nombre: string | null;
  estado_seguimiento: EstadoSeguimientoTriaje;
  triaje_registrado: boolean;
  paciente: DetalleAtencionPaciente;
  atencion: DetalleAtencionDatos;
}

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
  sustancia_id: number;
  gravedad_id: number;
  via_administracion_id: number | null;
  reaccion: string | null;
  edad_reaccion: number | null;
  fecha_ultima_reaccion: string | null;
  descripcion_adicional: string | null;
}

export interface AntecedenteFamiliarPaciente {
  antecedente_id: number;
  cie10_id: number;
  diagnostico_codigo: string;
  diagnostico_nombre: string;
  parentesco_id: number;
  parentesco_codigo: string;
  parentesco_nombre: string;
  estado_id: number;
  estado_codigo: string;
  estado_nombre: string;
  edad_familiar: number | null;
  comentario: string | null;
  fecha_registro: string;
}

export interface EstadoAntecedenteFamiliar {
  estado_id: number;
  codigo: string;
  nombre: string;
}

export interface AntecedentesFamiliaresContexto {
  familiares: AntecedenteFamiliarPaciente[];
  estados: EstadoAntecedenteFamiliar[];
}

export interface RegistrarAntecedenteFamiliarRequest {
  atencion_id: number;
  cie10_id: number;
  parentesco_id: number;
  estado_id: number;
  edad_fam: number | null;
  comentario: string | null;
}

export interface HabitoPaciente {
  antecedente_id: number;
  habito_id: number;
  habito_codigo: string;
  habito_nombre: string;
  estado_id: number;
  estado_codigo: string;
  estado_nombre: string;
  tiempo_consumo: number | null;
  ind_act_realiza: boolean | null;
  observacion: string | null;
  fecha_inicio_consumo: string | null;
  fecha_termino_consumo: string | null;
  fecha_registro: string;
}

export interface CatalogoHabito {
  habito_id: number;
  codigo: string;
  nombre: string;
}

export interface EstadoHabito {
  estado_id: number;
  codigo: string;
  nombre: string;
}

export interface HabitosContexto {
  habitos: HabitoPaciente[];
  catalogo: CatalogoHabito[];
  estados: EstadoHabito[];
}

export interface RegistrarHabitoRequest {
  atencion_id: number;
  habito_id: number;
  estado_id: number;
  tiempo_consumo: number | null;
  fecha_inicio_consu: string | null;
  fecha_termino_cons: string | null;
  ind_act_realiza: boolean | null;
  observacion: string | null;
}

export interface RepSexPerfil {
  antecedente_id: number;
  ciclo_id: number;
  ciclo_codigo: string;
  ciclo_nombre: string;
  orientacion_sex_id: number;
  orientacion_sex_codigo: string;
  orientacion_sex_nombre: string;
  resul_pap_id: number | null;
  resul_pap_codigo: string | null;
  resul_pap_nombre: string | null;
  met_anticon_id: number | null;
  met_anticon_codigo: string | null;
  met_anticon_nombre: string | null;
  resul_mamograf_id: number | null;
  resul_mamograf_codigo: string | null;
  resul_mamograf_nombre: string | null;
  fur: string | null;
  dur_ciclo: number | null;
  dur_mes: number | null;
  gestas: number | null;
  partos: number | null;
  abortos: number | null;
  hijos_vivos: number | null;
  ult_par_abor: string | null;
  desea_embarazo: boolean | null;
  tiempo_uso_met: number | null;
  comentario: string | null;
  fecha_ult_pap: string | null;
  obs_ginecologica: string | null;
  ini_vida_sex: number | null;
  parejas_sex: number | null;
  acti_sex_actual: boolean | null;
  uso_preservativo: boolean | null;
  ets: boolean | null;
  obs_sexuales: string | null;
  fecha_registro: string;
  fecha_actualizacion: string | null;
}

export interface CatalogoRepSexOption {
  codigo: string;
  nombre: string;
}

export interface CicloMestrualOption extends CatalogoRepSexOption {
  ciclo_id: number;
}

export interface OrientacionSexOption extends CatalogoRepSexOption {
  orientacion_sex_id: number;
}

export interface ResultadoPapOption extends CatalogoRepSexOption {
  resul_pap_id: number;
}

export interface MetodoAnticonceptivoOption extends CatalogoRepSexOption {
  met_anticon_id: number;
}

export interface ResultadoMamografiaOption extends CatalogoRepSexOption {
  resul_mamograf_id: number;
}

export interface RepSexContexto {
  perfil: RepSexPerfil | null;
  ciclos: CicloMestrualOption[];
  orientaciones_sexuales: OrientacionSexOption[];
  resultados_pap: ResultadoPapOption[];
  metodos_anticonceptivos: MetodoAnticonceptivoOption[];
  resultados_mamografia: ResultadoMamografiaOption[];
}

export interface RegistrarRepSexRequest {
  atencion_id: number;
  ciclo_id: number;
  orientacion_sex_id: number;
  resul_pap_id: number | null;
  met_anticon_id: number | null;
  resul_mamograf_id: number | null;
  fur: string | null;
  dur_ciclo: number | null;
  dur_mes: number | null;
  gestas: number | null;
  partos: number | null;
  abortos: number | null;
  hijos_vivos: number | null;
  ult_par_abor: string | null;
  desea_embarazo: boolean | null;
  tiempo_uso_met: number | null;
  comentario: string | null;
  fecha_ult_pap: string | null;
  obs_ginecologica: string | null;
  ini_vida_sex: number | null;
  parejas_sex: number | null;
  acti_sex_actual: boolean | null;
  uso_preservativo: boolean | null;
  ets: boolean | null;
  obs_sexuales: string | null;
}

export interface EvaluacionMedicaData {
  tiempo_enfermedad: string;
  motivo_consulta: string;
  anamnesis: string;
  examen_regional: string;
  signos_y_sintomas: string;
  relato: string;
  plan_tratamiento: string;
  tipo_reg_evaluac: 1 | 2;
}

export interface EvaluacionMedicaResponse extends EvaluacionMedicaData {
  evaluacion_id: number;
  atencion_id: number;
  fecha_hora: string;
}

export interface FuncionBiologica {
  funcion_id: number;
  codigo: string;
  nombre: string;
  estado_id: number | null;
  estado_codigo: string | null;
  estado_nombre: string | null;
  observacion: string | null;
}

export interface ExamenRegional {
  examen_id: number;
  codigo: string;
  nombre: string;
  estado_id: number | null;
  estado_codigo: string | null;
  estado_nombre: string | null;
  estado_tipo: 'CONSERVADO' | 'PATOLOGICO' | 'NO_EVALUADO' | null;
  observacion: string | null;
}

export interface EstadoExamenRegional {
  estado_id: number;
  estado_codigo: string | null;
  estado_nombre: string;
  estado_tipo: 'CONSERVADO' | 'PATOLOGICO' | 'NO_EVALUADO' | null;
}

export interface ExamenRegionalContexto {
  tipo_reg_evaluac: 1 | 2;
  estados: EstadoExamenRegional[];
  examenes_regionales: ExamenRegional[];
}

export interface Diagnostico {
  diagnostico_id: number;
  cie10_id: number;
  codigo: string;
  descripcion: string;
  tipo_id: number;
  tipo_codigo: string;
  tipo_nombre: string;
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
}

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

export interface PrioridadOrdenMedica {
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
  prioridades: PrioridadOrdenMedica[];
}

export interface ServicioLaboratorio {
  area_codigo: string;
  area_nombre: string;
  codigo: string;
  nombre: string;
  en_uso: boolean | number;
}

export interface OrdenLaboratorio {
  orden_id: number;
  laboratorio_id: number;
  servicio_codigo: string;
  servicio_nombre: string | null;
  area_codigo: string;
  area_nombre: string;
  prioridad_id: number;
  prioridad_codigo: string;
  prioridad_nombre: string;
  estado_id: number;
  estado_codigo: string;
  estado_nombre: string;
  estado_laboratorio_id: number;
  estado_laboratorio_codigo: string;
  estado_laboratorio_nombre: string;
  fecha_hora_orden: string;
}

export interface LaboratorioContexto {
  ordenes: OrdenLaboratorio[];
  prioridades: PrioridadOrdenMedica[];
  catalogo: ServicioLaboratorio[];
}

export interface ExamenHistorialLaboratorio {
  laboratorio_id: number;
  servicio_codigo: string;
  servicio_nombre: string;
  area_nombre: string;
  estado_nombre: string;
}

export interface OrdenHistorialLaboratorio {
  orden_id: number;
  atencion_id: number;
  fecha_hora_orden: string | null;
  prioridad_nombre: string;
  estado_nombre: string;
  examenes: ExamenHistorialLaboratorio[];
}

export interface HistorialLaboratorioContexto {
  ordenes: OrdenHistorialLaboratorio[];
}

export interface ExamenResultadoLaboratorio {
  codigo_examen: string;
  area_nombre: string;
  examen: string;
  sub_examen: string;
  resultado: string;
  unidades: string;
  referencia: string;
  fecha_resultado: string | null;
}

export interface OrdenResultadoLaboratorio {
  nro_registro: string;
  nro_orden: string;
  procedencia: string;
  situacion: string;
  medico: string;
  fecha_resultado: string | null;
  examenes: ExamenResultadoLaboratorio[];
}

export interface ResultadosLaboratorioContexto {
  ordenes: OrdenResultadoLaboratorio[];
}

export interface ServicioProcedEnf {
  area_codigo?: string;
  area_nombre?: string;
  codigo: string;
  nombre: string;
  en_uso: boolean | number;
}

export interface OrdenProcedEnf {
  orden_id: number;
  procedimiento_id: number;
  servicio_codigo: string;
  servicio_nombre: string | null;
  prioridad_id: number;
  prioridad_codigo: string;
  prioridad_nombre: string;
  estado_id: number;
  estado_codigo: string;
  estado_nombre: string;
  indicaciones: string | null;
  fecha_hora_orden: string;
}

export interface ProcedEnfContexto {
  ordenes: OrdenProcedEnf[];
  prioridades: PrioridadOrdenMedica[];
  catalogo: ServicioProcedEnf[];
}

export interface MotivoHospitalizacion {
  motivo_id: number;
  codigo: string;
  nombre: string;
}

export interface OrdenHospitalizacion {
  orden_hospitalizacion_id: number;
  diagnostico_id: number;
  diagnostico_codigo: string;
  diagnostico_nombre: string;
  motivo_id: number;
  motivo_codigo: string;
  motivo_nombre: string;
  observacion: string | null;
  fecha_registro: string | null;
}

export interface HospitalizacionContexto {
  ordenes: OrdenHospitalizacion[];
  motivos: MotivoHospitalizacion[];
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
  observaciones: string | null;
  origen_codigo: string;
  origen_nombre: string;
  detalles: SignoVitalDetalleHistorial[];
}

export interface RegistrarSignosVitalesRequest {
  observaciones: string | null;
  detalles: TriajeDetalleRequest[];
}

export interface AreaInterconsulta {
  area_id: number;
  nombre: string;
}

export interface EspecialidadInterconsulta {
  especialidad_id: number;
  nombre: string;
  area_id?: number | null;
}

export interface PersonalInterconsulta {
  programacion_personal_id: number;
  especialidad_id: number;
  especialidad: string;
  nombre_completo: string;
  turno: string;
  hora_inicio: string;
  hora_fin: string;
}

export interface OrdenInterconsulta {
  interconsulta_id: number;
  orden_id: number;
  diagnostico_id: number;
  diagnostico_codigo: string;
  diagnostico_nombre: string;
  especialidad_id: number;
  especialidad_nombre: string;
  area_id: number;
  area_nombre: string;
  programacion_personal_id: number;
  personal_nombre: string;
  que_solicita: string;
  observaciones: string | null;
  estado_codigo: string;
  estado_nombre: string;
  fecha_hora_orden: string;
}

export interface InterconsultaContexto {
  ordenes: OrdenInterconsulta[];
  areas: AreaInterconsulta[];
  especialidades: EspecialidadInterconsulta[];
  personal: PersonalInterconsulta[];
  prioridades: PrioridadOrdenMedica[];
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

export interface DestinoCierreAtencion {
  id_estado: number;
  cod_estado: string;
  des_estado: string;
}

export interface CierreAtencionEstado {
  puede_cerrar: boolean;
  motivos: string[];
  destinos: DestinoCierreAtencion[];
}
