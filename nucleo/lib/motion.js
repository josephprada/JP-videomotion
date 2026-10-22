// Movimiento como función pura del tiempo. Nada aquí guarda estado entre cuadros.
// Se carga como <script> clásico (expone window.M) o con require() en Node (tests).
(function (g) {
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const inv = (a, b, x) => clamp((x - a) / (b - a));

  // Resorte amortiguado de forma cerrada, 0 → 1. k = rigidez, d = amortiguación.
  function spring(t, k = 170, d = 26) {
    if (t <= 0) return 0;
    const w0 = Math.sqrt(k), z = d / (2 * w0);
    if (z < 1) {
      const wd = w0 * Math.sqrt(1 - z * z);
      return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + ((z * w0) / wd) * Math.sin(wd * t));
    }
    return 1 - Math.exp(-w0 * t) * (1 + w0 * t); // z >= 1 se trata como crítico
  }

  // Presets de rigidez/amortiguación por tipo de objeto
  const S = {
    snappy: [320, 30], // interfaz: botones, cajas de diálogo, bordes de ataque
    base: [170, 26], // tarjetas, contenedores, cámara
    heavy: [120, 24], // tipografía grande, objetos pesados
    playful: [200, 14], // personajes, stickers: sobrepaso visible
  };

  // Un valor con varios objetivos: un resorte por cada cambio, cada uno desde su tiempo.
  // keys: [[t, valor], ...] ordenado. Continuo y sin simular cuadros anteriores.
  function track(t, keys, k = 170, d = 26) {
    let v = keys[0][1];
    for (let i = 1; i < keys.length; i++) v += (keys[i][1] - keys[i - 1][1]) * spring(t - keys[i][0], k, d);
    return v;
  }

  // Indicador que se estira: el borde de ataque es más rígido que el de salida
  function indicator(t, stops, ancho = 120) {
    const lead = track(t, stops, 320, 30), trail = track(t, stops, 140, 22);
    return { left: Math.min(lead, trail), right: Math.max(lead, trail) + ancho };
  }

  // Texto dentro de una caja que se transforma: entra después del cambio, sale antes del siguiente
  const swapAlpha = (t, tIn, tOut) => Math.min(clamp((t - tIn - 0.08) / 0.12), clamp((tOut - 0.1 - t) / 0.1));

  const loopT = (t, dur) => ((t % dur) + dur) % dur;

  // Ruido con semilla (mulberry32). Nunca Math.random.
  function rng(seed) {
    return () => {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const hash = (seed, i) => rng((seed * 9973) ^ (i * 7919))();

  // Ruido de valor 1D, suave y determinista, en [-1, 1]
  function noise(seed, t) {
    const i = Math.floor(t), f = t - i, u = f * f * (3 - 2 * f);
    return lerp(hash(seed, i), hash(seed, i + 1), u) * 2 - 1;
  }

  // Animación limitada: retiene el tiempo en pasos de 1/fps (12 = "en dos" a 24, el anime de TV)
  const held = (t, fps = 12) => Math.floor(t * fps + 1e-6) / fps;

  // Temblor de cámara que decae desde t0. Devuelve [dx, dy].
  function shake(t, t0, amp, decay = 5, freq = 22, seed = 1) {
    const s = t - t0;
    if (s < 0) return [0, 0];
    const a = amp * Math.exp(-decay * s);
    return [a * noise(seed, s * freq), a * noise(seed + 17, s * freq)];
  }

  // Rejilla de beats sintetizada (si hay pista real, usar tools/beats.py → beats.json)
  const beat = (i, bpm, offset = 0) => offset + (i * 60) / bpm;

  // Easings para lo que no es físico (fundidos, barridos de máscara)
  const ease = {
    out: (x) => 1 - Math.pow(1 - clamp(x), 3),
    in: (x) => Math.pow(clamp(x), 3),
    inOut: (x) => (x = clamp(x), x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  };

  const api = { clamp, lerp, inv, spring, S, track, indicator, swapAlpha, loopT, rng, hash, noise, held, shake, beat, ease };
  g.M = api;
  if (typeof module !== "undefined") module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
