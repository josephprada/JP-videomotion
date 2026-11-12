// Escena 1 · PAISAJE (plantilla del estilo «capas»; reemplázala por la escena real del guion)
// Muestra el lenguaje completo: cielo infinito, cordilleras con perspectiva atmosférica, niebla, colinas con árboles que
// se mecen, lago con reflejo ondulado, rayos de sol, pájaros, flores que crecen en la palabra clave y un primer plano
// desenfocado (profundidad de campo), todo bajo una cámara que avanza despacio.
const E = ESCENA.crear({ t0: 0, dur: 8 });
const { P, g, v } = E;
const { inv, ease, spring, rng } = M;
const C = ESTILO.color;
// palabras clave en segundos globales (voz/palabras.srt): todo golpe visual se ancla a una de estas
const T = { flores: 2.4, fin: 8 };

const AGUA = 1180;   // línea del agua (diseño 1080 × 1920)
const LEJOS = CAPAS.perfil(1, -260, 1340, 900, 240, { escala: 300, octavas: 4, rugosidad: 0.55 });
const MEDIO = CAPAS.perfil(2, -260, 1340, 1040, 120, { escala: 240, octavas: 4 });
const COLINA = CAPAS.perfil(3, -320, 1400, 1135, 34, { escala: 260 });
const PRADO = CAPAS.perfil(5, -360, 1440, 1430, 26, { escala: 340 });
const yEn = (pts, x) => { const i = Math.max(0, Math.min(pts.length - 2, Math.floor((x - pts[0][0]) / (pts[1][0] - pts[0][0])))); return pts[i][1]; };
const ARBOLES = (() => { const r = rng(21), a = []; for (let x = -280; x < 1380; x += 46 + r() * 70) a.push({ x, alto: 70 + r() * 70, pino: r() < 0.45 }); return a; })();
const FLORES = (() => { const r = rng(33), a = []; for (let i = 0; i < 70; i++) { const x = -200 + r() * 1480; a.push({ x, y: yEn(PRADO, x) + 30 + Math.pow(r(), 0.7) * 520, r: 9 + r() * 14, c: C.flores[Math.floor(r() * C.flores.length)], d: r() * 0.9 }); } return a.sort((p, q) => p.y - q.y); })();
// briznas: altas en los bordes (enmarcan) y bajas al centro; con el avance de cámara el primer plano baja, así que nacen bajo el cuadro
const MATAS = (() => { const r = rng(55), a = []; for (let i = 0; i < 90; i++) { const x = -250 + r() * 1580, y = yEn(PRADO, x) + 20 + Math.pow(r(), 0.8) * 560; a.push({ x, y, w: 10 + r() * 18, h: 18 + r() * 34 * (y - 1400) / 400 }); } return a.sort((p, q) => p.y - q.y); })();
const BRIZNAS = (() => { const r = rng(44), a = []; for (let x = -160; x < 1240; x += 22 + r() * 26) { const borde = Math.min(1, Math.abs(x - 540) / 600); a.push({ x, alto: 260 + borde * borde * 620 + r() * 200, ancho: 16 + borde * 22 + r() * 10, curva: (r() - 0.5) * 120 + (x < 540 ? 40 : -40) * borde, tono: r() }); } return a; })();

P.planos([[0, v(T.fin), plano]]);

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

