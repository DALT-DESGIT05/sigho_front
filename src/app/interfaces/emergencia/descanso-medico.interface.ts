export interface TipoDescansoMedico {
  tipo_id: number;
  codigo: string;
  nombre: string;
  requiere_diagnostico: number;
}

export interface ExcepcionDescansoMedico {
  excepcion_id: number;
  codigo: string;
  nombre: string;
}

export interface DescansoMedicoExcepcionItem {
  descanso_id: number;
  excepcion_id: number;
  codigo: string;
  nombre: string;
}

export interface DescansoMedicoRegistro {
  descanso_id: number;
  tipo_id: number;
  indicador?: 1 | 2;
  tipo_codigo: string;
  tipo_nombre: string;
  total_dias: number;
  descripcion_clinica: string | null;
  fecha_emision: string;
  hora_emision: string;
  fecha_inicio: string;
  fecha_fin: string;
  excepciones: DescansoMedicoExcepcionItem[];
}

export interface DescansoMedicoData {
  descansos: DescansoMedicoRegistro[];
  tipos: TipoDescansoMedico[];
  excepciones: ExcepcionDescansoMedico[];
}

export interface RegistrarDescansoMedicoRequest {
  indicador?: 1 | 2;
  tipo_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  descripcion_clinica?: string | null;
  excepciones?: number[];
}
