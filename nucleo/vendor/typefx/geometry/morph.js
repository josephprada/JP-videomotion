// Morphing real entre contornos de dos glifos.
//
// 1. Remuestrea cada contorno a N puntos por longitud de arco.
// 2. Empareja contornos del mismo signo (exteriores con exteriores, contraformas con contraformas)
//    por cercanía de centroide, de mayor a menor área.
// 3. Gira el punto de inicio de cada par para minimizar la distancia total.
// 4. Los contornos sin pareja nacen o mueren en su propio centroide.

import { area, centroid, resample } from './path.js';

const N = 128;

function describe(contours) {
  return contours.map((c) => {
    const a = area(c);
    return { pts: resample(c, N), area: a, sign: Math.sign(a), center: centroid(c) };
  });
}

function bestShift(a, b) {
  let best = 0, bestD = Infinity;
  for (let s = 0; s < N; s++) {
    let d = 0;
    for (let i = 0; i < N; i++) {
      const j = (i + s) % N;
      const dx = a[2 * i] - b[2 * j], dy = a[2 * i + 1] - b[2 * j + 1];
      d += dx * dx + dy * dy;
      if (d > bestD) break;
    }
    if (d < bestD) { bestD = d; best = s; }
  }
  const out = new Float64Array(2 * N);
  for (let i = 0; i < N; i++) {
    const j = (i + best) % N;
    out[2 * i] = b[2 * j]; out[2 * i + 1] = b[2 * j + 1];
  }
  return out;
}

const collapsed = ([cx, cy]) => {
  const out = new Float64Array(2 * N);
  for (let i = 0; i < N; i++) { out[2 * i] = cx; out[2 * i + 1] = cy; }
  return out;
};

export function prepareMorph(contoursA, contoursB) {
  const A = describe(contoursA).sort((p, q) => Math.abs(q.area) - Math.abs(p.area));
  const B = describe(contoursB).sort((p, q) => Math.abs(q.area) - Math.abs(p.area));
  const usedB = new Set();
  const pairs = [];
  for (const a of A) {
    let pick = -1, pickD = Infinity;
    B.forEach((b, j) => {
      if (usedB.has(j) || b.sign !== a.sign) return;
      const d = Math.hypot(a.center[0] - b.center[0], a.center[1] - b.center[1]);
      if (d < pickD) { pickD = d; pick = j; }
    });
    if (pick >= 0) {
      usedB.add(pick);
      pairs.push([a.pts, bestShift(a.pts, B[pick].pts)]);
    } else {
      pairs.push([a.pts, collapsed(a.center)]);
    }
  }
  B.forEach((b, j) => { if (!usedB.has(j)) pairs.push([collapsed(b.center), b.pts]); });
  return pairs;
}

export function interpolateMorph(pairs, t) {
  const out = [];
  for (const [a, b] of pairs) {
    const c = new Float64Array(a.length);
    for (let i = 0; i < a.length; i++) c[i] = a[i] + (b[i] - a[i]) * t;
    out.push(c);
  }
  return out;
}

// Caché de pares por (de, a, peso, anchura): preparar un morph cuesta, interpolarlo no.
const cache = new Map();
export function morphOutline(font, from, to, t, wght, wdth) {
  const key = `${from}>${to}|${Math.round(wght / 10)}|${Math.round(wdth)}`;
  let entry = cache.get(key);
  if (!entry) {
    const a = font.outline(from, wght, wdth), b = font.outline(to, wght, wdth);
    entry = { pairs: prepareMorph(a.contours, b.contours), advA: a.adv, advB: b.adv };
    if (cache.size > 300) cache.clear();
    cache.set(key, entry);
  }
  return { adv: entry.advA + (entry.advB - entry.advA) * t, contours: interpolateMorph(entry.pairs, t) };
}