function plano(t) {
  const k = ease.inOut(inv(0, v(T.fin), t));
  const cam = { x: 70 * k, y: 0, z: 1 + 0.1 * k };   // la cámara avanza despacio y se desliza a la derecha
  P.dis(() => {
    const D = g.getTransform();   // transformación de diseño: el reflejo redibuja las capas desde aquí
    CAPAS.capa(g, cam, 0.06, lejos);
    CAPAS.capa(g, cam, 0.18, medio);
    CAPAS.capa(g, cam, 0.26, (g) => CAPAS.niebla(g, 1100, 120, t, { color: "236,200,220", a: 0.38 }));
    // rayos del sol entre las montañas y las colinas (casi infinito: casi no se mueven); atmósfera, no focos
    CAPAS.capa(g, cam, 0.05, (g) => CAPAS.rayos(g, ...ESTILO.sol(), t, { color: C.luz, a: 0.085 }));
    CAPAS.capa(g, cam, 0.4, (g) => colinas(g, t));
    // lago: refleja el cielo y las capas lejanas, con ondulación y un tinte que lo oscurece hacia la orilla
    CAPAS.capa(g, cam, 0.5, (g) => CAPAS.reflejo(g, AGUA, 300, (a) => {
      a.save(); a.setTransform(D); ESTILO.cielo(a, 1080, 1920);
      CAPAS.capa(a, cam, 0.06, lejos); CAPAS.capa(a, cam, 0.18, medio); CAPAS.capa(a, cam, 0.4, (a) => colinas(a, t)); a.restore();
    }, { t, onda: 4 }));
    // pájaros a media distancia
    CAPAS.capa(g, cam, 0.35, (g) => {
      g.strokeStyle = "rgba(40,30,70,0.75)"; g.lineWidth = 3; g.lineCap = "round";
      for (let i = 0; i < 5; i++) {
        const x = -120 + ((t * 70 + i * 150) % 1400), y = 700 + i * 26 + Math.sin(t * 1.3 + i) * 10, ala = 14 + Math.sin(t * 9 + i * 2) * 8;
        g.beginPath(); g.moveTo(x - 18, y - ala * 0.6); g.quadraticCurveTo(x - 8, y - 4, x, y); g.quadraticCurveTo(x + 8, y - 4, x + 18, y - ala * 0.6); g.stroke();
      }
    });
    // pradera con flores que crecen en la palabra clave, en ola de izquierda a derecha
    CAPAS.capa(g, cam, 0.75, (g) => {
      const gr = g.createLinearGradient(0, 1400, 0, 2000);
      gr.addColorStop(0, CAPAS.atmosfera(C.pradera, C.sol.replace("#", "#"), 0.25)); gr.addColorStop(0.35, C.pradera); gr.addColorStop(1, C.pasto);
      CAPAS.cordillera(g, PRADO, gr, 2300);
      g.fillStyle = CAPAS.atmosfera(C.pasto, C.pradera, 0.55);   // matas de tres hojas: textura de pasto que da escala
      for (const m of MATAS) for (const [o, f] of [[-0.6, 0.7], [0, 1], [0.6, 0.8]]) {
        const dx = CAPAS.vaiven(t, m.x, { amp: 3 }) + o * m.w * 0.9, x = m.x + o * m.w * 0.5, h = m.h * f, w = m.w * 0.22;
        g.beginPath(); g.moveTo(x - w, m.y); g.quadraticCurveTo(x - w * 0.3 + dx * 0.4, m.y - h * 0.6, x + dx, m.y - h); g.quadraticCurveTo(x + w * 0.3 + dx * 0.4, m.y - h * 0.6, x + w, m.y); g.fill();
      }
      for (const f of FLORES) flor(g, f.x, f.y, f.r, f.c, spring(t - v(T.flores) - f.d * 0.8 - (f.x + 200) / 1480 * 0.6, ...M.S.playful), CAPAS.vaiven(t, f.x, { amp: 5 }));
    });
    // primer plano: briznas altas desenfocadas (el foco está en la pradera)
    CAPAS.capa(g, cam, 1.35, (g) => {
      // hojas anchas: están cerca; una brizna fina desenfocada se diluye hasta desaparecer
      for (const b of BRIZNAS) {
        const dx = b.curva + CAPAS.vaiven(t, b.x, { amp: 14 }), y0 = 2100, yt = y0 - b.alto, w = b.ancho;
        g.fillStyle = CAPAS.atmosfera(C.pasto, "#0E2A1A", 0.3 + b.tono * 0.4);
        g.beginPath(); g.moveTo(b.x - w, y0);
        g.quadraticCurveTo(b.x - w * 0.6 + dx * 0.4, y0 - b.alto * 0.55, b.x + dx, yt);
        g.quadraticCurveTo(b.x + w * 0.6 + dx * 0.4, y0 - b.alto * 0.55, b.x + w, y0); g.fill();
      }
    }, { blur: FOCO.profundidad(1.35, 0.75, { apertura: 22 }) });
  });
}
