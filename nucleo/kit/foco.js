// Foco de cámara: entradas y salidas por desenfoque, profundidad de campo por capa y texto «karaoke» que se enfoca
// palabra por palabra. La transición no es un fundido: es un cambio de foco (lo que entra se enfoca, lo que sale se desenfoca).
// Requiere nucleo/lib/motion.js (window.M). Lo puro (estado, profundidad, karaoke) se prueba en node; lo que dibuja usa canvas.
//   const e = FOCO.estado(t, { entra: v(T.titulo), sale: v(T.fin), blur: 18 });   // { a, blur, s, dy }
//   FOCO.dibujar(g, e, 540, 900, () => tarjeta(...), { caja: [x, y, w, h] });       // en coordenadas de diseño (dentro de P.dis)
//   FOCO.capa(g, FOCO.profundidad(0.4, 1), () => montanas());                      // profundidad de campo
//   FOCO.texto(g, [{ texto: "Head", t: 1.2 }, { texto: "head", t: 1.5, font: "italic 64px Instrument Serif" }], t, 540, 200, { font: "600 56px Inter" });
(function (g0) {
  const M = g0.M;
  const DEF = { dur: 0.45, blur: 18, escala: 0.06, dy: 0 };

  // Estado de un elemento en t: a (opacidad), blur (px de diseño), s (escala), dy (desplazamiento de diseño)
  function estado(t, o = {}) {
    const { entra = -Infinity, sale = Infinity, dur, blur, escala, dy } = { ...DEF, ...o };
    if (t < entra || t >= sale + dur) return { a: 0, blur, s: 1 - escala, dy };
    if (t >= sale) {
      const k = M.ease.in(M.inv(sale, sale + dur, t));
      return { a: 1 - k, blur: blur * k, s: 1 + escala * 0.5 * k, dy: -dy * k };
    }
    const k = t >= entra + dur ? 1 : M.ease.out(M.inv(entra, entra + dur, t));
    return { a: k, blur: blur * (1 - k), s: 1 - escala * (1 - k), dy: dy * (1 - k) };
  }

  // Desenfoque de una capa a distancia z (p de la cámara con parallax) cuando el foco está en zFoco
  function profundidad(z, zFoco = 1, { apertura = 24, max = 30 } = {}) {
    return Math.min(max, Math.abs(z - zFoco) * apertura);
  }

  // Palabras [{ texto, t, ...}] → mismo arreglo con el estado de cada una (cada palabra entra en su t; el bloque sale junto)
  function karaoke(palabras, t, { dur = 0.35, blur = 12, sale = Infinity, dy = 10 } = {}) {
    return palabras.map((p) => ({ ...p, ...estado(t, { entra: p.t, sale, dur, blur, escala: 0, dy }) }));
  }

  // ---- dibujo ----
  // Un lienzo auxiliar por nivel de anidamiento (FOCO.dibujar dentro de FOCO.dibujar). Se reinicia TODO su estado al usarlo.
  const pila = [];
  let nivel = 0;
  function auxiliar(w, h) {
    let c = pila[nivel];
    if (!c) { c = document.createElement("canvas"); pila[nivel] = c; }
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    const x = c.getContext("2d");
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = "source-over"; x.globalAlpha = 1; x.filter = "none";
    x.clearRect(0, 0, w, h);
    return [c, x];
  }
  const escalaDe = (T) => Math.hypot(T.a, T.b);

  // Dibuja fn con el estado e (desenfoque + opacidad de GRUPO + escala alrededor de cx, cy).
  // caja = [x, y, w, h] en coordenadas actuales: limita el área desenfocada (mucho más barato que el cuadro entero).
  function dibujar(g, e, cx, cy, fn, { caja = null } = {}) {
    if (!e || e.a <= 0.001) return;
    const T = g.getTransform(), esc = escalaDe(T), px = e.blur * esc * e.s;
    const transformar = (x) => { x.translate(cx, cy + (e.dy || 0)); x.scale(e.s, e.s); x.translate(-cx, -cy); };
    if (px < 0.25 && e.a >= 0.999) { g.save(); transformar(g); fn(g); g.restore(); return; }
    const W = g.canvas.width, H = g.canvas.height;
    let bx = 0, by = 0, bw = W, bh = H;
    if (caja) {
      const [x, y, w, h] = caja, m = e.s, pad = px * 3 + 2;
      const xs = [x, x + w].map((v) => cx + (v - cx) * m), ys = [y, y + h].map((v) => cy + (e.dy || 0) + (v - cy) * m);
      const esq = [[xs[0], ys[0]], [xs[1], ys[0]], [xs[0], ys[1]], [xs[1], ys[1]]].map(([u, v]) => [T.a * u + T.c * v + T.e, T.b * u + T.d * v + T.f]);
      bx = Math.max(0, Math.floor(Math.min(...esq.map((p) => p[0])) - pad)); by = Math.max(0, Math.floor(Math.min(...esq.map((p) => p[1])) - pad));
      bw = Math.min(W, Math.ceil(Math.max(...esq.map((p) => p[0])) + pad)) - bx; bh = Math.min(H, Math.ceil(Math.max(...esq.map((p) => p[1])) + pad)) - by;
      if (bw <= 0 || bh <= 0) return;
    }
    const [c, x] = auxiliar(bw, bh);
    x.setTransform(T.a, T.b, T.c, T.d, T.e - bx, T.f - by); transformar(x);
    nivel++; try { fn(x); } finally { nivel--; }
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha *= e.a; g.filter = px >= 0.25 ? `blur(${px.toFixed(2)}px)` : "none";
    g.drawImage(c, 0, 0, bw, bh, bx, by, bw, bh);
    g.restore();
  }

  // Profundidad de campo: la misma capa, solo desenfocada
  function capa(g, blur, fn, op = {}) { dibujar(g, { a: 1, blur, s: 1, dy: 0 }, 0, 0, fn, op); }

  // Texto karaoke: una línea de palabras que entran enfocándose. Cada palabra puede traer su font y color (la clave en serif itálica).
  // alinear: "center" | "left" | "right" respecto de x. Cada palabra es un solo fillText: el filtro se aplica directo, sin auxiliar.
  function texto(g, palabras, t, x, y, { font = "600 56px sans-serif", color = "#fff", alinear = "center", espacio = 0.28, ...o } = {}) {
    const est = karaoke(palabras, t, o);
    g.save(); g.textBaseline = "alphabetic"; g.textAlign = "left";
    const anchos = est.map((p) => { g.font = p.font || font; return g.measureText(p.texto).width; });
    g.font = font; const sp = g.measureText("M").width * espacio;
    const total = anchos.reduce((s, w) => s + w, 0) + sp * (est.length - 1);
    let cx = alinear === "center" ? x - total / 2 : alinear === "right" ? x - total : x;
    const esc = escalaDe(g.getTransform());
    est.forEach((p, i) => {
      if (p.a > 0.001) {
        g.font = p.font || font; g.fillStyle = p.color || color; g.globalAlpha = p.a;
        g.filter = p.blur * esc >= 0.25 ? `blur(${(p.blur * esc).toFixed(2)}px)` : "none";
        g.fillText(p.texto, cx, y + p.dy);
      }
      cx += anchos[i] + sp;
    });
    g.restore();
    return total;
  }

  const api = { estado, profundidad, karaoke, dibujar, capa, texto };
  g0.FOCO = api;
  if (typeof module !== "undefined") module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
