export interface EvaluacionMedicaData {
  tiempo_enfermedad: string;
  motivo_consulta: string;
  anamnesis: string;
  examen_regional: string;
  signos_y_sintomas: string;
  relato: string;
  plan_tratamiento?: string;
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
