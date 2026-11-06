// 02 · WARP / DISTORT: deformación por vértice de los contornos (no de una imagen).

import { defineEffect } from '../../engine/effect.js';
import { fbm2D } from '../../engine/noise.js';
import { densifySet, mapGlyphPoints, mapGlyphs } from '../../geometry/glyphset.js';

const noiseCache = new Map();
const noiseFor = (seed) => {
  if (!noiseCache.has(seed)) noiseCache.set(seed, [fbm2D(seed, 3), fbm2D(seed + 77, 3)]);
  return noiseCache.get(seed);
};

export default defineEffect({
  id: 'warp-distort',
  name: 'Warp / Distort',
  index: 2,
  params: {
    field: { type: 'enum', options: ['sine', 'noise', 'twist', 'bulge', 'shear'], default: 'sine', doc: 'Tipo de campo de deformación' },
    amplitude: { type: 'number', min: 0, max: 600, step: 1, default: 80, doc: 'Amplitud (px; grados en twist; fuerza ×100 en bulge)' },
    frequency: { type: 'number', min: 0, max: 12, step: 0.05, default: 2, doc: 'Ciclos por 1000 px' },
    center: { type: 'vec2', default: [960, 540], doc: 'Centro del campo (px)' },
    radius: { type: 'number', min: 10, max: 2000, step: 1, default: 520, doc: 'Radio de influencia (twist, bulge)' },
    density: { type: 'number', min: 2, max: 40, step: 1, default: 6, doc: 'Longitud máxima de tramo antes de deformar (px)' },
  },
  transform(gs, p) {
    const A = p.amplitude * p.intensity;
    if (!A) return gs;
    const dense = densifySet(gs, p.density);
    const k = (p.frequency / 1000) * Math.PI * 2;
    const ph = p.b * p.speed * Math.PI * 2;
    const th = (p.direction * Math.PI) / 180;
    const dx = Math.cos(th), dy = Math.sin(th);
    const [cx, cy] = p.center;
    let fn;
    if (p.field === 'sine') {
      // La onda avanza en la dirección indicada y desplaza en perpendicular.
      fn = (x, y) => {
        const s = Math.sin((x * dx + y * dy) * k - ph) * A;
        return [x - dy * s, y + dx * s];
      };
    } else if (p.field === 'shear') {
      fn = (x, y) => {
        const s = Math.sin((x * dx + y * dy) * k - ph);
        return [x + Math.sign(s) * Math.pow(Math.abs(s), 0.5) * A * -dy, y + Math.sign(s) * Math.pow(Math.abs(s), 0.5) * A * dx];
      };
    } else if (p.field === 'noise') {
      const [n1, n2] = noiseFor(p.seed);
      const f = p.frequency / 1000;
      fn = (x, y) => [x + n1(x * f + p.b * p.speed * 0.5, y * f) * A, y + n2(x * f, y * f + p.b * p.speed * 0.5) * A];
    } else if (p.field === 'twist') {
      const R = p.radius, maxA = (A * Math.PI) / 180;
      fn = (x, y) => {
        const rx = x - cx, ry = y - cy, r = Math.hypot(rx, ry);
        if (r >= R) return [x, y];
        const q = 1 - r / R;
        const a = maxA * q * q * (1 + 0.15 * Math.sin(r * k - ph));
        const c = Math.cos(a), s = Math.sin(a);
        return [cx + rx * c - ry * s, cy + rx * s + ry * c];
      };
    } else {
      const R = p.radius, s = A / 100;
      fn = (x, y) => {
        const rx = x - cx, ry = y - cy, r = Math.hypot(rx, ry);
        if (r >= R || r === 0) return [x, y];
        const q = r / R;
        const f = 1 + s * (1 - q) * (1 - q);
        return [cx + rx * f, cy + ry * f];
      };
    }
    return mapGlyphs(dense, (g) => mapGlyphPoints(g, fn));
  },
  demo: { text: 'WARP\nWARP\nWARP', cap: 200, lineHeight: 0.75, params: { field: 'sine', amplitude: 60, frequency: 2.2, direction: 0, speed: 0.5 } },
});
