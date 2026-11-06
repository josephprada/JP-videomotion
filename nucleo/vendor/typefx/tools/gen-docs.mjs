// Genera docs/typefx-efectos.md a partir del esquema de parámetros de cada efecto.
// Uso: node lib/typefx/tools/gen-docs.mjs  (vuelve a ejecutarlo al añadir o cambiar un efecto)

import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listEffects, COMMON_PARAMS } from '../index.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const fmt = (v) => (v === null || v === undefined ? '—' : typeof v === 'object' ? (v.keys ? 'pista de claves' : JSON.stringify(v)) : String(v));
const range = (s) => (s.options ? s.options.filter((o) => o !== null).join(' · ') : s.min !== undefined ? `${s.min} … ${s.max}` : '');
const hooks = (d) => ['source', 'transform', 'render', 'compose'].filter((h) => d[h]).join(', ');

let md = `# typefx: referencia de efectos\n\nGenerado por \`lib/typefx/tools/gen-docs.mjs\` a partir del código. No editar a mano.\n\n`;
md += `## Parámetros comunes\n\nTodos los efectos los aceptan.\n\n| Parámetro | Tipo | Rango | Por defecto | Qué hace |\n|---|---|---|---|---|\n`;
for (const [k, s] of Object.entries(COMMON_PARAMS)) md += `| \`${k}\` | ${s.type} | ${range(s)} | ${fmt(s.default)} | ${s.doc} |\n`;
for (const d of listEffects().sort((a, b) => a.index - b.index)) {
  md += `\n## ${String(d.index).padStart(2, '0')} · ${d.name} · \`${d.id}\`\n\nEtapa: ${hooks(d)}. Módulo: \`lib/typefx/effects/${d.id}/index.js\`.\n\n`;
  md += `| Parámetro | Tipo | Rango | Por defecto | Qué hace |\n|---|---|---|---|---|\n`;
  for (const [k, s] of Object.entries(d.params)) if (!(k in COMMON_PARAMS)) md += `| \`${k}\` | ${s.type} | ${range(s)} | ${fmt(s.default)} | ${s.doc} |\n`;
  if (d.demo) md += `\nDemo: \`${JSON.stringify(d.demo.params)}\` sobre «${d.demo.text.replace(/\n/g, ' / ')}».\n`;
}
writeFileSync(join(root, 'docs/typefx-efectos.md'), md);
console.log('docs/typefx-efectos.md');
