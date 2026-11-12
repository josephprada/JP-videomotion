// Escena 13 · CÓDIGO (global 36,2000–40,2667) · marca JP
// «Todo dibujado en código, el mismo resultado, cuadro a cuadro.»
// Unas líneas de código reales del video, una tira de fotogramas que corre y se detiene cuadro a cuadro, el contador del
// cuadro actual (este video: 48,6 s × 60 fps = 2916 cuadros) y las pruebas del núcleo en verde (91/91).
const E = ESCENA.crear({ t0: 36.2, dur: 4.0667 });
const { P, g, v } = E;
const { inv, ease, spring, lerp } = M;
const { C, F } = MARCA;
const T = { todo: 36.3, dibujado: 36.58, en: 37.13, codigo: 37.27, el: 37.98, mismo: 38.02, resultado: 38.35, cuadro: 39.15, a: 39.65, cuadro2: 39.81, fin: 40.2667 };
const antes = 0.08;
const W = P.W / P.ESC, H = P.H / P.ESC;
const vertical = H > W;
const TOTAL = 2916;
const CODIGO = [
  ["const E = ESCENA.crear({ t0: 36.2, dur: 4.0667 });", C.suave],
  ["MARCA.punto(g, x, y, r);", C.papel],
  ["window.seek(t);  // cuadro exacto", C.rojo],
];
const K = vertical ? { x: 80, y: 420, w: W - 160 } : { x: 120, y: 300, w: 860 };
const TIRA = vertical ? { y: 940, h: 300 } : { y: 690, h: 250 };

P.planos([[0, v(T.fin), plano]]);

function codigo(t) {
  const e = FOCO.estado(t, { entra: v(T.en) - 0.2, dur: 0.3, blur: 12, dy: 16 });
  if (e.a <= 0) return;
  FOCO.dibujar(g, e, K.x + K.w / 2, K.y + 140, (g) => {
    g.fillStyle = C.banda; g.fillRect(K.x, K.y, K.w, 300); g.strokeStyle = C.linea; g.lineWidth = 1.5; g.strokeRect(K.x + 0.75, K.y + 0.75, K.w - 1.5, 298.5);
    g.font = F.mono(vertical ? 27 : 26); g.textAlign = "left"; g.textBaseline = "middle";
    CODIGO.forEach(([s, col], i) => {
      const n = Math.floor(s.length * inv(v(T.codigo) + i * 0.3, v(T.codigo) + i * 0.3 + 0.45, t));
      g.fillStyle = C.tenue; g.fillText(String(i + 1), K.x + 30, K.y + 70 + i * 80);
      g.fillStyle = col; g.fillText(s.slice(0, n), K.x + 80, K.y + 70 + i * 80);
    });
  }, { caja: [K.x - 40, K.y - 40, K.w + 80, 380] });
}

// tira de fotogramas: cada cuadro muestra el punto rebotando en un instante distinto; corre y luego avanza cuadro a cuadro
function tira(t) {
  const e = FOCO.estado(t, { entra: v(T.mismo) - 0.2, dur: 0.3, blur: 14 });
  if (e.a <= 0) return;
  const fw = TIRA.h * 0.75, gap = 22, paso = fw + gap;
  const fluido = t * 520, aCuadros = Math.floor(inv(v(T.cuadro) - antes, v(T.fin), t) * 4) * paso;
  const corre = t < v(T.cuadro) - antes ? fluido : (v(T.cuadro) - antes) * 520 + aCuadros;
  // los cuadros se alinean con el marco central cuando la tira se detiene (desp = 0)
  const desp = corre % paso, base = Math.floor(corre / paso), x0 = ((W / 2 - fw / 2) % paso) - paso;
  // numeración: el cuadro del centro es el cuadro global actual (el mismo del contador)
  const actual = Math.min(TOTAL, Math.floor((36.2 + t) * 60)), ic = Math.round((W / 2 - fw / 2 - x0 + desp) / paso);
  FOCO.dibujar(g, e, W / 2, TIRA.y + TIRA.h / 2, (g) => {
    g.fillStyle = C.hundido; g.fillRect(0, TIRA.y - 40, W, TIRA.h + 80);
    g.fillStyle = C.banda; for (let x = -desp; x < W; x += 44) { g.fillRect(x, TIRA.y - 28, 22, 14); g.fillRect(x, TIRA.y + TIRA.h + 14, 22, 14); }
    for (let i = 0; x0 + i * paso - desp < W; i++) {
      const x = x0 + i * paso - desp, n = base + i, ph = n * 0.11;
      g.fillStyle = C.ink; g.fillRect(x, TIRA.y, fw, TIRA.h);
      g.strokeStyle = C.linea; g.lineWidth = 1.5; g.strokeRect(x, TIRA.y, fw, TIRA.h);
      const salto = Math.abs(Math.sin(ph * 3)) * TIRA.h * 0.38;
      g.fillStyle = C.lineaFuerte; g.fillRect(x + 16, TIRA.y + TIRA.h * 0.82, fw - 32, 2);
      MARCA.punto(g, x + fw / 2, TIRA.y + TIRA.h * 0.82 - 16 - salto, 14, { brillo: 0 });
      g.font = F.mono(16); g.fillStyle = C.tenue; g.textAlign = "left"; g.textBaseline = "top"; g.fillText(String(actual + i - ic), x + 8, TIRA.y + 8);
    }
    // marco del cuadro actual al centro
    const cx = W / 2 - fw / 2 - 8;
    g.strokeStyle = C.rojo; g.lineWidth = 4; g.strokeRect(cx, TIRA.y - 10, fw + 16, TIRA.h + 20);
  }, { caja: [0, TIRA.y - 80, W, TIRA.h + 160] });
}

function plano(t) {
  P.dis(() => {
    FOCO.texto(g, [{ texto: "TODO", t: v(T.todo) - antes }, { texto: "DIBUJADO", t: v(T.dibujado) - antes }], t, W / 2, vertical ? 200 : 140,
      { font: F.display(vertical ? 104 : 90), color: C.papel, dur: 0.3 });
    FOCO.texto(g, [{ texto: "EN", t: v(T.en) - antes }, { texto: "CÓDIGO", t: v(T.codigo) - antes, color: C.rojo }], t, W / 2, vertical ? 310 : 240,
      { font: F.display(vertical ? 104 : 90), color: C.papel, dur: 0.3 });
    codigo(t);
    tira(t);
    // contador del cuadro global y pruebas del núcleo
    const yC = vertical ? 1400 : 1000;
    const ec = FOCO.estado(t, { entra: v(T.resultado) - antes, dur: 0.3, blur: 12, dy: 14 });
    if (ec.a > 0) FOCO.dibujar(g, ec, W / 2, yC, (g) => {
      const n = Math.min(TOTAL, Math.floor((36.2 + t) * 60));
      g.font = F.mono(vertical ? 44 : 34); g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = C.papel;
      g.fillText(`CUADRO ${String(n).padStart(4, "0")} / ${TOTAL}`, W / 2, yC);
      MARCA.rotulo(g, "91/91 pruebas del núcleo ✓", W / 2, yC + 90, { px: 26, alinear: "center", color: C.suave });
    }, { caja: [0, yC - 80, W, 220] });
  });
}
