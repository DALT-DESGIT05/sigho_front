import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, extname } from 'node:path';

const archivos = readdirSync('public/images').filter((nombre) => /\.(png|svg|jpe?g|gif|webp|ico|avif)$/i.test(nombre)).sort();
const imagenes = {};
const alias_manuales = JSON.parse(readFileSync('src/app/pipes/imagenes.aliases.json', 'utf8'));
const normalizar_alias = (nombre) => nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

for (const archivo of archivos) {
  imagenes[archivo] = `images/${encodeURIComponent(archivo)}`;
}

// PNG tiene prioridad cuando también existe un SVG con el mismo nombre.
for (const archivo of [...archivos].sort((a, b) => Number(extname(b) === '.png') - Number(extname(a) === '.png'))) {
  const nombre = basename(archivo, extname(archivo));
  if (!(nombre in imagenes)) {
    imagenes[nombre] = imagenes[archivo];
  }
}

// Los nombres descriptivos generan un alias sin modificar el archivo original.
// Prioriza nombres que ya son snake_case y luego PNG, de forma determinista.
const archivos_alias = [...archivos].sort((a, b) => {
  const nombre_a = basename(a, extname(a));
  const nombre_b = basename(b, extname(b));
  return Number(nombre_b === normalizar_alias(nombre_b)) - Number(nombre_a === normalizar_alias(nombre_a))
    || Number(extname(b).toLowerCase() === '.png') - Number(extname(a).toLowerCase() === '.png');
});
for (const archivo of archivos_alias) {
  const alias = normalizar_alias(basename(archivo, extname(archivo)));
  if (alias && !Object.hasOwn(imagenes, alias)) {
    imagenes[alias] = imagenes[archivo];
  }
}

// Los alias manuales tienen prioridad sobre los automáticos.
for (const [alias, archivo] of Object.entries(alias_manuales)) {
  if (!/^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/.test(alias)) {
    throw new Error(`Alias de imagen inválido: ${alias}`);
  }
  if (!archivos.includes(archivo)) {
    throw new Error(`El alias ${alias} apunta a un archivo inexistente: ${archivo}`);
  }
  imagenes[alias] = imagenes[archivo];
}

writeFileSync('src/app/pipes/imagenes.generated.ts', `// Generado por scripts/generar-imagenes.mjs. No editar manualmente.\nexport const IMAGENES: Readonly<Record<string, string>> = ${JSON.stringify(imagenes, null, 2)};\n`);
