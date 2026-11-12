// Escena 5 · TARJETAS (global 14,3500–16,8000) · piel: estilo tarjetas
// «La misma idea en tarjetas,»
// El punto llega desde el centro y se vuelve la insignia de una tarjeta; un contador cuenta los estilos del repo (6).
const E = ESCENA.crear({ t0: 14.35, dur: 2.45 });
const { P, g, v } = E;
const { inv, ease } = M;
const C = ESTILO.color, F = ESTILO.fuente;
const T = { la: 14.49, misma: 14.66, idea: 15.31, en: 15.83, tarjetas: 16.37, fin: 16.8 };
const antes = 0.08;
const W = P.W / P.ESC, H = P.H / P.ESC;
const vertical = H > W;
const dur = v(T.fin);
const CARD = vertical ? { x: 110, y: 640, w: W - 220, h: 560 } : { x: W / 2 - 420, y: 300, w: 840, h: 500 };
const BADGE = { x: CARD.x + CARD.w - 70, y: CARD.y + 70, r: 30 };

P.planos([[0, dur, plano]]);

function piel(t) {
  ESTILO.limpio = 0;
  ESTILO.fondo(g, W, H, t);
  // título karaoke: sans + la palabra clave en serif itálica
  FOCO.texto(g, [
    { texto: "La", t: v(T.la) - antes }, { texto: "misma", t: v(T.misma) - antes }, { texto: "idea", t: v(T.idea) - antes, font: "italic 96px 'Instrument Serif'" },
  ], t, W / 2, vertical ? H * 0.22 : H * 0.17, { font: "600 80px Inter", color: "#FFFFFF", dur: 0.35 });
  // tarjeta que entra enfocándose con su contador
  const e = FOCO.estado(t, { entra: v(T.la), dur: 0.4, blur: 20, dy: 26 });
  FOCO.dibujar(g, e, CARD.x + CARD.w / 2, CARD.y + CARD.h / 2, (g) => {
    UI.tarjeta(g, CARD.x, CARD.y, CARD.w, CARD.h, {
      brillo: `rgba(185,166,255,${inv(v(T.tarjetas) - 0.2, v(T.tarjetas) + 0.2, t)})`, anchoBorde: 5,
      contenido: (g) => {
        const fr = g.createLinearGradient(0, CARD.y, 0, CARD.y + 140); fr.addColorStop(0, "#EEF3FF"); fr.addColorStop(1, "#FFFFFF");
        g.fillStyle = fr; g.fillRect(CARD.x, CARD.y, CARD.w, 140);
        UI.digitos(g, UI.contador(t, v(T.misma), 1.2, 0, 6), 2, CARD.x + CARD.w / 2, CARD.y + CARD.h * 0.47, { font: "800 150px Inter", color: C.tinta, fondo: "#F1F4FC", ancho: 130, alto: 190 });
        g.fillStyle = C.suave; g.font = "600 40px Inter"; g.textAlign = "center"; g.textBaseline = "alphabetic";
        g.fillText("estilos listos para usar", CARD.x + CARD.w / 2, CARD.y + CARD.h - 70);
      },
    });
    UI.insignia(g, "JP-videomotion", CARD.x + 170, CARD.y, { font: "600 28px Inter", color: C.tinta });
  }, { caja: [CARD.x - 140, CARD.y - 200, CARD.w + 280, CARD.h + 360] });
  if (t > v(T.tarjetas) - 0.2) UI.dibujarOnda(g, BADGE.x, BADGE.y, 120, t, v(T.tarjetas) - 0.1);
  MARCA.rotulo(g, "Estilo · tarjetas", W / 2, vertical ? H * 0.82 : H * 0.88, { px: 30, alinear: "center", color: "#FFFFFF", a: inv(v(T.tarjetas) - antes, v(T.tarjetas) + 0.1, t) });
}

function plano(t) {
  P.dis(() => {
    FOCO.dibujar(g, PROMO.piel(t, dur), W / 2, H / 2, (g) => piel(t), { caja: [0, 0, W, H] });
    const p = PROMO.viaje(t, dur, BADGE, { llega: 0.05 }, W, H);
    MARCA.punto(g, p.x, p.y, p.r, { brillo: 0.5 });
  });
}
