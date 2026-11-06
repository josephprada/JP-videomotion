// Extrae los contornos de una fuente variable a un módulo ES que el navegador carga sin fontkit.
// Uso: node lib/typefx/tools/bake-font.mjs <fuente.ttf> <salida.js> [--wght 100,900,9] [--wdth 50,150,5] [--chars "ABC…"]
//
// Guarda cada glifo en una rejilla de instancias (wght × wdth). Todas las instancias de un glifo
// comparten estructura de comandos, así que el navegador interpola número a número.
// Con 9 × 5 instancias, el error bilineal medido en Anybody es de 2 unidades sobre 2000 por eme.

import * as fontkit from 'fontkit';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const argv = process.argv.slice(2);
const pos = [];
const opt = { wght: '100,900,9', wdth: '50,150,5', chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZÁÉÍÓÚÑÜ0123456789/.:-·→↑↓←+=×%¿¡!?,;()…' };
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith('--')) opt[argv[i].slice(2)] = argv[++i];
  else pos.push(argv[i]);
}
const [input, output] = pos;
if (!input || !output) {
  console.error('Uso: node lib/typefx/tools/bake-font.mjs <fuente.ttf> <salida.js> [--wght 100,900,9] [--wdth 50,150,5]');
  process.exit(1);
}

const LETTER = { moveTo: 'M', lineTo: 'L', quadraticCurveTo: 'Q', bezierCurveTo: 'C', closePath: 'Z' };

const range = (spec) => {
  const [a, b, n] = spec.split(',').map(Number);
  return [...Array(n)].map((_, i) => +(a + ((b - a) * i) / (n - 1)).toFixed(3));
};
const font = fontkit.openSync(resolve(input));
const W = range(opt.wght);
const D = range(opt.wdth);
const instances = [];
for (const w of W) for (const d of D) instances.push(font.getVariation({ wght: w, wdth: d }));

const glyphs = {};
for (const ch of [...new Set([...opt.chars, ' '])]) {
  const cp = ch.codePointAt(0);
  if (!font.hasGlyphForCodePoint(cp) && ch !== ' ') continue;
  let cmds = null;
  const data = instances.map((inst) => {
    const g = inst.glyphForCodePoint(cp);
    const c = g.path.commands;
    const sig = c.map((k) => LETTER[k.command]).join('');
    if (cmds === null) cmds = sig;
    else if (cmds !== sig) throw new Error(`El glifo «${ch}» cambia de estructura entre instancias`);
    return [Math.round(g.advanceWidth * 10) / 10, ...c.flatMap((k) => k.args.map((v) => Math.round(v * 10) / 10))];
  });
  // Solo M, L, Q y Z: fontkit entrega las TrueType como cuadráticas.
  if (/[^MLQZ]/.test(cmds)) throw new Error(`Comando no soportado en «${ch}»: ${cmds}`);
  glyphs[ch] = { cmds, data };
}

const out = {
  family: font.familyName,
  unitsPerEm: font.unitsPerEm,
  ascender: font.ascent,
  descender: font.descent,
  capHeight: font.capHeight,
  xHeight: font.xHeight,
  axes: { wght: W, wdth: D },
  glyphs,
};
mkdirSync(dirname(resolve(output)), { recursive: true });
writeFileSync(resolve(output), `// Generado por bake-font.mjs a partir de ${input.split('/').pop()}. No editar a mano.\nexport default ${JSON.stringify(out)};\n`);
console.log(`${Object.keys(glyphs).length} glifos × ${instances.length} instancias → ${output}`);
