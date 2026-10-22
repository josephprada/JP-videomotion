// "pc98ify": convierte un cuadro dibujado a baja resolución en pixel art de computadora japonesa de los 90.
// 1) se dibuja la escena en un lienzo pequeño (p. ej. 360×640)
// 2) quantize(): tramado ordenado Bayer 4×4 + paleta de 16 colores de 12 bits (como el PC-9801)
// 3) present(): amplía con píxel duro y añade líneas de escaneo
// Determinista: sin ruido, sin estado. Se carga como <script> (window.PX) o con require() (tests).
(function (g) {
  const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const bayer4 = (x, y) => (B4[(y & 3) * 4 + (x & 3)] + 0.5) / 16;

  // "#RGB" (12 bits, como el hardware) o "#RRGGBB" → [r, g, b] en 0..255
  const parsePal = (hexes) => hexes.map((h) => {
    h = h.replace("#", "");
    if (h.length === 3) return [...h].map((c) => parseInt(c, 16) * 17);
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  });

  // Tabla 32×32×32 → índice de paleta más cercano (distancia perceptual simple)
  const LUTS = new Map();
  function lut(pal) {
    const key = pal.map((c) => c.join(",")).join("|");
    if (LUTS.has(key)) return LUTS.get(key);
    const t = new Uint8Array(32768);
    for (let r = 0; r < 32; r++) for (let gg = 0; gg < 32; gg++) for (let b = 0; b < 32; b++) {
      const R = r * 8 + 4, G = gg * 8 + 4, Bv = b * 8 + 4;
      let best = 0, bd = Infinity;
      for (let i = 0; i < pal.length; i++) {
        const [pr, pg, pb] = pal[i];
        const rm = (R + pr) / 2, dr = R - pr, dg = G - pg, db = Bv - pb;
        const d = (2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db;
        if (d < bd) { bd = d; best = i; }
      }
      t[(r << 10) | (gg << 5) | b] = best;
    }
    LUTS.set(key, t);
    return t;
  }

  // Los colores que ya son de la paleta salen planos: el tramado solo vive en lo intermedio
  // (degradados, bordes suavizados), como en el pixel art de PC-98.
  const EXACT = new Map();
  function exact(pal) {
    const key = pal.map((c) => c.join(",")).join("|");
    if (!EXACT.has(key)) EXACT.set(key, new Set(pal.map(([r, g, b]) => ((r >> 2) << 12) | ((g >> 2) << 6) | (b >> 2))));
    return EXACT.get(key);
  }

  // data: RGBA en sitio. spread: fuerza del tramado (0 = posterizado plano, 1 = tramado fuerte)
  function quantize(data, w, h, pal, spread = 0.55, x0 = 0, y0 = 0) {
    const t = lut(pal), ex = exact(pal), amp = 255 * spread / 3;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (ex.has(((data[i] >> 2) << 12) | ((data[i + 1] >> 2) << 6) | (data[i + 2] >> 2))) { data[i + 3] = 255; continue; }
      const o = (bayer4(x + x0, y + y0) - 0.5) * amp;
      const r = Math.min(255, Math.max(0, data[i] + o)) >> 3;
      const gg = Math.min(255, Math.max(0, data[i + 1] + o)) >> 3;
      const b = Math.min(255, Math.max(0, data[i + 2] + o)) >> 3;
      const c = pal[t[(r << 10) | (gg << 5) | b]];
      data[i] = c[0]; data[i + 1] = c[1]; data[i + 2] = c[2]; data[i + 3] = 255;
    }
    return data;
  }

  // Amplía el lienzo pequeño al grande con píxel duro y oscurece 1 de cada `scan` filas
  function present(src, dst, { scan = 3, scanAlpha = 0.16 } = {}) {
    const ctx = dst.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(src, 0, 0, dst.width, dst.height);
    if (scanAlpha > 0) {
      ctx.fillStyle = `rgba(0,0,0,${scanAlpha})`;
      for (let y = scan - 1; y < dst.height; y += scan) ctx.fillRect(0, y, dst.width, 1);
    }
  }

  const api = { bayer4, parsePal, lut, quantize, present };
  g.PX = api;
  if (typeof module !== "undefined") module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
