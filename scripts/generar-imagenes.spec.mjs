import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const generador = resolve('scripts/generar-imagenes.mjs');

function generar_catalogo(archivos, aliases, verificar) {
  const temporal = mkdtempSync(join(tmpdir(), 'sigho-imagenes-'));
  try {
    mkdirSync(join(temporal, 'public/images'), { recursive: true });
    mkdirSync(join(temporal, 'src/app/pipes'), { recursive: true });
    for (const archivo of archivos) {
      writeFileSync(join(temporal, 'public/images', archivo), '');
    }
    writeFileSync(join(temporal, 'src/app/pipes/imagenes.aliases.json'), JSON.stringify(aliases));
    const resultado = spawnSync(process.execPath, [generador], { cwd: temporal, encoding: 'utf8' });
    verificar(resultado, () => {
      const contenido = readFileSync(join(temporal, 'src/app/pipes/imagenes.generated.ts'), 'utf8');
      return JSON.parse(contenido.slice(contenido.indexOf('= ') + 2).trim().replace(/;$/, ''));
    });
  } finally {
    rmSync(temporal, { recursive: true, force: true });
  }
}

test('normaliza nombres nuevos y conserva selección explícita y prioridad PNG', () => {
  generar_catalogo(['Vocación Servicio.png', 'nuevo.svg', 'nuevo.png'], {}, (resultado, leer) => {
    assert.equal(resultado.status, 0, resultado.stderr);
    const catalogo = leer();
    assert.equal(catalogo.vocacion_servicio, 'images/Vocaci%C3%B3n%20Servicio.png');
    assert.equal(catalogo.nuevo, 'images/nuevo.png');
    assert.equal(catalogo['nuevo.svg'], 'images/nuevo.svg');
  });
});

test('un alias manual prevalece sin renombrar el archivo numérico', () => {
  generar_catalogo(['002.png', 'cardiologia.svg'], { cardiologia: '002.png' }, (resultado, leer) => {
    assert.equal(resultado.status, 0, resultado.stderr);
    assert.equal(leer().cardiologia, 'images/002.png');
    assert.equal(leer()['002'], 'images/002.png');
  });
});

test('rechaza alias inválidos y archivos inexistentes', () => {
  for (const aliases of [{ Cardiologia: '002.png' }, { pediatria: '084.png' }]) {
    generar_catalogo(['002.png'], aliases, (resultado) => {
      assert.notEqual(resultado.status, 0);
      assert.match(resultado.stderr, /Alias de imagen inválido|archivo inexistente/);
    });
  }
});
