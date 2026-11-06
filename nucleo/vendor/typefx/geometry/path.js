// Polígonos como Float64Array planos [x0, y0, x1, y1, …], cerrados implícitamente.

export function area(c) {
  let s = 0;
  const n = c.length;
  for (let i = 0; i < n; i += 2) {
    const j = (i + 2) % n;
    s += c[i] * c[j + 1] - c[j] * c[i + 1];
  }
  return s / 2;
}

export function centroid(c) {
  let a = 0, cx = 0, cy = 0;
  const n = c.length;
  for (let i = 0; i < n; i += 2) {
    const j = (i + 2) % n;
    const f = c[i] * c[j + 1] - c[j] * c[i + 1];
    a += f; cx += (c[i] + c[j]) * f; cy += (c[i + 1] + c[j + 1]) * f;
  }
  if (Math.abs(a) < 1e-9) {
    let sx = 0, sy = 0;
    for (let i = 0; i < n; i += 2) { sx += c[i]; sy += c[i + 1]; }
    return [sx / (n / 2 || 1), sy / (n / 2 || 1)];
  }
  return [cx / (3 * a), cy / (3 * a)];
}

export function bbox(contours) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const c of contours) {
    for (let i = 0; i < c.length; i += 2) {
      if (c[i] < x0) x0 = c[i];
      if (c[i] > x1) x1 = c[i];
      if (c[i + 1] < y0) y0 = c[i + 1];
      if (c[i + 1] > y1) y1 = c[i + 1];
    }
  }
  if (x0 === Infinity) return { x: 0, y: 0, w: 0, h: 0 };
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

export function perimeter(c) {
  let s = 0;
  const n = c.length;
  for (let i = 0; i < n; i += 2) {
    const j = (i + 2) % n;
    s += Math.hypot(c[j] - c[i], c[j + 1] - c[i + 1]);
  }
  return s;
}

// Subdivide los tramos más largos que maxLen: las rectas tienen que poder curvarse al deformarlas.
export function densify(c, maxLen) {
  const out = [];
  const n = c.length;
  for (let i = 0; i < n; i += 2) {
    const j = (i + 2) % n;
    const dx = c[j] - c[i], dy = c[j + 1] - c[i + 1];
    const k = Math.max(1, Math.ceil(Math.hypot(dx, dy) / maxLen));
    for (let s = 0; s < k; s++) out.push(c[i] + (dx * s) / k, c[i + 1] + (dy * s) / k);
  }
  return Float64Array.from(out);
}

// n puntos repartidos uniformemente por longitud de arco.
export function resample(c, n) {
  const m = c.length / 2;
  const cum = new Float64Array(m + 1);
  for (let i = 0; i < m; i++) {
    const j = (i + 1) % m;
    cum[i + 1] = cum[i] + Math.hypot(c[2 * j] - c[2 * i], c[2 * j + 1] - c[2 * i + 1]);
  }
  const total = cum[m] || 1;
  const out = new Float64Array(n * 2);
  let seg = 0;
  for (let k = 0; k < n; k++) {
    const s = (k / n) * total;
    while (seg < m - 1 && cum[seg + 1] < s) seg++;
    const j = (seg + 1) % m;
    const len = cum[seg + 1] - cum[seg] || 1;
    const u = (s - cum[seg]) / len;
    out[2 * k] = c[2 * seg] + (c[2 * j] - c[2 * seg]) * u;
    out[2 * k + 1] = c[2 * seg + 1] + (c[2 * j + 1] - c[2 * seg + 1]) * u;
  }
  return out;
}

export function mapContour(c, fn) {
  const out = new Float64Array(c.length);
  for (let i = 0; i < c.length; i += 2) {
    const p = fn(c[i], c[i + 1]);
    out[i] = p[0]; out[i + 1] = p[1];
  }
  return out;
}

