// Curvas y utilidades de interpolación. Todas puras.

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const invLerp = (a, b, x) => clamp((x - a) / (b - a));
export const smoothstep = (a, b, x) => { const t = invLerp(a, b, x); return t * t * (3 - 2 * t); };
export const fract = (x) => x - Math.floor(x);

export const ease = {
  linear: (t) => t,
  inQuad: (t) => t * t,
  outQuad: (t) => 1 - (1 - t) * (1 - t),
  inOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  inCubic: (t) => t * t * t,
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  inQuart: (t) => t * t * t * t,
  outQuart: (t) => 1 - Math.pow(1 - t, 4),
  inOutQuart: (t) => (t < 0.5 ? 8 * t ** 4 : 1 - Math.pow(-2 * t + 2, 4) / 2),
  inExpo: (t) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
  outExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inOutExpo: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2),
  outBack: (t) => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  inBack: (t) => { const c1 = 1.9; return (c1 + 1) * t * t * t - c1 * t * t; },
  // Muelle amortiguado que parte de 0 y se asienta en 1.
  outElastic: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.exp(-6.5 * t) * Math.cos(t * 4.2 * Math.PI)),
};

export const getEase = (e) => (typeof e === 'function' ? e : ease[e] || ease.linear);

// Progreso normalizado de x dentro de [a, b], con curva.
export const seg = (x, a, b, e = 'linear') => getEase(e)(invLerp(a, b, x));

// Pistas de fotogramas clave: [[x, valor, curvaHaciaEsteValor], …]. Los valores pueden ser números o arrays.
export function keys(x, track) {
  if (x <= track[0][0]) return track[0][1];
  for (let i = 1; i < track.length; i++) {
    const [x1, v1, e] = track[i];
    if (x <= x1) {
      const [x0, v0] = track[i - 1];
      const t = getEase(e || 'inOutCubic')(invLerp(x0, x1, x));
      return Array.isArray(v0) ? v0.map((v, k) => lerp(v, v1[k], t)) : lerp(v0, v1, t);
    }
  }
  return track[track.length - 1][1];
}

// Muelle con rebote alrededor de 1: escala de golpe que se asienta (para estirar y aplastar).
export const spring = (t, freq = 3, decay = 5) => (t <= 0 ? 0 : 1 - Math.exp(-decay * t) * Math.cos(freq * 2 * Math.PI * t));
