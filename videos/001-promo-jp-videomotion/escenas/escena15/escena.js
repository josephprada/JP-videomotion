// Escena 15 · CIERRE (global 42,6833–48,6000) · marca JP
// «JP Video Motion, código abierto en GitHub.» (+ música con la URL fija)
// La firma completa (2,3 s) se escribe y despliega JOSEPH PRADA; debajo, JP-VIDEOMOTION, «código abierto · MIT» y la URL.
// El punto sube del paso al logo y se apaga dentro de él (la idea se vuelve la marca); reaparece como viñeta de la URL
// en «GitHub»: la idea termina donde empieza el repo. La URL queda fija 3,3 s.
const E = ESCENA.crear({ t0: 42.6833, dur: 5.9167 });
const { P, g, v } = E;
const { inv, ease, spring, lerp } = M;
const { C, F } = MARCA;
const T = { jp: 42.8, video: 42.96, motion: 43.38, codigo: 44.05, abierto: 44.54, github: 45.26, fin: 48.6 };
const antes = 0.08;
const W = P.W / P.ESC, H = P.H / P.ESC;
const vertical = H > W;
const PASO = PROMO.paso(W, H);
const URL = "github.com/josephprada/JP-videomotion";
const Y = vertical ? { firma: H * 0.36, titulo: H * 0.54, sub: H * 0.54 + 84, url: H * 0.665 } : { firma: H * 0.28, titulo: H * 0.55, sub: H * 0.55 + 70, url: H * 0.74 };
const pxT = vertical ? 132 : 150, pxU = vertical ? 38 : 40;

P.planos([[0, v(T.fin), plano]]);

function plano(t) {
  P.dis(() => {
    // firma completa: empieza con la escena, el logo se escribe mientras la voz dice «JP Video Motion»
    MARCA.firma(g, t - 0.05, { cx: W / 2, cy: Y.firma, ancho: vertical ? W * 0.76 : W * 0.46 });
    // JP-VIDEOMOTION
    FOCO.texto(g, [{ texto: "JP-VIDEOMOTION", t: v(T.motion) - antes }], t, W / 2, Y.titulo, { font: F.display(pxT), color: C.papel, dur: 0.4, blur: 18 });
    // código abierto · MIT
    MARCA.rotulo(g, "Código abierto · MIT", W / 2, Y.sub, { px: 26, alinear: "center", color: C.suave, a: inv(v(T.codigo) - antes, v(T.codigo) + 0.2, t), linea: ease.out(inv(v(T.abierto), v(T.abierto) + 0.5, t)) });
    // URL: entra en «GitHub» y queda fija hasta el final
    g.font = F.mono(pxU, 500); const wu = g.measureText(URL).width;
    const xu = W / 2 - wu / 2 + 20;
    const eu = FOCO.estado(t, { entra: v(T.github) - antes, dur: 0.35, blur: 14, dy: 14 });
    if (eu.a > 0) FOCO.dibujar(g, eu, W / 2, Y.url, (g) => {
      g.font = F.mono(pxU, 500); g.fillStyle = C.papel; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText(URL, xu, Y.url);
      g.fillStyle = C.lineaFuerte; g.fillRect(xu, Y.url + pxU * 0.9, wu, 2);
    }, { caja: [0, Y.url - 80, W, 160] });
    // el punto: del paso al centro del logo, donde se apaga; luego reaparece como viñeta de la URL
    const ida = ease.inOut(inv(0, 0.45, t));
    if (ida < 1) MARCA.punto(g, PASO.x, lerp(PASO.y, Y.firma, ida), PASO.r * (1 - ida), { brillo: 1 - ida });
    const vuelve = spring(t - (v(T.github) - antes), ...M.S.playful);
    if (vuelve > 0) MARCA.punto(g, xu - 36, Y.url, 11 * Math.min(1.3, vuelve), { brillo: 0.6 });
  });
}
