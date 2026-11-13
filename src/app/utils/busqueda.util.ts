/**
 * Normaliza una cadena quitando tildes y pasando a mayúsculas para búsquedas insensibles.
 */
export function normalizar_texto_busqueda(texto: string | null | undefined): string {
  if (!texto) {
    return '';
  }
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
}

/**
 * Filtra una lista de elementos verificando que todos los tokens/palabras del término
 * de búsqueda estén presentes en los campos evaluados del elemento.
 */
export function filtrar_elementos_por_tokens<T>(
  elementos: T[],
  termino: string,
  extraerCampos: (item: T) => (string | null | undefined)[],
): T[] {
  const terminoLimpio = normalizar_texto_busqueda(termino);
  if (!terminoLimpio) {
    return elementos;
  }

  const tokens = terminoLimpio.split(/\s+/).filter(Boolean);

  return elementos.filter((item) => {
    const textoCompleto = normalizar_texto_busqueda(extraerCampos(item).join(' '));
    return tokens.every((token) => textoCompleto.includes(token));
  });
}
