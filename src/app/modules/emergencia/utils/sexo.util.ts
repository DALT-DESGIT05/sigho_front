const SEXO_ETIQUETA = {
  M: 'Masculino',
  F: 'Femenino',
} as const;

export type SexoNormalizado = keyof typeof SEXO_ETIQUETA;

export function normalizar_sexo(
  sexo: string | null | undefined,
  sexo_codigo: string | null | undefined = null,
): SexoNormalizado | '' {
  const valor = (sexo || sexo_codigo || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();

  if (valor === 'M' || valor === 'MASCULINO') {
    return 'M';
  }

  if (valor === 'F' || valor === 'FEMENINO') {
    return 'F';
  }

  return '';
}

export function etiqueta_sexo(
  sexo: string | null | undefined,
  sexo_codigo: string | null | undefined = null,
): string {
  const codigo = normalizar_sexo(sexo, sexo_codigo);
  return codigo ? SEXO_ETIQUETA[codigo] : '';
}
