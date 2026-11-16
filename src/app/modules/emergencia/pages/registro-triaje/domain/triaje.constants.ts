export const CODIGOS_AREA_EMERGENCIA = {
  TRAUMA_SHOCK: 'TRMSH',
  CONSULTORIO_EMERGENCIA: 'CON-EMER',
  SALA_OBSERVACION: 'SALOB',
  TOPICO: 'TOPC',
} as const;

export type CodigoAreaEmergencia =
  (typeof CODIGOS_AREA_EMERGENCIA)[keyof typeof CODIGOS_AREA_EMERGENCIA];

export const CODIGOS_PARAMETRO_CLINICO = {
  TEMP: 'TEMP',
  FC: 'FC',
  FR: 'FR',
  PA: 'PA',
  PAS: 'PAS',
  PAD: 'PAD',
  SATO2: 'SATO2',
  EVA: 'EVA',
  PESO: 'PESO',
  TALLA: 'TALLA',
  IMC: 'IMC',
} as const;

export const CODIGOS_CONDICION_LLEGADA = {
  CAMINANDO: 'PIE',
  SILLA_RUEDAS: 'SIL',
  AMBULANCIA: 'AMB',
  VEHICULO_PARTICULAR: 'VEH',
  VEHICULO_POLICIAL: 'POL',
  TRANSPORTE_AEREO: 'AER',
  BOMBEROS: 'BOM',
  OTRO: 'OTR',
} as const;

export const CODIGOS_PRIORIDAD = {
  I: 'I',
  II: 'II',
  III: 'III',
  IV: 'IV',
  V: 'V',
} as const;

export type NivelPrioridadTriaje =
  (typeof CODIGOS_PRIORIDAD)[keyof typeof CODIGOS_PRIORIDAD];

export const MOTIVO_INGRESO_POR_DEFECTO = 'EVME';
export const CONDICION_LLEGADA_POR_DEFECTO = CODIGOS_CONDICION_LLEGADA.CAMINANDO;
export const EDAD_CORTE_EMERGENCIA_ADULTOS = 14;
