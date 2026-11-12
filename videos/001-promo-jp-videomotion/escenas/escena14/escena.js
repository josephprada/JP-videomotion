// Escena 14 · TODOS LOS ESTILOS (global 40,2667–42,6833) · marca JP
// «Una idea, todos los estilos.»
// Las seis pieles entran en mosaico, cada una con su punto; en «estilos» se recogen al centro y queda un solo punto.
const E = ESCENA.crear({ t0: 40.2667, dur: 2.4166 });
const { P, g, v } = E;
const { inv, ease, spring, lerp } = M;
const { C, F } = MARCA;
const T = { una: 40.36, idea: 40.63, todos: 41.17, los: 41.55, estilos: 42.08, fin: 42.6833 };
const antes = 0.08;
const W = P.W / P.ESC, H = P.H / P.ESC;
const vertical = H > W;
const PASO = PROMO.paso(W, H);
const cols = vertical ? 2 : 3, filas = vertical ? 3 : 2;
const tw = vertical ? 440 : 500, th = vertical ? 250 : 270, gx = 40, gy = 36;
const ox = W / 2 - (cols * tw + (cols - 1) * gx) / 2, oy = PASO.y - (filas * th + (filas - 1) * gy) / 2;

P.planos([[0, v(T.fin), plano]]);

function plano(t) {
  P.dis(() => {
    // el mosaico completo se sostiene un instante con «ESTILOS.» y luego se recoge al centro
    const junta = ease.inOut(inv(v(T.estilos) + 0.12, v(T.fin) - 0.03, t));
    FOCO.texto(g, [{ texto: "UNA", t: v(T.una) - antes }, { texto: "IDEA.", t: v(T.idea) - antes }], t, W / 2, vertical ? oy - 90 : oy - 50,
      { font: F.display(vertical ? 120 : 96), color: C.papel, dur: 0.3 });
    FOCO.texto(g, [{ texto: "TODOS", t: v(T.todos) - antes }, { texto: "LOS", t: v(T.los) - antes }, { texto: "ESTILOS.", t: v(T.estilos) - antes, color: C.rojo }],
      t, W / 2, oy + filas * th + (filas - 1) * gy + (vertical ? 170 : 110), { font: F.display(vertical ? 120 : 96), color: C.papel, dur: 0.3 });
    for (let i = 0; i < 6; i++) {
      const c = i % cols, f = Math.floor(i / cols);
      const x = ox + c * (tw + gx), y = oy + f * (th + gy);
      const entra = spring(t - (v(T.una) - antes) - i * 0.07, ...M.S.snappy);
      if (entra <= 0) continue;
      // al juntarse: cada miniatura viaja al centro y se encoge; su punto se funde con el punto de paso
      const cx = lerp(x + tw / 2, PASO.x, junta), cy = lerp(y + th / 2, PASO.y, junta), s = lerp(Math.min(1.05, entra), 0.08, junta);
      g.save(); g.globalAlpha = 1 - junta * 0.9;
      g.translate(cx, cy); g.scale(s, s); g.translate(-tw / 2, -th / 2);
      PROMO.miniatura(g, i, 0, 0, tw, th, t);
      g.strokeStyle = C.linea; g.lineWidth = 2; g.strokeRect(0, 0, tw, th);
      g.restore();
      const k = inv(v(T.idea), v(T.idea) + 0.2, t) * (1 - inv(v(T.estilos) + 0.12, v(T.estilos) + 0.22, t));
      if (k > 0) MARCA.rotulo(g, PROMO.PIELES[i], x + 4, y + th + 18, { px: 16, color: C.suave, a: k });
    }
    if (junta > 0) MARCA.punto(g, PASO.x, PASO.y, PASO.r * junta, { brillo: junta });
  });
}
