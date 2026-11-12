// Escena 1 · MERCATOR (plantilla del estilo «vox»; reemplázala por la escena real del guion)
// Muestra el lenguaje completo: recorte de archivo con el año, mapa pegado sobre el papel, silueta que pasa a tinta,
// círculo a lápiz, contador sobre marcador amarillo y etiquetas mono con línea guía. Sin imágenes externas: con una foto real,
// cárgala con ESCENA.crear({ cargar }) y pásala por COLLAGE.archivo(img) dentro de un COLLAGE.recorte.
const E = ESCENA.crear({ t0: 0, dur: 8 });
const { P, g, v, pj } = E;
const { inv, ease, spring, S, lerp } = M;
const C = ESTILO.color, F = ESTILO.fuente;
// palabras clave en segundos globales (voz/palabras.srt): todo golpe visual se ancla a una de estas
const T = { anio: 0.3, mapa: 1.1, groenlandia: 2.2, circulo: 2.6, africa: 3.6, cuenta: 4.1, etiquetas: 5.2, fin: 8 };

P.planos([[0, v(T.fin), plano]]);

// silueta de «continente»: contorno periódico con ruido (se cierra sin costura)
function silueta(semilla, cx, cy, rx, ry) {
  const p = new Path2D();
  for (let i = 0; i <= 96; i++) {
    const a = (i / 96) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    const f = 1 + 0.22 * M.noise(semilla, c * 1.4 + 5) + 0.16 * M.noise(semilla + 9, s * 1.7 + 5) + 0.06 * M.noise(semilla + 3, c * 4 + s * 4 + 9);
    i ? p.lineTo(cx + c * rx * f, cy + s * ry * f) : p.moveTo(cx + c * rx * f, cy + s * ry * f);
  }
  p.closePath(); return p;
}
const GROENLANDIA = silueta(4, 300, 640, 120, 90), AFRICA = silueta(11, 640, 980, 170, 200);

function plano(t) {
  const tp = pj(t);   // recortes en stop motion (12 fps)
  // cámara: empuje lento continuo (la mesa nunca se corta)
  const cam = { x: 540, y: 960, z: 1 + 0.06 * ease.inOut(inv(0, v(T.fin), t)) };
  P.capa(cam, 1, () => {
    // 1) recorte de archivo con el año: entra deslizando desde arriba en stop motion
    const kA = spring(tp - v(T.anio), 120, 21);   // resorte suave: en stop motion se ven ~7 cuadros de recorrido
    COLLAGE.recorte(g, 150, lerp(-340, 130, kA), 780, 330, (g, x, y, w, h) => {
      g.fillStyle = C.tinta; g.textAlign = "center"; g.textBaseline = "alphabetic";
      g.font = F.archivo; g.fillText("1569", x + w / 2, y + 180);
      g.font = F.cita; g.fillText("Nova et aucta orbis terrae descriptio", x + w / 2, y + 268);
    }, { semilla: 3, rot: -0.025 });

    // 2) el mapa se pega sobre el papel: sube desde abajo, gira un poco y se asienta
    const kM = spring(tp - v(T.mapa), 120, 21);
    COLLAGE.recorte(g, 90, lerp(2150, 500, kM), 900, 760, (g, x, y, w, h) => {
      g.fillStyle = C.mar; g.fillRect(x, y, w, h);
      COLLAGE.reticula(g, x, y, w, h, { color: C.lineas });
      g.save(); g.translate(0, y - 500);
      // Groenlandia: tierra → amarillo cuando la voz la nombra
      g.fillStyle = inv(v(T.groenlandia), v(T.groenlandia) + 0.15, tp) > 0.5 ? C.marcador : C.tierra; g.fill(GROENLANDIA);
      // África: tierra → tinta (la verdad pesa)
      g.fillStyle = inv(v(T.africa), v(T.africa) + 0.15, tp) > 0.5 ? C.tinta : C.tierra; g.fill(AFRICA);
      g.restore();
    }, { semilla: 8, rot: lerp(0.06, 0.012, kM) });

    // 3) círculo a lápiz rojo alrededor de Groenlandia (el lápiz va a 60: es la mano del narrador, no un recorte)
    if (kM > 0.99) COLLAGE.circulo(g, 300, 640, 190, 150, ease.out(inv(v(T.circulo), v(T.circulo) + 0.7, t)), { color: C.lapiz });

    // 4) contador sobre marcador: «14×» y su complemento
    const kR = inv(v(T.cuenta), v(T.cuenta) + 0.35, t);
    const n = UI.contador(t, v(T.cuenta), 1.2, 1, 14);
    const w = COLLAGE.rotulo(g, `${n}×`, 110, 1330, kR, { font: F.titular, semilla: 5 });
    COLLAGE.rotulo(g, "MÁS GRANDE", 110 + Math.max(w, 300) + 30, 1365, inv(v(T.cuenta) + 0.5, v(T.cuenta) + 0.85, t), { font: "72px Anton", semilla: 6 });

    // 5) etiquetas mono con línea guía hacia cada silueta
    const kE = inv(v(T.etiquetas), v(T.etiquetas) + 0.5, t);
    COLLAGE.etiqueta(g, "Groenlandia · 2,2 M km²", 520, 590, { linea: [410, 640], k: kE, font: F.mono });
    COLLAGE.etiqueta(g, "África · 30,3 M km²", 140, 1160, { linea: [500, 1060], k: inv(v(T.etiquetas) + 0.3, v(T.etiquetas) + 0.8, t), font: F.mono });
  });
}
