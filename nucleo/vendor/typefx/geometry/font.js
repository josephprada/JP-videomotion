// Fuente variable a partir de los contornos generados por tools/bake-font.mjs.
// outline(ch, wght, wdth) interpola la rejilla de instancias y aplana las cuadráticas.

import { clamp } from '../engine/ease.js';

export function createFont(data) {
  const { axes, glyphs, unitsPerEm } = data;
  const W = axes.wght, D = axes.wdth;
  const cache = new Map();

  const locate = (arr, v) => {
    v = clamp(v, arr[0], arr[arr.length - 1]);
    let i = 0;
    while (i < arr.length - 2 && v > arr[i + 1]) i++;
    return [i, (v - arr[i]) / (arr[i + 1] - arr[i] || 1)];
  };

  function numbers(ch, wght, wdth) {
    const g = glyphs[ch] || glyphs[' '];
    const [iw, u] = locate(W, wght);
    const [id, v] = locate(D, wdth);
    const nd = D.length;
    const a = g.data[iw * nd + id], b = g.data[(iw + 1) * nd + id];
    const c = g.data[iw * nd + id + 1], d = g.data[(iw + 1) * nd + id + 1];
    const out = new Float64Array(a.length);
    for (let k = 0; k < a.length; k++) out[k] = (a[k] * (1 - u) + b[k] * u) * (1 - v) + (c[k] * (1 - u) + d[k] * u) * v;
    return { cmds: g.cmds, nums: out };
  }

  // Contornos en unidades de fuente, eje y hacia abajo (como el canvas), origen en la línea base.
  // tol: error máximo del aplanado, en unidades de fuente.
  function outline(ch, wght = 400, wdth = 100, tol = 1) {
    const key = `${ch}|${Math.round(wght)}|${Math.round(wdth * 2) / 2}|${tol}`;
    const hit = cache.get(key);
    if (hit) return hit;
    const { cmds, nums } = numbers(ch, wght, wdth);
    const contours = [];
    let cur = null, k = 1, px = 0, py = 0;
    for (const cmd of cmds) {
      if (cmd === 'M') {
        if (cur && cur.length > 4) contours.push(Float64Array.from(cur));
        px = nums[k++]; py = -nums[k++];
        cur = [px, py];
      } else if (cmd === 'L') {
        px = nums[k++]; py = -nums[k++];
        cur.push(px, py);
      } else if (cmd === 'Q') {
        const cx = nums[k++], cy = -nums[k++], x = nums[k++], y = -nums[k++];
        const dev = Math.hypot(px - 2 * cx + x, py - 2 * cy + y);
        const n = Math.max(2, Math.ceil(Math.sqrt(dev / (8 * tol))));
        for (let s = 1; s <= n; s++) {
          const t = s / n, mt = 1 - t;
          cur.push(mt * mt * px + 2 * mt * t * cx + t * t * x, mt * mt * py + 2 * mt * t * cy + t * t * y);
        }
        px = x; py = y;
      } else if (cmd === 'Z') {
        if (cur) {
          // Quita el punto final si repite el inicial.
          const m = cur.length;
          if (m > 4 && Math.abs(cur[m - 2] - cur[0]) < 1e-6 && Math.abs(cur[m - 1] - cur[1]) < 1e-6) cur.length = m - 2;
          if (cur.length > 4) contours.push(Float64Array.from(cur));
        }
        cur = null;
      }
    }
    if (cur && cur.length > 4) contours.push(Float64Array.from(cur));
    const result = { adv: nums[0], contours };
    if (cache.size > 4000) cache.clear();
    cache.set(key, result);
    return result;
  }

  const has = (ch) => ch in glyphs;
  return {
    family: data.family, unitsPerEm, ascender: data.ascender, descender: data.descender,
    capHeight: data.capHeight, xHeight: data.xHeight, axes, outline, has,
    // Tamaño de eme (px) para que la mayúscula mida capPx.
    sizeForCap: (capPx) => (capPx * unitsPerEm) / data.capHeight,
  };
}
