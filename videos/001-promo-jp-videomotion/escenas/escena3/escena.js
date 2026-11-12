// Escena 3 · MARCA (global 5,7000–8,4000) · marca JP
// «Ahora sí, JP Video Motion,»
// La firma escribe el logo JP (0,8 s) y termina justo en «JP»; debajo, JP-VIDEOMOTION entra palabra a palabra con la voz.
const E = ESCENA.crear({ t0: 5.7, dur: 2.7 });
const { P, g, v } = E;
const { inv, ease, spring, lerp } = M;
const { C, F } = MARCA;
const T = { ahora: 5.88, si: 6.42, jp: 6.84, video: 7.04, motion: 7.6, fin: 8.4 };
const antes = 0.08;
const W = P.W / P.ESC, H = P.H / P.ESC;
const vertical = H > W;
const px = vertical ? 132 : 170;
const inicioFirma = T.jp - 0.8;   // el logo queda escrito justo cuando la voz dice «JP»

P.planos([[0, v(T.fin), plano]]);

function plano(t) {
  P.dis(() => {
    // «AHORA SÍ» chico, se va cuando aparece el logo
    FOCO.texto(g, [{ texto: "AHORA", t: v(T.ahora) - antes }, { texto: "SÍ.", t: v(T.si) - antes, color: C.rojo }], t, W / 2, H * 0.25,
      { font: F.mono(40), color: C.suave, sale: v(T.jp), dur: 0.3 });

    // logo: se escribe al centro y sube un poco con resorte cuando entra el nombre
    const sube = spring(t - (v(T.jp) + 0.05), ...M.S.heavy);
    const alto = lerp(vertical ? 330 : 300, vertical ? 250 : 230, sube);
    const y = lerp(H * 0.46, H * 0.4, sube);
    MARCA.firma(g, t - v(inicioFirma), { cx: W / 2, cy: y, alto, modo: "logo" });
    // destello al cerrarse el logo
    const d = inv(v(T.jp), v(T.jp) + 0.35, t);
    if (d > 0 && d < 1) {
      g.save(); g.globalAlpha = (1 - d) * 0.5; g.strokeStyle = C.rojo; g.lineWidth = 3;
      g.beginPath(); g.arc(W / 2, y, alto * (0.6 + d * 0.9), 0, Math.PI * 2); g.stroke(); g.restore();
    }

    // JP-VIDEOMOTION palabra a palabra (sin espacios: es una sola marca)
    const yT = H * 0.4 + 30 + (vertical ? 250 : 230) * 0.5 + px * 1.15;
    FOCO.texto(g, [
      { texto: "JP-", t: v(T.jp) - antes }, { texto: "VIDEO", t: v(T.video) - antes }, { texto: "MOTION", t: v(T.motion) - antes },
    ], t, W / 2, yT, { font: F.display(px), color: C.papel, espacio: 0, dur: 0.3, blur: 14 });
    // línea fina que se dibuja bajo el nombre al cerrar «Motion»
    const k = ease.out(inv(v(T.motion) + 0.1, v(T.motion) + 0.6, t));
    if (k > 0) {
      g.font = F.display(px); const w = g.measureText("JP-VIDEOMOTION").width;
      g.fillStyle = C.lineaFuerte; g.fillRect(W / 2 - w / 2, yT + 34, w * k, 2);
      MARCA.punto(g, W / 2 - w / 2 + w * k, yT + 35, 7, { brillo: 0.6 });
    }
  });
}
