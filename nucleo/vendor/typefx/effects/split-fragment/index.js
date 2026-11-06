// 04 · SPLIT / FRAGMENT: corta los glifos en láminas, columnas o fragmentos poligonales y los separa.
// El corte es geométrico (Sutherland–Hodgman), así que los fragmentos siguen siendo contornos encadenables.

import { defineEffect } from '../../engine/effect.js';
import { hash } from '../../engine/rng.js';
import { clipConvex, mat, centroid } from '../../geometry/path.js';
import { setBBox, withGlyphs } from '../../geometry/glyphset.js';

function clipHalf(poly, a, b, c) {
  // Conserva el lado a·x + b·y <= c.
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const P = poly[i], Q = poly[(i + 1) % poly.length];
    const dp = a * P[0] + b * P[1] - c, dq = a * Q[0] + b * Q[1] - c;
    if (dp <= 0) out.push(P);
    if ((dp < 0 && dq > 0) || (dp > 0 && dq < 0)) {
      const t = dp / (dp - dq);
      out.push([P[0] + (Q[0] - P[0]) * t, P[1] + (Q[1] - P[1]) * t]);
    }
  }
  return out;
}

const cellCache = new Map();
function cells(box, mode, count, seed) {
  const key = `${mode}|${count}|${seed}|${box.x | 0}|${box.y | 0}|${box.w | 0}|${box.h | 0}`;
  if (cellCache.has(key)) return cellCache.get(key);
  const pad = 40;
  const x0 = box.x - pad, y0 = box.y - pad, x1 = box.x + box.w + pad, y1 = box.y + box.h + pad;
  let out = [];
  if (mode === 'slices' || mode === 'columns') {
    for (let i = 0; i < count; i++) {
      if (mode === 'slices') {
        const a = y0 + ((y1 - y0) * i) / count, b = y0 + ((y1 - y0) * (i + 1)) / count;
        out.push([[x0, a], [x1, a], [x1, b], [x0, b]]);
      } else {
        const a = x0 + ((x1 - x0) * i) / count, b = x0 + ((x1 - x0) * (i + 1)) / count;
        out.push([[a, y0], [b, y0], [b, y1], [a, y1]]);
      }
    }
  } else {
    // Voronoi por intersección de semiplanos: celdas convexas, exactas para el recorte.
    const pts = [...Array(count)].map((_, i) => [x0 + hash(seed, i, 1) * (x1 - x0), y0 + hash(seed, i, 2) * (y1 - y0)]);
    out = pts.map((P, i) => {
      let poly = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
      pts.forEach((Q, j) => {
        if (i === j || poly.length < 3) return;
        const a = Q[0] - P[0], b = Q[1] - P[1];
        const c = (Q[0] * Q[0] + Q[1] * Q[1] - P[0] * P[0] - P[1] * P[1]) / 2;
        poly = clipHalf(poly, a, b, c);
      });
      return poly;
    }).filter((p) => p.length >= 3);
  }
  if (cellCache.size > 200) cellCache.clear();
  cellCache.set(key, out);
  return out;
}

export default defineEffect({
  id: 'split-fragment',
  name: 'Split / Fragment',
  index: 4,
  params: {
    mode: { type: 'enum', options: ['slices', 'columns', 'shards'], default: 'slices', doc: 'Forma del corte' },
    count: { type: 'int', min: 2, max: 60, step: 1, default: 9, doc: 'Número de piezas' },
    spread: { type: 'number', min: 0, max: 1, step: 0.01, default: 1, doc: 'Separación (0 = entero, 1 = máxima)' },
    offset: { type: 'number', min: 0, max: 1200, step: 1, default: 220, doc: 'Desplazamiento máximo (px)' },
    rotation: { type: 'number', min: 0, max: 180, step: 1, default: 0, doc: 'Giro máximo de cada pieza (grados)' },
    bounds: { type: 'rect', default: null, doc: 'Zona de corte (por defecto, la caja del texto)' },
    pattern: { type: 'enum', options: ['alternate', 'random', 'radial'], default: 'alternate', doc: 'Reparto del desplazamiento' },
    roles: { type: 'list', default: null, doc: 'Roles de color alternos por pieza' },
    rebel: { type: 'object', default: null, doc: 'Pieza que no vuelve: { cell, dx, dy, role }' },
  },
  transform(gs, p) {
    const box = p.bounds || setBBox(gs);
    const cs = cells(box, p.mode, p.count, p.seed);
    const th = (p.direction * Math.PI) / 180;
    const ux = Math.cos(th), uy = Math.sin(th);
    const s = p.spread * p.intensity;
    const bc = [box.x + box.w / 2, box.y + box.h / 2];
    const out = [];
    cs.forEach((cell, ci) => {
      const cc = centroid(Float64Array.from(cell.flat()));
      let dx, dy;
      if (p.pattern === 'radial') {
        const vx = cc[0] - bc[0], vy = cc[1] - bc[1], l = Math.hypot(vx, vy) || 1;
        const m = p.offset * s * (0.5 + hash(p.seed, ci, 7));
        dx = (vx / l) * m; dy = (vy / l) * m;
      } else {
        const sign = p.pattern === 'alternate' ? (ci % 2 ? -1 : 1) : hash(p.seed, ci, 3) > 0.5 ? 1 : -1;
        const m = p.offset * s * sign * (p.pattern === 'alternate' ? 0.55 + 0.45 * hash(p.seed, ci, 4) : 0.3 + 0.7 * hash(p.seed, ci, 4));
        dx = ux * m; dy = uy * m;
      }
      const rot = ((hash(p.seed, ci, 5) * 2 - 1) * p.rotation * Math.PI / 180) * s;
      if (p.rebel && p.rebel.cell === ci) { dx += p.rebel.dx || 0; dy += p.rebel.dy || 0; }
      const m = mat.chain(mat.translate(dx, dy), mat.around(cc[0], cc[1], mat.rotate(rot)));
      const role = p.rebel && p.rebel.cell === ci && p.rebel.role ? p.rebel.role : p.roles ? p.roles[ci % p.roles.length] : null;
      for (const g of gs.glyphs) {
        const parts = g.contours.map((c) => clipConvex(c, cell)).filter(Boolean);
        if (!parts.length) continue;
        out.push({ ...g, contours: parts.map((c) => mat.apply(m, c)), cell: ci, cellCenter: cc, ...(role && role !== 'keep' ? { role } : {}) });
      }
    });
    return withGlyphs(gs, out);
  },
  demo: { text: 'SPLIT', cap: 380, params: { mode: 'slices', count: 9, spread: { keys: [[0, 0], [1, 1, 'outExpo'], [3, 1], [4, 0, 'inOutExpo']] }, offset: 260 } },
});
