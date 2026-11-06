// Regenera color/palettes/*.js a partir de los JSON (fuente de verdad de cada paleta).
// Uso: node lib/typefx/tools/sync-palettes.mjs
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '../color/palettes');
for (const f of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  const id = f.replace('.json', '');
  const json = JSON.parse(readFileSync(join(dir, f), 'utf8'));
  writeFileSync(join(dir, `${id}.js`), `// Generado a partir de ${f}. Edita el JSON y vuelve a ejecutar tools/sync-palettes.mjs.\nexport default ${JSON.stringify(json, null, 2)};\n`);
  console.log(`${f} → ${id}.js`);
}
