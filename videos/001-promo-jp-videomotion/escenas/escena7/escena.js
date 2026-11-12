// Escena 7 · CÓMIC (global 19,4333–21,0667) · piel: estilo cómic
// «en cómic,»
// El punto es una pelota: toma impulso y golpea el centro de la viñeta en «cómic» → estallido, líneas de foco y ¡POW!
const E = ESCENA.crear({ t0: 19.4333, dur: 1.6334 });
const { P, g, v, pj } = E;
const { inv, ease, lerp } = M;
const T = { en: 19.82, comic: 20.18, fin: 21.0667 };
const antes = 0.08;
const W = P.W / P.ESC, H = P.H / P.ESC;
const vertical = H > W;
const dur = v(T.fin);
const PASO = PROMO.paso(W, H);
const V = vertical ? { x: 60, y: 200, w: W - 120, h: H - 520 } : { x: 160, y: 60, w: W - 320, h: H - 200 };
const golpe = v(T.comic) - antes;
const TINTA = "#1A1226";

P.planos([[0, dur, plano]]);

// la pelota: sale del paso, toma impulso hacia arriba a la izquierda y vuelve de golpe al centro (en dos: 12 fps)
function pelota(t) {
  const tp = pj(t);
  if (tp < golpe) {
    const k = ease.out(inv(0, golpe * 0.7, tp)), r = ease.in(inv(golpe * 0.7, golpe, tp));
    const ax = PASO.x - 260, ay = PASO.y - 330;
    return { x: lerp(lerp(PASO.x, ax, k), PASO.x, r), y: lerp(lerp(PASO.y, ay, k), PASO.y, r), r: lerp(PASO.r, 64, k) * (r > 0 ? lerp(1, 0.75, r) : 1), sq: 1 };
  }
  const u = tp - golpe;
  const sq = 1 + 0.45 * Math.exp(-u * 12) * Math.cos(u * 40);   // se aplasta contra la página y rebota
  return { x: PASO.x, y: PASO.y, r: lerp(60, PASO.r, ease.inOut(inv(dur - 0.45, dur, t))), sq };
}

function piel(t) {
  g.fillStyle = ESTILO.fondo; g.fillRect(0, 0, W, H);
  COMIC.vineta(g, V.x, V.y, V.w, V.h, (g) => {
    // dentro de la viñeta las coordenadas son locales (0,0 = esquina de la viñeta)
    const cx = PASO.x - V.x, cy = PASO.y - V.y;
    COMIC.fondoPuntos(g, 0, 0, V.w, V.h, "#FFD23F", "#F29E1F", { celda: 26 });
    if (t >= golpe) {
      COMIC.lineasFoco(g, V.w, V.h, cx, cy, { hueco: 260, a: 0.8, color: TINTA });
      COMIC.impacto(g, cx, cy, 300, ease.out(inv(golpe, golpe + 0.18, t)), { semilla: 4 });
    }
  }, { borde: 12, tinta: TINTA, rot: -0.012 });
  if (t >= golpe) COMIC.onomatopeya(g, "¡POW!", PASO.x + (vertical ? 60 : 260), PASO.y + (vertical ? 400 : 120), { px: vertical ? 220 : 200, k: ease.out(inv(golpe + 0.04, golpe + 0.25, t)), rot: -0.1 });
  // caja de narrador: «EN CÓMIC»
  COMIC.cajaNarrador(g, ["EN CÓMIC"], V.x + 230, V.y + 70, { px: 64, k: inv(v(T.en) - antes, v(T.en) + 0.1, t) });
}

function plano(t) {
  P.dis(() => {
    FOCO.dibujar(g, PROMO.piel(t, dur), W / 2, H / 2, (g) => piel(t), { caja: [0, 0, W, H] });
    const b = pelota(t);
    g.save(); g.translate(b.x, b.y); g.scale(1 / b.sq, b.sq);
    MARCA.punto(g, 0, 0, b.r, { brillo: 0 });
    g.strokeStyle = TINTA; g.lineWidth = Math.max(3, b.r * 0.14); g.beginPath(); g.arc(0, 0, b.r, 0, Math.PI * 2); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.55)"; g.beginPath(); g.ellipse(-b.r * 0.35, -b.r * 0.38, b.r * 0.22, b.r * 0.13, -0.6, 0, Math.PI * 2); g.fill();
    g.restore();
    MARCA.rotulo(g, "Estilo · cómic", W / 2, vertical ? H - 200 : H - 60, { px: 26, alinear: "center", color: "#FFFFFF", a: inv(golpe, golpe + 0.15, t) * (1 - inv(dur - 0.25, dur, t)) });
  });
}
