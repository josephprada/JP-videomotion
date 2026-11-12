// Escena 2 · PROBLEMA (global 1,4833–5,7000) · marca JP
// «pero no tienes un estudio, ni un editor, ni semanas.»
// Una línea de tiempo de editor se llena de clips, se enreda y se desarma; ESTUDIO, EDITOR y SEMANAS se tachan en rojo.
const E = ESCENA.crear({ t0: 1.4833, dur: 4.2167 });
const { P, g, v } = E;
const { inv, ease, spring, lerp, rng } = M;
const { C, F } = MARCA;
const T = { pero: 1.72, estudio: 2.79, editor: 3.87, semanas: 4.86, desarma: 5.12, fin: 5.7 };
const antes = 0.08;

const W = P.W / P.ESC, H = P.H / P.ESC;
const vertical = H > W;
// zona de la línea de tiempo y de las palabras según el formato
const TL = vertical ? { x: 70, y: 260, w: W - 140, h: 540 } : { x: 110, y: 250, w: W * 0.5, h: 580 };
const PAL = vertical ? { x: 90, y: 1160, paso: 215, px: 196 } : { x: W * 0.62, y: 430, paso: 190, px: 170 };
const PISTAS = 5;

// clips: cada uno aparece en su momento (cada vez más seguidos) en una pista; color de clip apagado, uno rojo
const CLIPS = (() => {
  const r = rng(7), a = []; let t = T.pero - 0.1;
  for (let i = 0; i < 34; i++) {
    t += lerp(0.2, 0.05, i / 34) + r() * 0.04;
    a.push({ t, pista: Math.floor(r() * PISTAS), x: r() * 0.85, w: 0.06 + r() * 0.18, tono: r(), rojo: i % 9 === 4 });
  }
  return a;
})();

P.planos([[0, v(T.fin), plano]]);

function lineaDeTiempo(t) {
  const { x, y, w, h } = TL, alto = h / (PISTAS + 1);
  const desarma = ease.in(inv(v(T.desarma), v(T.desarma) + 0.5, t));
  // panel y regla
  g.fillStyle = C.banda; g.fillRect(x, y, w, h);
  g.strokeStyle = C.linea; g.lineWidth = 1.5; g.strokeRect(x + 0.75, y + 0.75, w - 1.5, h - 1.5);
  g.fillStyle = C.tenue;
  for (let i = 0; i <= 40; i++) { const xx = x + 20 + (w - 40) * i / 40; g.fillRect(xx, y + 18, 1.5, i % 5 ? 10 : 22); }
  rotulo(t, x, y);
  // pistas
  for (let p = 0; p < PISTAS; p++) { g.fillStyle = "rgba(242,239,233,0.035)"; g.fillRect(x + 20, y + alto * (p + 1) + 6, w - 40, alto - 12); }
  // clips que aparecen con resorte, tiemblan cuando se acumulan y se caen al desarmarse
  const nervio = inv(v(T.semanas) - 0.6, v(T.desarma), t);
  CLIPS.forEach((c, i) => {
    const k = spring(t - v(c.t), ...M.S.snappy);
    if (k <= 0) return;
    const cx = x + 20 + (w - 40) * c.x, cw = (w - 40) * c.w, cy = y + alto * (c.pista + 1) + 10;
    const tiembla = nervio * 7 * Math.sin(t * 61 + i * 3.1);
    const cae = desarma * (300 + (i % 7) * 80), gira = desarma * ((i % 2 ? 1 : -1) * 0.4);
    g.save();
    g.translate(cx + cw / 2 + tiembla, cy + (alto - 20) / 2 + cae); g.rotate(gira); g.scale(lerp(0.4, 1, Math.min(1, k)), 1);
    g.globalAlpha = 1 - desarma;
    g.fillStyle = c.rojo ? C.rojo : `rgba(242,239,233,${0.18 + c.tono * 0.22})`;
    // al desarmarse, el clip se adelgaza hasta ser una línea fina
    const ch = lerp(alto - 20, 2, desarma);
    g.fillRect(-cw / 2, -ch / 2, cw, ch);
    g.restore();
  });
  // cabezal rojo que recorre la línea, cada vez más rápido
  const u = inv(v(T.pero), v(T.desarma), t);
  const ph = x + 20 + (w - 40) * ((u * u * 3.2) % 1);
  g.globalAlpha = 1 - desarma; g.fillStyle = C.rojo; g.fillRect(ph - 1.5, y + 12, 3, h - 24);
  g.beginPath(); g.moveTo(ph - 10, y + 12); g.lineTo(ph + 10, y + 12); g.lineTo(ph, y + 26); g.fill(); g.globalAlpha = 1;
}
function rotulo(t, x, y) {
  MARCA.rotulo(g, "sin_titulo_final_v7.prproj", x, y - 36, { px: 20, color: C.tenue, a: inv(v(T.pero) - 0.3, v(T.pero), t) });
}

function palabra(t, texto, cuando, i) {
  const y = PAL.y + PAL.paso * i;
  const e = FOCO.estado(t, { entra: v(cuando) - antes, dur: 0.3, blur: 16, dy: 18 });
  if (e.a <= 0) return;
  FOCO.dibujar(g, e, PAL.x + 300, y - PAL.px * 0.35, (g) => {
    g.font = F.display(PAL.px); g.fillStyle = C.papel; g.textAlign = "left"; g.textBaseline = "alphabetic";
    g.fillText(texto, PAL.x, y);
  }, { caja: [PAL.x - 40, y - PAL.px - 40, W, PAL.px + 80] });
  // tachón rojo a mano alzada, de izquierda a derecha
  g.font = F.display(PAL.px);
  const w = g.measureText(texto).width, k = ease.out(inv(v(cuando) + 0.28, v(cuando) + 0.52, t));
  if (k > 0) {
    g.save(); g.strokeStyle = C.rojo; g.lineWidth = PAL.px * 0.11; g.lineCap = "butt";
    const y0 = y - PAL.px * 0.36 + 8, y1 = y - PAL.px * 0.4 - 6;
    g.beginPath(); g.moveTo(PAL.x - 16, y0); g.lineTo(PAL.x - 16 + (w + 32) * k, lerp(y0, y1, k)); g.stroke(); g.restore();
  }
}

function plano(t) {
  P.dis(() => {
    lineaDeTiempo(t);
    MARCA.rotulo(g, "No tienes", PAL.x, PAL.y - PAL.px - 70, { px: 24, color: C.suave, a: inv(v(T.pero), v(T.pero) + 0.25, t) });
    palabra(t, "ESTUDIO", T.estudio, 0);
    palabra(t, "EDITOR", T.editor, 1);
    palabra(t, "SEMANAS", T.semanas, 2);
  });
}