// Matriz afín [a, b, c, d, e, f] como en canvas: x' = a·x + c·y + e, y' = b·x + d·y + f.
export const mat = {
  identity: () => [1, 0, 0, 1, 0, 0],
  translate: (x, y) => [1, 0, 0, 1, x, y],
  scale: (sx, sy = sx) => [sx, 0, 0, sy, 0, 0],
  rotate: (r) => [Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0],
  mul: (m, n) => [
    m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1],
    m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3],
    m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5],
  ],
  // Composición de izquierda a derecha: chain(A, B, C) aplica C, luego B, luego A.
  chain: (...ms) => ms.reduce((acc, m) => mat.mul(acc, m), [1, 0, 0, 1, 0, 0]),
  // Transformación alrededor de un pivote.
  around: (px, py, m) => mat.chain(mat.translate(px, py), m, mat.translate(-px, -py)),
  apply: (m, c) => {
    const out = new Float64Array(c.length);
    for (let i = 0; i < c.length; i += 2) {
      out[i] = m[0] * c[i] + m[2] * c[i + 1] + m[4];
      out[i + 1] = m[1] * c[i] + m[3] * c[i + 1] + m[5];
    }
    return out;
  },
};

// Recorte de Sutherland–Hodgman contra un polígono convexo [[x, y], …].
// Recortar cada contorno por separado y rellenar con la misma regla da exactamente la intersección.
export function clipConvex(c, clip) {
  let pts = [];
  for (let i = 0; i < c.length; i += 2) pts.push([c[i], c[i + 1]]);
  let sign = 0;
  for (let i = 0; i < clip.length; i++) {
    const a = clip[i], b = clip[(i + 1) % clip.length];
    sign += (b[0] - a[0]) * (b[1] + a[1]);
  }
  const s = sign > 0 ? 1 : -1;
  for (let e = 0; e < clip.length && pts.length; e++) {
    const a = clip[e], b = clip[(e + 1) % clip.length];
    const inside = (p) => s * ((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])) <= 0;
    const cross = (p, q) => {
      const d1x = q[0] - p[0], d1y = q[1] - p[1], d2x = b[0] - a[0], d2y = b[1] - a[1];
      const den = d1x * d2y - d1y * d2x;
      const t = den === 0 ? 0 : ((a[0] - p[0]) * d2y - (a[1] - p[1]) * d2x) / den;
      return [p[0] + d1x * t, p[1] + d1y * t];
    };
    const input = pts;
    pts = [];
    for (let i = 0; i < input.length; i++) {
      const cur = input[i], prev = input[(i + input.length - 1) % input.length];
      const ci = inside(cur), pi = inside(prev);
      if (ci) { if (!pi) pts.push(cross(prev, cur)); pts.push(cur); }
      else if (pi) pts.push(cross(prev, cur));
    }
  }
  if (pts.length < 3) return null;
  return Float64Array.from(pts.flat());
}

// Trayectoria abierta con tabla de longitud de arco: at(s) da punto y tangente unitaria.
export function createPath(points) {
  const n = points.length / 2;
  const cum = new Float64Array(n);
  for (let i = 1; i < n; i++) cum[i] = cum[i - 1] + Math.hypot(points[2 * i] - points[2 * i - 2], points[2 * i + 1] - points[2 * i - 1]);
  const length = cum[n - 1];
  function at(s) {
    // Fuera de los extremos se prolonga en línea recta.
    let i;
    if (s <= 0) i = 0;
    else if (s >= length) i = n - 2;
    else {
      let lo = 0, hi = n - 1;
      while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (cum[mid] <= s) lo = mid; else hi = mid; }
      i = lo;
    }
    const x0 = points[2 * i], y0 = points[2 * i + 1], x1 = points[2 * i + 2], y1 = points[2 * i + 3];
    const len = cum[i + 1] - cum[i] || 1;
    const u = (s - cum[i]) / len;
    const tx = (x1 - x0) / len, ty = (y1 - y0) / len;
    return { x: x0 + (x1 - x0) * u, y: y0 + (y1 - y0) * u, tx, ty };
  }
  return { length, at, points };
}
