import type { RegistrarDescansoMedicoRequest } from '../emergencia/descanso-medico.interface';

export interface TipoAlta {
  id_tipo_alta: number;
  cod_tip_alta: string;
  nomb_tip_alta: string;
}

export interface DestinoEgreso {
  id_egreso: number;
  cod_egreso: string;
  nomb_egreso: string;
}

export interface CondicionAlta {
  id_condi_alta: number;
  cod_condi_alta: string;
  nomb_condi_alta: string;
}

export interface AltaPacienteCatalogos {
  tipos_alta: TipoAlta[];
  destinos: DestinoEgreso[];
  condiciones: CondicionAlta[];
}

export interface RegistrarAltaPacienteRequest {
  tipo_alta_id: number;
  egreso_id: number;
  condi_alta_id: number;
  observaciones?: string | null;
  resumen_egreso?: string | null;
  ind_act_fisica?: string | null;
  descanso_medico?: RegistrarDescansoMedicoRequest | null;
}
