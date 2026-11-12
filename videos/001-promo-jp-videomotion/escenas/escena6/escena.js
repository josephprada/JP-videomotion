// Escena 6 · VOX (global 16,8000–19,4333) · piel: estilo vox (collage documental)
// «en collage, como un documental,»
// Un mapa se pega sobre el papel en stop motion; el punto es el marcador: una ruta a mano llega a él y un lápiz lo rodea.
const E = ESCENA.crear({ t0: 16.8, dur: 2.6333 });
const { P, g, v, pj } = E;
const { inv, ease, spring, lerp } = M;
const C = ESTILO.color, F = ESTILO.fuente;
const T = { en: 17.46, collage: 17.63, como: 18.18, un: 18.54, documental: 18.72, fin: 19.4333 };
const antes = 0.08;
const W = P.W / P.ESC, H = P.H / P.ESC;
const vertical = H > W;
const dur = v(T.fin);
const PASO = PROMO.paso(W, H);
const MAPA = vertical ? { x: 90, y: PASO.y - 420, w: W - 180, h: 760 } : { x: PASO.x - 800, y: 180, w: 1000, h: 720 };
const DESTINO = { x: PASO.x, y: PASO.y, r: 20 };   // el marcador queda donde está el punto de paso

function silueta(semilla, cx, cy, rx, ry) {
  const p = new Path2D();
  for (let i = 0; i <= 96; i++) {
    const a = (i / 96) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    const f = 1 + 0.22 * M.noise(semilla, c * 1.4 + 5) + 0.16 * M.noise(semilla + 9, s * 1.7 + 5) + 0.06 * M.noise(semilla + 3, c * 4 + s * 4 + 9);
    i ? p.lineTo(cx + c * rx * f, cy + s * ry * f) : p.moveTo(cx + c * rx * f, cy + s * ry * f);
  }
  p.closePath(); return p;
}
const ISLA = silueta(4, MAPA.x + MAPA.w * 0.22, MAPA.y + MAPA.h * 0.3, 110, 80);
const CONTINENTE = silueta(11, MAPA.x + MAPA.w * 0.62, MAPA.y + MAPA.h * 0.62, 190, 170);
const ORIGEN = [MAPA.x + MAPA.w * 0.22, MAPA.y + MAPA.h * 0.3];

P.planos([[0, dur, plano]]);

function ruta(k) {
  // curva a mano: de la isla al marcador, en guiones de lápiz
  if (k <= 0) return;
  const [x0, y0] = ORIGEN, x1 = DESTINO.x, y1 = DESTINO.y, cx = (x0 + x1) / 2 + 60, cy = Math.min(y0, y1) - 140;
  g.save(); g.strokeStyle = C.tinta; g.lineWidth = 5; g.setLineDash([16, 12]); g.lineCap = "round";
  g.beginPath(); const n = 40;
  for (let i = 0; i <= n * k; i++) { const u = i / n, x = (1 - u) ** 2 * x0 + 2 * (1 - u) * u * cx + u * u * x1, y = (1 - u) ** 2 * y0 + 2 * (1 - u) * u * cy + u * u * y1; i ? g.lineTo(x, y) : g.moveTo(x, y); }
  g.stroke(); g.restore();
}

function piel(t) {
  const tp = pj(t);   // recortes en stop motion (12 fps)
  ESTILO.fondo(g, W, H);
  // título en recorte de archivo
  const kT = spring(tp - (v(T.en) - antes), 120, 21);
  COLLAGE.recorte(g, vertical ? 150 : W - 700, lerp(-300, vertical ? 120 : 200, kT), vertical ? 780 : 600, 200, (g, x, y, w, h) => {
    g.fillStyle = C.tinta; g.textAlign = "center"; g.textBaseline = "alphabetic"; g.font = "120px 'IM Fell English'"; g.fillText("en collage", x + w / 2, y + 140);
  }, { semilla: 3, rot: -0.025 });
  // el mapa se pega: sube desde abajo, gira un poco y se asienta
  const kM = spring(tp + 0.15, 120, 21);
  COLLAGE.recorte(g, MAPA.x, lerp(H + 200, MAPA.y, kM), MAPA.w, MAPA.h, (g, x, y, w, h) => {
    g.fillStyle = C.mar; g.fillRect(x, y, w, h);
    COLLAGE.reticula(g, x, y, w, h, { color: C.lineas });
    g.save(); g.translate(0, y - MAPA.y);
    g.fillStyle = C.tierra; g.fill(CONTINENTE);
    g.fillStyle = inv(v(T.collage), v(T.collage) + 0.15, tp) > 0.5 ? C.marcador : C.tierra; g.fill(ISLA);
    g.restore();
  }, { semilla: 8, rot: lerp(0.06, 0.012, kM) });
  if (kM > 0.99) {
    ruta(ease.out(inv(v(T.collage), v(T.como), t)));
    COLLAGE.circulo(g, DESTINO.x, DESTINO.y, 62, 52, ease.out(inv(v(T.como), v(T.como) + 0.5, t)), { color: C.lapiz });
    COLLAGE.etiqueta(g, "la idea · aquí", DESTINO.x + 120, DESTINO.y + 150, { linea: [DESTINO.x + 30, DESTINO.y + 40], k: inv(v(T.un), v(T.un) + 0.4, t), font: F.mono });
  }
  // DOCUMENTAL sobre marcador amarillo
  COLLAGE.rotulo(g, "DOCUMENTAL", vertical ? 140 : W - 680, vertical ? H * 0.78 : H * 0.74, inv(v(T.documental) - antes, v(T.documental) + 0.3, t), { font: "130px Anton", semilla: 5 });
}

function plano(t) {
  P.dis(() => {
    FOCO.dibujar(g, PROMO.piel(t, dur), W / 2, H / 2, (g) => piel(t), { caja: [0, 0, W, H] });
    const p = PROMO.viaje(t, dur, DESTINO, { llega: 0.1 }, W, H);
    MARCA.punto(g, p.x, p.y, p.r, { brillo: 0 });
    MARCA.rotulo(g, "Estilo · vox", W / 2, vertical ? H * 0.9 : H * 0.95, { px: 26, alinear: "center", color: "#2B2118", a: inv(v(T.documental), v(T.documental) + 0.15, t) * (1 - inv(dur - 0.25, dur, t)) });
  });
}
