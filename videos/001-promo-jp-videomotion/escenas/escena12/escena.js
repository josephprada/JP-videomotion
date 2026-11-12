// Escena 12 · FORMATOS (global 33,3000–36,2000) · marca JP
// «del mismo proyecto, horizontal y vertical.»
// La misma mini escena corre a la vez en un cuadro 16:9 y en uno 9:16: el texto se reacomoda, el movimiento es el mismo.
const E = ESCENA.crear({ t0: 33.3, dur: 2.9 });
const { P, g, v } = E;
const { inv, ease, spring } = M;
const { C, F } = MARCA;
const T = { del: 33.36, mismo: 33.48, proyecto: 33.88, horizontal: 34.68, y: 35.48, vertical: 35.56, fin: 36.2 };
const antes = 0.08;
const W = P.W / P.ESC, H = P.H / P.ESC;
const vertical = H > W;
const A = vertical ? { x: 90, y: 330, w: W - 180, h: (W - 180) * 9 / 16 } : { x: 130, y: 300, w: 960, h: 540 };
const B = vertical ? { x: W / 2 - 200, y: A.y + A.h + 150, w: 400, h: 400 * 16 / 9 } : { x: 1320, y: 240, w: 420, h: 420 * 16 / 9 };

P.planos([[0, v(T.fin), plano]]);

// mini escena: mismo tiempo, misma idea; el texto se reacomoda según la forma del cuadro
function mini(x, y, w, h, t) {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.fillStyle = C.ink; g.fillRect(x, y, w, h);
  const ancho = w > h, u = Math.min(w, h);
  const salto = Math.abs(Math.sin(t * 4.2)) * u * 0.14;
  g.font = F.display(Math.round(u * (ancho ? 0.22 : 0.2))); g.fillStyle = C.papel; g.textBaseline = "alphabetic";
  if (ancho) {
    g.textAlign = "left"; const tx = x + w * 0.14, ty = y + h * 0.62;
    g.fillText("UNA IDEA", tx, ty);
    MARCA.punto(g, tx + g.measureText("UNA IDEA").width + u * 0.07, ty - u * 0.04 - salto, u * 0.035, { brillo: 0.5 });
  } else {
    g.textAlign = "center"; const ty = y + h * 0.5;
    g.fillText("UNA", x + w / 2, ty); g.fillText("IDEA", x + w / 2, ty + u * 0.22);
    MARCA.punto(g, x + w / 2 + g.measureText("IDEA").width / 2 + u * 0.07, ty + u * 0.18 - salto, u * 0.035, { brillo: 0.5 });
  }
  g.restore();
}

function cuadro(t, R, nombre, entra, enciende) {
  const e = FOCO.estado(t, { entra: v(entra) - antes, dur: 0.35, blur: 16, dy: 22 });
  if (e.a <= 0) return;
  const k = inv(v(enciende) - antes, v(enciende) + 0.1, t);
  FOCO.dibujar(g, e, R.x + R.w / 2, R.y + R.h / 2, (g) => {
    mini(R.x, R.y, R.w, R.h, t);
    g.strokeStyle = k > 0.5 ? C.rojo : C.lineaFuerte; g.lineWidth = k > 0.5 ? 4 : 2; g.strokeRect(R.x, R.y, R.w, R.h);
    MARCA.rotulo(g, nombre, R.x, R.y - 34, { px: 24, color: k > 0.5 ? C.papel : C.tenue });
  }, { caja: [R.x - 60, R.y - 90, R.w + 120, R.h + 150] });
}

function plano(t) {
  P.dis(() => {
    FOCO.texto(g, [{ texto: "DEL", t: v(T.del) - antes }, { texto: "MISMO", t: v(T.mismo) - antes }, { texto: "PROYECTO", t: v(T.proyecto) - antes }],
      t, W / 2, vertical ? 200 : 110, { font: F.display(vertical ? 96 : 84), color: C.papel, dur: 0.3 });
    cuadro(t, A, "16:9 · horizontal", T.mismo, T.horizontal);
    cuadro(t, B, "9:16 · vertical", T.proyecto, T.vertical);
  });
}
