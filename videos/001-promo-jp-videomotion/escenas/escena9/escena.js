// Escena 9 · PLANO (global 24,1000–25,8833) · piel: estilo plano, con la persona de universos/_ejemplo
// «con personajes,»
// La persona camina hacia la cámara sujetando el punto como un globo, con el brazo alzado; la ciudad plana queda detrás.
// Agarre por capas: el cordel pasa por detrás de los dedos (puño) y sale por arriba de la mano.
const E = ESCENA.crear({ t0: 24.1, dur: 1.7833 });
const { P, g, v, pj } = E;
const { inv, ease, lerp } = M;
const T = { con: 24.52, personajes: 24.91, fin: 25.8833 };
const antes = 0.08;
const W = P.W / P.ESC, H = P.H / P.ESC;
const vertical = H > W;
const dur = v(T.fin);
const PASO = PROMO.paso(W, H);
const ALTO = vertical ? 800 : 560, s = ALTO / 1000;
const MANO = [150, 40];                                    // mano derecha alzada sobre la cabeza (espacio del cuerpo)
const CORDEL = vertical ? 150 : 110;
const SUELO = PASO.y + CORDEL + (1000 - MANO[1]) * s;      // la mano queda justo debajo del globo
const X = PASO.x - MANO[0] * s;

P.planos([[0, dur, plano]]);

function ciudad(t) {
  // edificios planos detrás; las líneas del suelo bajan: la persona avanza hacia la cámara
  const d1 = 0, d2 = (t * 90) % 60;
  g.fillStyle = "#3A2C78";
  for (let i = -1; i < 8; i++) { const x = i * 240 - d1, h = 220 + ((i * 97) % 5) * 60; g.fillRect(x, SUELO - h, 170, h); }
  g.fillStyle = "#4A3A92";
  for (let i = -1; i < 8; i++) { const x = i * 240 - d1 + 30; for (let k = 0; k < 4; k++) g.fillRect(x + 22 + (k % 2) * 70, SUELO - 180 - Math.floor(k / 2) * 70 - ((i * 97) % 5) * 40, 40, 36); }
  g.fillStyle = "#3D2E7C"; g.fillRect(0, SUELO, W, H - SUELO);
  g.fillStyle = "#4F3F9A"; for (let i = 0; i < 3; i++) g.fillRect(0, SUELO + 14 + i * 60 + d2, W, 6);
}

function piel(t) {
  g.fillStyle = ESTILO.fondo; g.fillRect(0, 0, W, H);
  ciudad(t);
  FOCO.texto(g, [{ texto: "CON", t: v(T.con) - antes }, { texto: "PERSONAJES", t: v(T.personajes) - antes }], t, W / 2, vertical ? H * 0.2 : H * 0.16,
    { font: "800 86px Montserrat", color: "#FFFFFF", dur: 0.3 });
}

function persona(t, globo) {
  const tp = pj(t);
  const pose = RIG.caminar(PERSONA.SPEC, tp * 1.7);
  PERSONA.draw(g, {
    ...pose, x: X, y: SUELO, alto: ALTO,
    manoD: MANO, tipoD: "puno", codoAbajoD: true,
    cabeza: { expr: "feliz", mirada: [0.25, -0.8], rot: -4 },
  });
  // cordel: de la mano al globo, con una curva que se mece; va por delante del puño (sale entre los dedos)
  const hx = X + MANO[0] * s, hy = SUELO + (MANO[1] - 1000) * s;
  g.save(); g.strokeStyle = "#F2EFE9"; g.lineWidth = 3; g.globalAlpha = 1 - inv(dur - 0.3, dur - 0.1, t);
  g.beginPath(); g.moveTo(hx, hy - 12); g.quadraticCurveTo(hx + 30 * Math.sin(t * 3), (hy + globo.y) / 2, globo.x, globo.y + globo.r); g.stroke(); g.restore();
}

function plano(t) {
  P.dis(() => {
    const e = PROMO.piel(t, dur);
    // el globo: se mece sobre el paso y regresa exacto al final
    const meceX = Math.sin(t * 2.6) * 18 * (1 - inv(dur - 0.3, dur, t)), meceY = Math.cos(t * 2.1) * 10 * (1 - inv(dur - 0.3, dur, t));
    const r = lerp(lerp(PASO.r, 64, ease.out(inv(0, 0.35, t))), PASO.r, ease.inOut(inv(dur - 0.3, dur, t)));
    const globo = { x: PASO.x + meceX, y: PASO.y + meceY, r };
    FOCO.dibujar(g, e, W / 2, H / 2, (g) => { piel(t); persona(t, globo); }, { caja: [0, 0, W, H] });
    MARCA.punto(g, globo.x, globo.y, globo.r, { brillo: 0.6 });
    g.fillStyle = "rgba(255,255,255,0.35)"; g.beginPath(); g.ellipse(globo.x - r * 0.35, globo.y - r * 0.4, r * 0.2, r * 0.12, -0.6, 0, Math.PI * 2); g.fill();
    MARCA.rotulo(g, "Estilo · plano", W / 2, vertical ? H * 0.2 + 80 : H * 0.16 + 70, { px: 26, alinear: "center", color: "#FFFFFF", a: inv(v(T.personajes), v(T.personajes) + 0.15, t) * (1 - inv(dur - 0.25, dur, t)) });
  });
}
