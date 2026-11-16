export type NivelAlertaClinica = 'NORMAL' | 'ALTERADO' | 'CRITICO' | 'NO_INGRESADO';

export interface RangoUmbral {
  min: number;
  max: number;
}

export interface ReglaSignoVital {
  esCritico: (valor: number) => boolean;
  esNormal: (valor: number) => boolean;
  esAlterado: (valor: number) => boolean;
  mensajeCritico: (valor: number) => string;
}

export interface ProtocoloTriajeConfig {
  nombre: string;
  saturacion: ReglaSignoVital;
  pas: ReglaSignoVital;
  pad: ReglaSignoVital;
  fc: ReglaSignoVital;
  fr: ReglaSignoVital;
  temperatura: ReglaSignoVital;
  eva: {
    esCritico: (valor: number) => boolean;
    esSevero: (valor: number) => boolean;
    esModerado: (valor: number) => boolean;
    esNormal: (valor: number) => boolean;
  };
}

export const PROTOCOLO_TRIAJE_EMERGENCIA_ADULTOS: ProtocoloTriajeConfig = {
  nombre: 'Protocolo General de Emergencia (Adultos)',
  saturacion: {
    esCritico: (v) => v < 90,
    esNormal: (v) => v >= 95 && v <= 100,
    esAlterado: (v) => v >= 90 && v <= 94,
    mensajeCritico: (v) => `Sat. O₂ crítica (${v}%): Hipoxemia severa.`,
  },
  pas: {
    esCritico: (v) => v < 90 || v >= 180,
    esNormal: (v) => v >= 90 && v <= 139,
    esAlterado: (v) => v >= 140 && v <= 179,
    mensajeCritico: (v) =>
      v < 90
        ? `PAS crítica (${v} mmHg): Hipotensión / Shock.`
        : `PAS crítica (${v} mmHg): Crisis hipertensiva sistólica.`,
  },
  pad: {
    esCritico: (v) => v < 50 || v >= 110,
    esNormal: (v) => v >= 60 && v <= 89,
    esAlterado: (v) => v >= 90 && v <= 109,
    mensajeCritico: (v) =>
      v < 50
        ? `PAD crítica (${v} mmHg): Hipotensión diastólica severa.`
        : `PAD crítica (${v} mmHg): Crisis hipertensiva diastólica.`,
  },
  fc: {
    esCritico: (v) => v < 50 || v >= 130,
    esNormal: (v) => v >= 60 && v <= 100,
    esAlterado: (v) => (v >= 50 && v <= 59) || (v >= 101 && v <= 129),
    mensajeCritico: (v) =>
      v < 50
        ? `FC crítica (${v} lpm): Bradicardia severa.`
        : `FC crítica (${v} lpm): Taquicardia crítica.`,
  },
  fr: {
    esCritico: (v) => v < 10 || v > 28,
    esNormal: (v) => v >= 12 && v <= 20,
    esAlterado: (v) => (v >= 21 && v <= 28) || (v >= 10 && v <= 11),
    mensajeCritico: (v) =>
      v < 10
        ? `FR crítica (${v} rpm): Depresión respiratoria severa.`
        : `FR crítica (${v} rpm): Insuficiencia / Taquipnea severa.`,
  },
  temperatura: {
    esCritico: (v) => v <= 35.0 || v >= 40.0,
    esNormal: (v) => v >= 36.0 && v <= 37.5,
    esAlterado: (v) => (v >= 37.6 && v <= 39.9) || (v >= 35.1 && v <= 35.9),
    mensajeCritico: (v) =>
      v <= 35.0
        ? `Temperatura crítica (${v.toFixed(1)} °C): Hipotermia severa.`
        : `Temperatura crítica (${v.toFixed(1)} °C): Hiperpirexia.`,
  },
  eva: {
    esCritico: (v) => v >= 9,
    esSevero: (v) => v >= 7 && v <= 8,
    esModerado: (v) => v >= 4 && v <= 6,
    esNormal: (v) => v >= 0 && v <= 3,
  },
};
