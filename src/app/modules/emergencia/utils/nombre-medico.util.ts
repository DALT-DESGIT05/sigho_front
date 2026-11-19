import { normalizar_sexo } from './sexo.util';

export interface DatosMedico {
  nombre_completo?: string | null;
  apellido_paterno?: string | null;
  apellido_materno?: string | null;
  nombres?: string | null;
  sexo?: string | null;
  sexo_sigla?: string | null;
  sexo_codigo?: string | null;
  prefijo?: string | null;
}

export type MedicoInput = string | DatosMedico | null | undefined;

export interface FormatearMedicoOpciones {
  incluir_prefijo?: boolean;
  prefijo_por_defecto?: 'Dr.' | 'Dra.';
}

function capitalizar_palabra(palabra: string): string {
  if (!palabra) return '';
  return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
}

function capitalizar_nombres(texto: string): string {
  return texto
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(capitalizar_palabra)
    .join(' ');
}

export function obtener_prefijo_medico(
  sexo?: string | null,
  prefijo_existente?: string | null,
  prefijo_por_defecto: 'Dr.' | 'Dra.' = 'Dr.',
): 'Dr.' | 'Dra.' {
  if (prefijo_existente) {
    const lim = prefijo_existente.trim().toUpperCase();
    if (lim.startsWith('DRA')) return 'Dra.';
    if (lim.startsWith('DR')) return 'Dr.';
  }

  const norm = normalizar_sexo(sexo);
  if (norm === 'F') return 'Dra.';
  if (norm === 'M') return 'Dr.';

  return prefijo_por_defecto;
}

export function formatear_nombre_medico(
  medico: MedicoInput,
  opciones: FormatearMedicoOpciones = {},
): string {
  if (!medico) return '';

  const incluir_prefijo = opciones.incluir_prefijo ?? true;
  const prefijo_por_defecto = opciones.prefijo_por_defecto ?? 'Dr.';

  let apellido_paterno = '';
  let apellido_materno = '';
  let nombres = '';
  let sexo_raw: string | null = null;
  let prefijo_raw: string | null = null;
  let texto_completo = '';

  if (typeof medico === 'object') {
    apellido_paterno = medico.apellido_paterno?.trim() || '';
    apellido_materno = medico.apellido_materno?.trim() || '';
    nombres = medico.nombres?.trim() || '';
    sexo_raw = medico.sexo_sigla || medico.sexo_codigo || medico.sexo || null;
    prefijo_raw = medico.prefijo || null;
    texto_completo = medico.nombre_completo?.trim() || '';
  } else {
    texto_completo = medico.trim();
  }

  if ((apellido_paterno || apellido_materno) && nombres) {
    const apellidos = [apellido_paterno, apellido_materno]
      .filter(Boolean)
      .join(' ')
      .toUpperCase();
    const nombres_formateados = capitalizar_nombres(nombres);
    const prefijo = incluir_prefijo
      ? obtener_prefijo_medico(sexo_raw, prefijo_raw, prefijo_por_defecto)
      : '';
    const cuerpo = `${apellidos}, ${nombres_formateados}`;
    return prefijo ? `${prefijo} ${cuerpo}` : cuerpo;
  }

  if (!texto_completo) return '';

  const regexPrefijo = /^(dr[a]?\.?)\s+/i;
  const matchPrefijo = texto_completo.match(regexPrefijo);
  if (matchPrefijo) {
    if (!prefijo_raw) {
      prefijo_raw = matchPrefijo[1];
    }
    texto_completo = texto_completo.replace(regexPrefijo, '').trim();
  }

  let apellidos = '';
  let nombres_formateados = '';

  if (texto_completo.includes(',')) {
    const partes = texto_completo.split(',');
    apellidos = partes[0].trim().toUpperCase();
    nombres_formateados = capitalizar_nombres(partes.slice(1).join(' '));
  } else {
    const palabras = texto_completo.split(/\s+/).filter(Boolean);
    if (palabras.length >= 3) {
      apellidos = palabras.slice(-2).join(' ').toUpperCase();
      nombres_formateados = capitalizar_nombres(palabras.slice(0, -2).join(' '));
    } else if (palabras.length === 2) {
      apellidos = palabras[1].toUpperCase();
      nombres_formateados = capitalizar_palabra(palabras[0]);
    } else {
      apellidos = palabras[0]?.toUpperCase() || '';
    }
  }

  const cuerpo = nombres_formateados ? `${apellidos}, ${nombres_formateados}` : apellidos;
  if (!cuerpo) return '';

  const prefijo = incluir_prefijo
    ? obtener_prefijo_medico(sexo_raw, prefijo_raw, prefijo_por_defecto)
    : '';

  return prefijo ? `${prefijo} ${cuerpo}` : cuerpo;
}
