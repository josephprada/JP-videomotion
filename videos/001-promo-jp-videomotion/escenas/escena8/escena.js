// Escena 8 · CAPAS (global 21,0667–24,1000) · piel: estilo capas (2.5D)
// «en capas, con profundidad,»
// El punto es el sol (infinito: no se mueve con la cámara); cordilleras con perspectiva atmosférica, niebla, lago con
// reflejo y un primer plano desenfocado; la cámara avanza y en «profundidad» empuja un poco más.
const E = ESCENA.crear({ t0: 21.0667, dur: 3.0333 });
const { P, g, v } = E;
const { inv, ease, spring, rng } = M;
const C = ESTILO.color;
const T = { en: 21.54, capas: 21.7, con: 22.59, profundidad: 22.9, fin: 24.1 };
const antes = 0.08;
const W = P.W / P.ESC, H = P.H / P.ESC;
const vertical = H > W;
const dur = v(T.fin);
const PASO = PROMO.paso(W, H);

// el paisaje está diseñado en 1080 de ancho (9:16); en 16:9 se escala al ancho y se alinea por el horizonte
const AGUA = 1180;
const s = vertical ? 1 : W / 1500, ox = vertical ? 0 : (W - 1080 * s) / 2, oy = vertical ? 110 : H * 0.66 - AGUA * s;
const LEJOS = CAPAS.perfil(1, -260, 1340, 900, 240, { escala: 300, octavas: 4, rugosidad: 0.55 });
const MEDIO = CAPAS.perfil(2, -260, 1340, 1040, 120, { escala: 240, octavas: 4 });
const COLINA = CAPAS.perfil(3, -320, 1400, 1135, 34, { escala: 260 });
const PRADO = CAPAS.perfil(5, -360, 1440, 1430, 26, { escala: 340 });
const yEn = (pts, x) => { const i = Math.max(0, Math.min(pts.length - 2, Math.floor((x - pts[0][0]) / (pts[1][0] - pts[0][0])))); return pts[i][1]; };
const ARBOLES = (() => { const r = rng(21), a = []; for (let x = -280; x < 1380; x += 46 + r() * 70) a.push({ x, alto: 70 + r() * 70, pino: r() < 0.45 }); return a; })();
const FLORES = (() => { const r = rng(33), a = []; for (let i = 0; i < 60; i++) { const x = -200 + r() * 1480; a.push({ x, y: yEn(PRADO, x) + 30 + Math.pow(r(), 0.7) * 480, r: 9 + r() * 14, c: C.flores[Math.floor(r() * C.flores.length)], d: r() * 0.9 }); } return a.sort((p, q) => p.y - q.y); })();
const BRIZNAS = (() => { const r = rng(44), a = []; for (let x = -160; x < 1240; x += 24 + r() * 28) { const borde = Math.min(1, Math.abs(x - 540) / 600); a.push({ x, alto: 260 + borde * borde * 620 + r() * 200, ancho: 16 + borde * 22 + r() * 10, curva: (r() - 0.5) * 120 + (x < 540 ? 40 : -40) * borde, tono: r() }); } return a; })();

P.planos([[0, dur, plano]]);

// cielo del estilo sin su sol crema: aquí el sol es el punto rojo, y el halo se centra en él
function cielo(g, w, h, sol = PASO) {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, C.cieloA); gr.addColorStop(ESTILO.horizonte * 0.92, C.cieloB); gr.addColorStop(ESTILO.horizonte * 1.02, C.cieloB); gr.addColorStop(1, C.agua);
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const halo = g.createRadialGradient(sol.x, sol.y, 0, sol.x, sol.y, w * 0.75);
  halo.addColorStop(0, "rgba(255,170,140,0.5)"); halo.addColorStop(0.25, "rgba(255,150,120,0.16)"); halo.addColorStop(1, "rgba(255,150,120,0)");
  g.fillStyle = halo; g.fillRect(0, 0, w, h);
}

const lejos = (g) => CAPAS.cordillera(g, LEJOS, CAPAS.atmosfera(C.monte, C.niebla, 0.62), AGUA + 90);
const medio = (g) => CAPAS.cordillera(g, MEDIO, CAPAS.atmosfera(C.monte, C.niebla, 0.32), AGUA + 90);
function colinas(g, t) {
  CAPAS.cordillera(g, COLINA, CAPAS.atmosfera(C.colina, C.niebla, 0.18), AGUA + 90);
  for (const a of ARBOLES) CAPAS.arbol(g, a.x, yEn(COLINA, a.x) + 14, a.alto, {
    tipo: a.pino ? "pino" : "redondo", copa: CAPAS.atmosfera(C.copa, C.niebla, 0.14), luz: CAPAS.atmosfera(C.copaLuz, C.niebla, 0.1),
    tronco: C.tronco, vaiven: CAPAS.vaiven(t, a.x, { amp: 3 }),
  });
}
function flor(g, x, y, r, c, k, dx) {
  if (k <= 0.01) return;
  const alto = r * 3.2 * k;
  g.strokeStyle = C.pasto; g.lineWidth = Math.max(1.5, r * 0.18); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + dx * 0.3, y - alto * 0.5, x + dx, y - alto); g.stroke();
  g.save(); g.translate(x + dx, y - alto); g.scale(k, k); g.fillStyle = c;
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; g.beginPath(); g.ellipse(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.55, r * 0.38, a, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = "#FFE08A"; g.beginPath(); g.arc(0, 0, r * 0.32, 0, Math.PI * 2); g.fill(); g.restore();
}

