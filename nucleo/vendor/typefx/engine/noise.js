// Ruido de valor 2D con semilla, en [-1, 1]. Puro: no guarda nada entre llamadas.

import { hash } from './rng.js';

const fade = (t) => t * t * (3 - 2 * t);

export function valueNoise2D(seed = 1) {
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const u = fade(x - xi), v = fade(y - yi);
    const a = hash(seed, xi, yi), b = hash(seed, xi + 1, yi);
    const c = hash(seed, xi, yi + 1), d = hash(seed, xi + 1, yi + 1);
    return ((a + (b - a) * u) * (1 - v) + (c + (d - c) * u) * v) * 2 - 1;
  };
}

// Suma de octavas para un campo más orgánico.
export function fbm2D(seed = 1, octaves = 3) {
  const layers = [...Array(octaves)].map((_, i) => valueNoise2D(seed + i * 101));
  return (x, y) => {
    let s = 0, amp = 1, f = 1, norm = 0;
    for (const n of layers) { s += n(x * f, y * f) * amp; norm += amp; amp *= 0.5; f *= 2; }
    return s / norm;
  };
}
