import {
  CatalogoParametroClinico,
  CatalogoComponenteClinico,
} from '../../../interfaces/emergencia/catalogo-emergencia.interface';

export type CampoSignoVital =
  | 'temperatura'
  | 'paSistolica'
  | 'paDiastolica'
  | 'saturacion'
  | 'fc'
  | 'fr'
  | 'peso'
  | 'talla';

export interface MetadataSignoVital {
  readonly campo: CampoSignoVital;
  readonly codigoParametro: string;
  readonly codigoComponente?: string;
  readonly nombre: string;
  readonly unidad: string;
  readonly decimales: number;
  readonly minFallback: number;
  readonly maxFallback: number;
}

export interface LimitesSignoVital {
  readonly min: number;
  readonly max: number;
  readonly nombre: string;
  readonly unidad: string;
  readonly decimales: number;
}

export const METADATA_SIGNOS_VITALES: Readonly<Record<CampoSignoVital, MetadataSignoVital>> = {
  temperatura: {
    campo: 'temperatura',
    codigoParametro: 'TEMP',
    nombre: 'Temperatura',
    unidad: '°C',
    decimales: 1,
    minFallback: 30.0,
    maxFallback: 45.0,
  },
  paSistolica: {
    campo: 'paSistolica',
    codigoParametro: 'PA',
    codigoComponente: 'PAS',
    nombre: 'PAS',
    unidad: 'mmHg',
    decimales: 0,
    minFallback: 30,
    maxFallback: 300,
  },
  paDiastolica: {
    campo: 'paDiastolica',
    codigoParametro: 'PA',
    codigoComponente: 'PAD',
    nombre: 'PAD',
    unidad: 'mmHg',
    decimales: 0,
    minFallback: 20,
    maxFallback: 200,
  },
  saturacion: {
    campo: 'saturacion',
    codigoParametro: 'SATO2',
    nombre: 'Sat. O₂',
    unidad: '%',
    decimales: 0,
    minFallback: 60,
    maxFallback: 100,
  },
  fc: {
    campo: 'fc',
    codigoParametro: 'FC',
    nombre: 'FC',
    unidad: 'lpm',
    decimales: 0,
    minFallback: 20,
    maxFallback: 300,
  },
  fr: {
    campo: 'fr',
    codigoParametro: 'FR',
    nombre: 'FR',
    unidad: 'rpm',
    decimales: 0,
    minFallback: 4,
    maxFallback: 100,
  },
  peso: {
    campo: 'peso',
    codigoParametro: 'PESO',
    nombre: 'Peso',
    unidad: 'kg',
    decimales: 1,
    minFallback: 0.3,
    maxFallback: 350.0,
  },
  talla: {
    campo: 'talla',
    codigoParametro: 'TALLA',
    nombre: 'Talla',
    unidad: 'cm',
    decimales: 1,
    minFallback: 20.0,
    maxFallback: 250.0,
  },
};

/**
 * Resuelve los límites admisibles priorizando el catálogo proveniente de base de datos.
 */
export function resolver_limites_signo_vital(
  campo: CampoSignoVital,
  parametrosCatalogo: readonly CatalogoParametroClinico[] = []
): LimitesSignoVital {
  const meta = METADATA_SIGNOS_VITALES[campo];
  if (!meta) {
    return { min: 0, max: 999, nombre: campo, unidad: '', decimales: 0 };
  }

  const param = parametrosCatalogo.find((p) => p.codigo === meta.codigoParametro);

  if (meta.codigoComponente && param?.componentes) {
    const comp = param.componentes.find((c: CatalogoComponenteClinico) => c.codigo === meta.codigoComponente);
    const minComp = comp?.puntaje_minimo != null ? Number(comp.puntaje_minimo) : null;
    const maxComp = comp?.puntaje_maximo != null ? Number(comp.puntaje_maximo) : null;

    if (minComp !== null || maxComp !== null) {
      return {
        min: minComp ?? meta.minFallback,
        max: maxComp ?? meta.maxFallback,
        nombre: comp?.nombre || meta.nombre,
        unidad: comp?.unidad_medida_nombre || meta.unidad,
        decimales: meta.decimales,
      };
    }
  }

  const minParam = param?.valor_minimo_admisible != null ? Number(param.valor_minimo_admisible) : null;
  const maxParam = param?.valor_maximo_admisible != null ? Number(param.valor_maximo_admisible) : null;

  return {
    min: minParam ?? meta.minFallback,
    max: maxParam ?? meta.maxFallback,
    nombre: param?.nombre || meta.nombre,
    unidad: param?.unidad_medida_nombre || meta.unidad,
    decimales: param?.cantidad_decimales ?? meta.decimales,
  };
}

/**
 * Valida un valor frente a los límites admisibles y retorna el mensaje explicativo.
 */
export function validar_rango_signo_vital(
  campo: CampoSignoVital,
  valor: unknown,
  parametrosCatalogo: readonly CatalogoParametroClinico[] = []
): string {
  if (valor === null || valor === undefined || String(valor).trim() === '') {
    return '';
  }

  const valorNormalizado = String(valor).trim().replace(',', '.');
  const num = Number(valorNormalizado);
  if (Number.isNaN(num)) {
    return 'Debe ser un número válido.';
  }

  const limites = resolver_limites_signo_vital(campo, parametrosCatalogo);

  if (num < limites.min || num > limites.max) {
    const minStr = limites.decimales > 0 ? limites.min.toFixed(limites.decimales) : String(limites.min);
    const maxStr = limites.decimales > 0 ? limites.max.toFixed(limites.decimales) : String(limites.max);
    return `${limites.nombre} debe estar entre ${minStr} y ${maxStr} ${limites.unidad}.`;
  }

  return '';
}

/**
 * Formatea el rango numérico admisible para ser utilizado en placeholders y tooltips.
 */
export function formatear_placeholder_rango(
  campo: CampoSignoVital,
  parametrosCatalogo: readonly CatalogoParametroClinico[] = []
): string {
  const lim = resolver_limites_signo_vital(campo, parametrosCatalogo);
  const minStr = lim.decimales > 0 ? lim.min.toFixed(lim.decimales) : String(lim.min);
  const maxStr = lim.decimales > 0 ? lim.max.toFixed(lim.decimales) : String(lim.max);
  return `${minStr} - ${maxStr}`;
}

/**
 * Valida la consistencia fisiológica entre Presión Arterial Sistólica y Diastólica.
 */
export function validar_consistencia_presion_arterial(
  pas: unknown,
  pad: unknown
): string {
  if (
    pas !== null &&
    pas !== undefined &&
    String(pas).trim() !== '' &&
    pad !== null &&
    pad !== undefined &&
    String(pad).trim() !== ''
  ) {
    const pasNum = Number(pas);
    const padNum = Number(pad);
    if (!Number.isNaN(pasNum) && !Number.isNaN(padNum) && pasNum <= padNum) {
      return 'PAS debe ser mayor que PAD.';
    }
  }
  return '';
}