function piel(t) {
  cielo(g, W, H);
  // halo cálido del sol rojo y rayos (fijos: el sol está en el infinito)
  CAPAS.rayos(g, PASO.x, PASO.y, t, { color: C.luz, a: 0.09 });
  const k = ease.inOut(inv(0, dur, t)) + 0.6 * ease.inOut(inv(v(T.profundidad), v(T.profundidad) + 0.9, t));
  const cam = { x: 50 * k, y: 0, z: 1 + 0.08 * k };
  g.save(); g.translate(ox, oy); g.scale(s, s);
  const D = g.getTransform();
  CAPAS.capa(g, cam, 0.06, lejos);
  CAPAS.capa(g, cam, 0.18, medio);
  CAPAS.capa(g, cam, 0.26, (g) => CAPAS.niebla(g, 1100, 120, t, { color: "236,200,220", a: 0.38 }));
  CAPAS.capa(g, cam, 0.4, (g) => colinas(g, t));
  CAPAS.capa(g, cam, 0.5, (g) => CAPAS.reflejo(g, AGUA, 300, (a) => {
    a.save(); a.setTransform(D); cielo(a, 1080, 1920, { x: (PASO.x - ox) / s, y: (PASO.y - oy) / s });
    CAPAS.capa(a, cam, 0.06, lejos); CAPAS.capa(a, cam, 0.18, medio); CAPAS.capa(a, cam, 0.4, (a) => colinas(a, t)); a.restore();
  }, { t, onda: 4 }));
  CAPAS.capa(g, cam, 0.75, (g) => {
    const gr = g.createLinearGradient(0, 1400, 0, 2000);
    gr.addColorStop(0, C.pradera); gr.addColorStop(1, C.pasto);
    CAPAS.cordillera(g, PRADO, gr, 2300);
    for (const f of FLORES) flor(g, f.x, f.y, f.r, f.c, spring(t - v(T.profundidad) - f.d * 0.5 - (f.x + 200) / 1480 * 0.4, ...M.S.playful), CAPAS.vaiven(t, f.x, { amp: 5 }));
  });
  CAPAS.capa(g, cam, 1.35, (g) => {
    for (const b of BRIZNAS) {
      const dx = b.curva + CAPAS.vaiven(t, b.x, { amp: 14 }), y0 = 2100, yt = y0 - b.alto, w = b.ancho;
      g.fillStyle = CAPAS.atmosfera(C.pasto, "#0E2A1A", 0.3 + b.tono * 0.4);
      g.beginPath(); g.moveTo(b.x - w, y0);
      g.quadraticCurveTo(b.x - w * 0.6 + dx * 0.4, y0 - b.alto * 0.55, b.x + dx, yt);
      g.quadraticCurveTo(b.x + w * 0.6 + dx * 0.4, y0 - b.alto * 0.55, b.x + w, y0); g.fill();
    }
  }, { blur: FOCO.profundidad(1.35, 0.75, { apertura: 22 }) });
  g.restore();
  // titular sobre el cielo
  FOCO.texto(g, [{ texto: "EN", t: v(T.en) - antes }, { texto: "CAPAS,", t: v(T.capas) - antes }], t, W / 2, H * 0.2, { font: MARCA.F.display(120), color: "#FFF6EA", dur: 0.35 });
  FOCO.texto(g, [{ texto: "con", t: v(T.con) - antes }, { texto: "profundidad", t: v(T.profundidad) - antes }], t, W / 2, H * 0.2 + 90, { font: MARCA.F.texto(52), color: "rgba(255,246,234,0.85)", dur: 0.35 });
}

function plano(t) {
  P.dis(() => {
    FOCO.dibujar(g, PROMO.piel(t, dur), W / 2, H / 2, (g) => piel(t), { caja: [0, 0, W, H] });
    // el sol: el punto rojo, un poco más grande y con halo; vuelve al tamaño de paso al final
    const r = M.lerp(M.lerp(PASO.r, 70, ease.out(inv(0, 0.5, t))), PASO.r, ease.inOut(inv(dur - 0.3, dur, t)));
    MARCA.punto(g, PASO.x, PASO.y, r, { brillo: 1.6 });
    MARCA.rotulo(g, "Estilo · capas", W / 2, vertical ? H - 230 : H - 60, { px: 26, alinear: "center", color: "#FFFFFF", a: inv(v(T.capas), v(T.capas) + 0.15, t) * (1 - inv(dur - 0.25, dur, t)) });
  });
}
