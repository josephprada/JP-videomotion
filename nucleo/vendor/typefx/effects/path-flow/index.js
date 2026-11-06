// 11 · PATH / FLOW: el texto recorre una trayectoria y cada glifo se dobla con ella (por vértice).

import { defineEffect } from '../../engine/effect.js';
import { createPath, resample } from '../../geometry/path.js';
import { densifySet, mapGlyphs, mapGlyphPoints, setBBox, transformGlyph, glyphBBox } from '../../geometry/glyphset.js';
import { mat } from '../../geometry/path.js';

const N = 600;

// Trayectorias predefinidas para 1920×1080, como polilíneas abiertas de N puntos.
export const PATHS = {
  line: () => pts((t) => [-400 + t * 2800, 540]),
  's-curve': () => pts((t) => {
    const u = t * 1.6 - 0.3;
    return [-300 + u * 2500, 540 + Math.sin(u * Math.PI * 2) * 300 * Math.min(1, Math.max(0, 1.2 - Math.abs(u - 0.5)))];
  }),
  wave: () => pts((t) => [-400 + t * 2800, 540 + Math.sin(t * Math.PI * 7) * 140]),
  arc: () => pts((t) => { const a = Math.PI * (1.05 + t * 0.9); return [960 + Math.cos(a) * 900, 1240 + Math.sin(a) * 900]; }),
  // Espiral de Arquímedes desde fuera hacia el centro.
  spiral: () => pts((t) => { const a = t * Math.PI * 2 * 1.7 + Math.PI; const r = 1300 - t * 920; return [960 + Math.cos(a) * r * 1.05, 540 + Math.sin(a) * r * 0.6]; }),
  circle: () => pts((t) => { const a = t * Math.PI * 2 * 1.5 - Math.PI / 2; return [960 + Math.cos(a) * 400, 540 + Math.sin(a) * 400]; }),
};

function pts(fn) {
  const out = new Float64Array(N * 2);
  for (let i = 0; i < N; i++) { const [x, y] = fn(i / (N - 1)); out[2 * i] = x; out[2 * i + 1] = y; }
  return out;
}

const pathCache = new Map();
function getPath(spec, morphTo, m, laneOffset) {
  const key = `${typeof spec === 'string' ? spec : 'custom'}|${morphTo}|${m.toFixed(4)}|${laneOffset}`;
  if (pathCache.has(key)) return pathCache.get(key);
  const A = typeof spec === 'string' ? PATHS[spec]() : resampleOpen(spec);
  let P = A;
  if (morphTo && m > 0) {
    const B = typeof morphTo === 'string' ? PATHS[morphTo]() : resampleOpen(morphTo);
    P = A.map((v, i) => v + (B[i] - v) * m);
  }
  if (laneOffset) P = offsetPath(P, laneOffset);
  const path = createPath(P);
  if (pathCache.size > 400) pathCache.clear();
  pathCache.set(key, path);
  return path;
}

// Trayectoria resuelta con los mismos parámetros que el efecto (para dibujar cintas o guías debajo del texto).
export const pathFor = (path, morphTo = null, morph = 0, lane = 0) => getPath(path, morphTo, morph, lane);

function resampleOpen(points) {
  // Para trayectorias propias: se trata como polígono abierto y se reparte en N puntos.
  return resample(Float64Array.from(points), N);
}

function offsetPath(P, d) {
  const out = new Float64Array(P.length);
  for (let i = 0; i < N; i++) {
    const a = Math.max(0, i - 1), b = Math.min(N - 1, i + 1);
    const tx = P[2 * b] - P[2 * a], ty = P[2 * b + 1] - P[2 * a + 1], l = Math.hypot(tx, ty) || 1;
    out[2 * i] = P[2 * i] - (ty / l) * d;
    out[2 * i + 1] = P[2 * i + 1] + (tx / l) * d;
  }
  return out;
}

export default defineEffect({
  id: 'path-flow',
  name: 'Path / Flow',
  index: 11,
  params: {
    path: { type: 'enum', options: Object.keys(PATHS), default: 's-curve', doc: 'Trayectoria (o array de puntos propio)' },
    morphTo: { type: 'enum', options: [null, ...Object.keys(PATHS)], default: null, doc: 'Trayectoria hacia la que se transforma' },
    morph: { type: 'number', min: 0, max: 1, step: 0.001, default: 0, doc: 'Progreso de la transformación de trayectoria' },
    offset: { type: 'number', min: -4000, max: 4000, step: 1, default: 0, doc: 'Posición inicial sobre la trayectoria (px)' },
    flow: { type: 'number', min: -1000, max: 1000, step: 1, default: 180, doc: 'Avance por pulso (px)' },
    lane: { type: 'number', min: -800, max: 800, step: 1, default: 0, doc: 'Desplazamiento paralelo de la trayectoria (px)' },
    deform: { type: 'enum', options: ['bend', 'rigid'], default: 'bend', doc: 'bend: el glifo se curva · rigid: solo se coloca y gira' },
    density: { type: 'number', min: 2, max: 40, step: 1, default: 8, doc: 'Longitud máxima de tramo (px) en bend' },
  },
  transform(gs, p) {
    const path = getPath(p.path, p.morphTo, p.morph, p.lane);
    const box = setBBox(gs);
    const x0 = box.x;
    const base = gs.glyphs.length ? gs.glyphs[0].y : 0;
    const shift = p.offset + p.flow * p.b * p.speed * p.intensity;
    if (p.deform === 'rigid') {
      return mapGlyphs(gs, (g) => {
        const b = glyphBBox(g);
        const s = b.x + b.w / 2 - x0 + shift;
        const P = path.at(s);
        const a = Math.atan2(P.ty, P.tx);
        return transformGlyph(g, mat.chain(mat.translate(P.x, P.y), mat.rotate(a), mat.translate(-(b.x + b.w / 2), -base)));
      });
    }
    return mapGlyphs(densifySet(gs, p.density), (g) => mapGlyphPoints(g, (x, y) => {
      const P = path.at(x - x0 + shift);
      const n = y - base;
      return [P.x - P.ty * n, P.y + P.tx * n];
    }));
  },
  demo: { text: 'FLOW FLOW FLOW FLOW FLOW FLOW', cap: 120, params: { path: 's-curve', flow: 220 } },
});
