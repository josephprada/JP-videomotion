// Primitivas de dibujo plano al estilo Kurzgesagt: sin contorno, sombra de celda y luz de borde.
// Todo es función pura de sus argumentos. Se carga como <script> (window.D).
(function (g0) {
  const cache = new Map();
  // caché acotada: las formas animadas generan cadenas nuevas cada cuadro y en un render largo crecería sin fin
  const P = (d) => { let p = cache.get(d); if (!p) { if (cache.size > 20000) cache.clear(); p = new Path2D(d); p.__d = d; cache.set(d, p); } return p; };

  // Línea de tinta global (estilo cómic): 0 = sin contorno (estilo plano). Una escena la enciende con D.cfg.tinta = n.
  // trama: un patrón (p. ej. puntos Ben-Day) que se pinta solo en la zona de sombra de cada forma; null = sin trama.
  const cfg = { tinta: 0, colorTinta: "#1A1226", trama: null };

  // Forma con sombra de celda: la luz viene de `luz` (vector unitario aprox., por defecto desde la izquierda-arriba).
  // c = { b: base, s: sombra, l: luz de borde }. so = ancho de la sombra, lo = ancho de la luz (unidades locales).
  function forma(g, d, c, { so = 14, lo = 4, luz = [-1, -0.35] } = {}) {
    const p = typeof d === "string" ? P(d) : d;
    if (!c.s && !c.l) { g.fillStyle = c.b; g.fill(p); entintar(g, p); return; }
    g.save(); g.clip(p);
    g.fillStyle = c.s || c.b; g.fill(p);
    if (cfg.trama && c.s) { g.fillStyle = cfg.trama; g.fill(p); }
    const sx = luz[0] * so, sy = luz[1] * so;
    if (c.l) { g.save(); g.translate(sx, sy); g.fillStyle = c.l; g.fill(p); g.restore(); }
    g.save(); g.translate(sx, sy); g.clip(p);
    g.translate(-sx - luz[0] * lo * (c.l ? 1 : 0), -sy - luz[1] * lo * (c.l ? 1 : 0)); g.fillStyle = c.b; g.fill(p);
    g.restore();
    g.restore();
    entintar(g, p);
  }
  function entintar(g, p) {
    if (!(cfg.tinta > 0)) return;
    g.lineWidth = cfg.tinta; g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = cfg.colorTinta; g.stroke(p);
  }
  const fill = (g, d, col) => { g.fillStyle = col; g.fill(typeof d === "string" ? P(d) : d); };
  // relleno recortado a otra forma (sombras con forma propia)
  function dentro(g, clip, d, col) { g.save(); g.clip(typeof clip === "string" ? P(clip) : clip); fill(g, d, col); g.restore(); }
  function trazo(g, d, col, w, cap = "round") { g.lineWidth = w; g.lineCap = cap; g.lineJoin = "round"; g.strokeStyle = col; g.stroke(typeof d === "string" ? P(d) : d); }
  function elipse(g, x, y, rx, ry, col, rot = 0) { g.beginPath(); g.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot, 0, Math.PI * 2); g.fillStyle = col; g.fill(); }
  // degradado radial suave (resplandores)
  function brillo(g, x, y, r, col, a = 1) {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, col); gr.addColorStop(1, col.length === 7 ? col + "00" : "rgba(0,0,0,0)");
    g.save(); g.globalAlpha *= a; g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore();
  }

  // Segmento de p a q: el dibujo local va a lo largo de +y, origen en p
  function seg(g, p, q, fn) {
    const dx = q[0] - p[0], dy = q[1] - p[1], len = Math.hypot(dx, dy);
    g.save(); g.translate(p[0], p[1]); g.rotate(Math.atan2(-dx, dy)); fn(len); g.restore();
  }
  // IK de dos huesos: raíz, objetivo, largos a y b, signo del doblez → [codo, extremo]
  function ik(root, target, a, b, sign = 1) {
    const dx = target[0] - root[0], dy = target[1] - root[1];
    const d = Math.min(a + b - 0.01, Math.max(Math.abs(a - b) + 0.01, Math.hypot(dx, dy)));
    const base = Math.atan2(dy, dx);
    const al = Math.acos((a * a + d * d - b * b) / (2 * a * d));
    const e = [root[0] + a * Math.cos(base + sign * al), root[1] + a * Math.sin(base + sign * al)];
    const c = [root[0] + d * Math.cos(base), root[1] + d * Math.sin(base)]; // objetivo recortado al alcance
    const ang = Math.atan2(c[1] - e[1], c[0] - e[0]);
    return [e, [e[0] + b * Math.cos(ang), e[1] + b * Math.sin(ang)]];
  }
  // mezcla de colores hex (para bruma atmosférica)
  function mezcla(a, b, t) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const ch = (s) => Math.round((((pa >> s) & 255) * (1 - t)) + (((pb >> s) & 255) * t));
    return "#" + ((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1);
  }

  const api = { cfg, P, forma, fill, dentro, trazo, elipse, brillo, seg, ik, mezcla };
  g0.D = api;
  if (typeof module !== "undefined") module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
