// Escena 4 · TERMINAL (global 8,4000–14,3500) · marca JP
// «tu agente de IA, convertido en estudio de video. Le dices nuevo video y arranca.»
// Titular arriba; una terminal escribe /jp-nuevo-video, salen las preguntas de la entrevista y el punto rojo salta del
// cursor al punto de paso: ahí empieza la ronda de estilos.
const E = ESCENA.crear({ t0: 8.4, dur: 5.95 });
const { P, g, v } = E;
const { inv, ease, spring, lerp } = M;
const { C, F } = MARCA;
const T = { tu: 8.48, agente: 8.7, de: 9.39, ia: 9.59, convertido: 9.96, en: 10.63, estudio: 10.76, de2: 11.21, video: 11.35,
  le: 11.72, dices: 11.93, nuevo: 12.44, video2: 13.44, arranca: 13.61, fin: 14.35 };
const antes = 0.08;
const W = P.W / P.ESC, H = P.H / P.ESC;
const vertical = H > W;
const SALE = v(T.fin) - 0.3;
const TERM = vertical ? { x: 70, y: 700, w: W - 140, h: 760 } : { x: W * 0.5, y: 200, w: W * 0.44, h: 680 };
const TIT = vertical ? { x: W / 2, y: 330, px: 112 } : { x: W * 0.25, y: 430, px: 112 };
const COMANDO = "/jp-nuevo-video";
const PREGUNTAS = ["¿De qué trata tu video?", "¿Qué estilo quieres?", "¿Para quién es?"];

P.planos([[0, v(T.fin), plano]]);

function titular(t) {
  FOCO.texto(g, [
    { texto: "TU", t: v(T.tu) - antes }, { texto: "AGENTE", t: v(T.agente) - antes },
    { texto: "DE", t: v(T.de) - antes }, { texto: "IA,", t: v(T.ia) - antes, color: C.rojo },
  ], t, TIT.x, TIT.y, { font: F.display(TIT.px), color: C.papel, sale: SALE, dur: 0.3 });
  const lin2 = [["convertido", T.convertido], ["en", T.en], ["estudio", T.estudio], ["de", T.de2], ["video.", T.video]];
  FOCO.texto(g, lin2.map(([texto, tt]) => ({ texto, t: v(tt) - antes })), t, TIT.x, TIT.y + 90,
    { font: F.texto(48), color: C.suave, sale: SALE, dur: 0.3 });
}

// posición del cursor tras escribir n caracteres (para que el punto salga de ahí)
function cursorEn(n) {
  g.font = F.mono(40);
  return { x: TERM.x + 92 + g.measureText(COMANDO.slice(0, n)).width + 6, y: TERM.y + 270 };
}

function terminal(t) {
  const e = FOCO.estado(t, { entra: v(T.tu) - 0.15, sale: SALE, dur: 0.3, blur: 16, dy: 24 });
  if (e.a <= 0) return;
  FOCO.dibujar(g, e, TERM.x + TERM.w / 2, TERM.y + TERM.h / 2, (g) => {
    const { x, y, w, h } = TERM;
    g.fillStyle = C.banda; g.fillRect(x, y, w, h);
    g.strokeStyle = C.linea; g.lineWidth = 1.5; g.strokeRect(x + 0.75, y + 0.75, w - 1.5, h - 1.5);
    // barra de título
    g.fillStyle = C.hundido; g.fillRect(x, y, w, 64);
    for (let i = 0; i < 3; i++) { g.strokeStyle = C.lineaFuerte; g.strokeRect(x + 26 + i * 26, y + 25, 14, 14); }
    g.font = F.mono(22); g.fillStyle = C.tenue; g.textAlign = "center"; g.textBaseline = "middle"; g.letterSpacing = "2px";
    g.fillText("claude — ~/mi-video", x + w / 2, y + 33); g.letterSpacing = "0px";
    // estado del estudio: dos líneas que salen mientras la voz presenta al agente
    g.textAlign = "left"; g.font = F.mono(26);
    const ESTADO = [["✓ jp doctor · todo listo", T.agente], ["✓ 6 estilos · 5 perfiles · 3 métodos", T.estudio]];
    ESTADO.forEach(([s, cuando], i) => {
      const n = Math.floor(s.length * inv(v(cuando) - antes, v(cuando) + 0.5, t));
      g.fillStyle = C.tenue; g.fillText(s.slice(0, n), x + 44, y + 120 + i * 50);
    });
    // línea de comando: se escribe carácter a carácter con la voz («nuevo video»)
    const n = Math.floor(COMANDO.length * inv(v(T.nuevo) - 0.25, v(T.video2) - 0.1, t));
    g.textAlign = "left"; g.font = F.mono(40); g.fillStyle = C.rojo; g.fillText("›", x + 44, y + 270);
    g.fillStyle = C.papel; g.fillText(COMANDO.slice(0, n), x + 92, y + 270);
    const enter = t >= v(T.arranca) - antes;
    if (!enter && Math.floor(t * 2.2) % 2 === 0) { const c = cursorEn(n); g.fillStyle = C.rojo; g.fillRect(c.x, c.y - 24, 20, 46); }
    // al dar enter: estado y preguntas de la entrevista, en tarjetas finas que entran enfocándose
    if (enter) {
      const k = inv(v(T.arranca) - antes, v(T.arranca) + 0.15, t);
      g.globalAlpha = k; MARCA.rotulo(g, "Entrevista · bloque 1 de 6", x + 44, y + 350, { px: 22, color: C.suave }); g.globalAlpha = 1;
      PREGUNTAS.forEach((p, i) => {
        const ep = FOCO.estado(t, { entra: v(T.arranca) + 0.05 + i * 0.1, dur: 0.28, blur: 12, dy: 16 });
        if (ep.a <= 0) return;
        const yy = y + 400 + i * 115;
        FOCO.dibujar(g, ep, x + w / 2, yy + 45, (g) => {
          g.strokeStyle = i === 0 ? C.rojo : C.lineaFuerte; g.lineWidth = 2; g.strokeRect(x + 44, yy, w - 88, 90);
          g.font = F.texto(36); g.fillStyle = i === 0 ? C.papel : C.suave; g.textBaseline = "middle"; g.fillText(p, x + 76, yy + 46);
        }, { caja: [x, yy - 40, w, 170] });
      });
    }
  }, { caja: [TERM.x - 60, TERM.y - 60, TERM.w + 120, TERM.h + 120] });
}

// el punto: nace en el cursor al dar enter y vuela al punto de paso (corte por coincidencia con la escena 5)
function punto(t) {
  const t0 = v(T.arranca) - antes;
  if (t < t0) return;
  const c = cursorEn(COMANDO.length), p = PROMO.paso(W, H);
  const k = spring(t - t0 - 0.12, ...M.S.base);
  const r = lerp(12, p.r, Math.min(1, spring(t - t0, ...M.S.snappy)));
  MARCA.punto(g, lerp(c.x + 10, p.x, k), lerp(c.y, p.y, k) - Math.sin(Math.min(1, k) * Math.PI) * 120, r);
}

function plano(t) {
  P.dis(() => { titular(t); terminal(t); punto(t); });
}
