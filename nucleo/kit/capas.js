// Paisaje 2.5D en capas: parallax con coordenadas de diseño comunes, perfiles de montaña, perspectiva atmosférica, vaivén de
// vegetación, rayos de luz, bancos de niebla y reflejo en el agua. Requiere nucleo/lib/motion.js (M) y, para profundidad
// de campo, nucleo/kit/foco.js. Lo puro se prueba en node; lo demás dibuja en canvas dentro de P.dis (coordenadas de diseño).
//   const cam = { x: 40 * k, y: 0, z: 1 + 0.12 * k };                    // la cámara se mueve; el cielo (fondo) no
//   CAPAS.capa(g, cam, 0.2, () => CAPAS.cordillera(g, LEJOS, CAPAS.atmosfera(C.monte, C.niebla, 0.7), 1920));
//   CAPAS.capa(g, cam, 1.3, () => pasto(g, t), { blur: FOCO.profundidad(1.3, 0.6) });   // primer plano desenfocado
//   CAPAS.reflejo(g, 1180, 420, () => { …capas que se reflejan… }, { t });
(function (g0) {
  const M = g0.M;

  // ---- puro ----
  // Transformación de una capa a profundidad p (0 = infinito, 1 = plano principal, >1 = primer plano).
  // En reposo ({x:0, y:0, z:1}) es la identidad: todas las capas se diseñan en el mismo cuadro de 1080 × 1920.
  function paralaje(cam, p, W, H) {
    const { x = 0, y = 0, z = 1 } = cam;
    return { s: 1 + (z - 1) * p, tx: -x * p, ty: -y * p, cx: W / 2, cy: H / 2 };
  }

  // Perfil de cresta (montañas, colinas): puntos de x0 a x1 con alturas en base ± amp, ruido por octavas, con semilla
  function perfil(semilla, x0, x1, base, amp, { paso = 8, octavas = 3, rugosidad = 0.5, escala = 420 } = {}) {
    const pts = [];
    for (let x = x0; x <= x1 + paso - 1e-9; x += paso) {
      let s = 0, peso = 0, f = 1, a = 1;
      for (let o = 0; o < octavas; o++) { s += a * M.noise(semilla * 17 + o, (x / escala) * f); peso += a; f *= 2.1; a *= rugosidad; }
      pts.push([x, base - amp * M.clamp(s / peso, -1, 1)]);
    }
    return pts;
  }

  const rgb = (h) => { const n = parseInt(h.replace("#", ""), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  // Perspectiva atmosférica: el color se tiñe de la niebla (o del cielo) con la distancia d (0 = cerca, 1 = horizonte)
  function atmosfera(color, niebla, d) {
    const a = rgb(color), b = rgb(niebla), k = M.clamp(d);
    return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(",")})`;
  }

  // Vaivén de pasto, flores y ramas: desplazamiento en ±amp, con fase propia en cada x (el viento pasa como una ola)
  function vaiven(t, x, { amp = 6, frec = 0.55, semilla = 1 } = {}) {
    return amp * (0.7 * Math.sin(2 * Math.PI * frec * t - x * 0.012) + 0.3 * M.noise(semilla, t * 0.8 + x * 0.01));
  }

  // ---- dibujo ----
  // Dibuja fn como capa a profundidad p; blur = profundidad de campo (px de diseño) con FOCO.capa
  function capa(g, cam, p, fn, { W = 1080, H = 1920, blur = 0 } = {}) {
    const k = paralaje(cam, p, W, H);
    g.save(); g.translate(k.cx, k.cy); g.scale(k.s, k.s); g.translate(-k.cx + k.tx, -k.cy + k.ty);
    if (blur >= 0.25 && g0.FOCO) g0.FOCO.capa(g, blur, fn); else fn(g);
    g.restore();
  }

  // Masa de montaña o colina: el perfil cerrado hasta y = suelo
  function cordillera(g, pts, color, suelo) {
    g.save(); g.fillStyle = color; g.beginPath(); g.moveTo(pts[0][0], suelo);
    for (const [x, y] of pts) g.lineTo(x, y);
    g.lineTo(pts[pts.length - 1][0], suelo); g.closePath(); g.fill(); g.restore();
  }

  // Árbol de copa redonda (racimo de círculos con luz arriba) o pino (triángulos apilados); (x, y) = pie del tronco
  function arbol(g, x, y, alto, { tipo = "redondo", copa = "#2F5D50", luz = "#4C8A6A", tronco = "#3B2A2A", vaiven: dx = 0 } = {}) {
    g.save();
    g.fillStyle = tronco; g.fillRect(x - alto * 0.035, y - alto * 0.45, alto * 0.07, alto * 0.45);
    if (tipo === "pino") {
      for (let i = 0; i < 3; i++) {
        const yb = y - alto * (0.25 + i * 0.22), w = alto * (0.34 - i * 0.08), sx = dx * (0.4 + i * 0.3);
        g.fillStyle = i === 2 ? luz : copa; g.beginPath(); g.moveTo(x - w + sx * 0.5, yb); g.lineTo(x + w + sx * 0.5, yb); g.lineTo(x + sx, yb - alto * 0.36); g.closePath(); g.fill();
      }
    } else {
      const r = alto * 0.26, cy = y - alto * 0.62;
      g.fillStyle = copa;
      for (const [ox, oy, f] of [[-0.6, 0.25, 0.8], [0.6, 0.25, 0.8], [0, 0, 1], [-0.3, -0.45, 0.75], [0.35, -0.4, 0.7]]) { g.beginPath(); g.arc(x + ox * r + dx * (1 - oy) * 0.5, cy + oy * r, r * f, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = luz; g.beginPath(); g.arc(x - r * 0.25 + dx * 0.7, cy - r * 0.5, r * 0.5, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }

  // Rayos de luz desde (x, y): cuñas con degradado radial que se suman con «screen» y oscilan muy lento
  function rayos(g, x, y, t, { n = 7, largo = 1700, ancho = 0.09, a = 0.16, color = "255,236,200", dir = Math.PI / 2, abanico = 1.6 } = {}) {
    g.save(); g.globalCompositeOperation = "screen";
    for (let i = 0; i < n; i++) {
      const ang = dir - abanico / 2 + (abanico * (i + 0.5)) / n + 0.04 * Math.sin(t * 0.3 + i * 1.9);
      const w = ancho * (0.6 + 0.8 * ((i * 53) % 7) / 7), al = a * (0.55 + 0.45 * Math.sin(t * 0.5 + i * 2.7) ** 2);
      const gr = g.createRadialGradient(x, y, 0, x, y, largo);
      gr.addColorStop(0, `rgba(${color},${al})`); gr.addColorStop(1, `rgba(${color},0)`);
      g.fillStyle = gr; g.beginPath(); g.moveTo(x, y);
      g.arc(x, y, largo, ang - w / 2, ang + w / 2); g.closePath(); g.fill();
    }
    g.restore();
  }

  // Banco de niebla horizontal centrado en y, que deriva con el tiempo
  function niebla(g, y, alto, t, { color = "255,255,255", a = 0.35, W = 1080, deriva = 18 } = {}) {
    g.save();
    const gr = g.createLinearGradient(0, y - alto / 2, 0, y + alto / 2);
    gr.addColorStop(0, `rgba(${color},0)`); gr.addColorStop(0.5, `rgba(${color},${a})`); gr.addColorStop(1, `rgba(${color},0)`);
    g.fillStyle = gr;
    for (let i = -1; i < 3; i++) {
      const x = ((t * deriva + i * W * 0.6) % (W * 1.8)) - W * 0.4, w = W * 0.9;
      g.globalAlpha = 0.6 + 0.4 * Math.sin(i * 2.1 + t * 0.2) ** 2;
      g.beginPath(); g.ellipse(x + w / 2, y, w / 2, alto / 2, 0, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }

  // Reflejo: dibuja fn en un lienzo auxiliar y lo copia invertido bajo la línea del agua (y), en franjas con ondulación.
  let aux = null;
  function reflejo(g, y, alto, fn, { t = 0, onda = 5, frec = 0.9, tinte = "rgba(30,45,90,0.32)", W = 1080, franja = 3 } = {}) {
    const T = g.getTransform(), cw = g.canvas.width, ch = g.canvas.height;
    if (!aux) aux = document.createElement("canvas");
    if (aux.width !== cw || aux.height !== ch) { aux.width = cw; aux.height = ch; }
    const a = aux.getContext("2d");
    a.setTransform(1, 0, 0, 1, 0, 0); a.globalCompositeOperation = "source-over"; a.globalAlpha = 1; a.filter = "none"; a.clearRect(0, 0, cw, ch);
    a.setTransform(T); fn(a);
    const s = Math.hypot(T.a, T.b), yd = T.d * y + T.f, ad = Math.min(alto * s, yd, ch - yd), fd = Math.max(1, Math.round(franja * s));
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    for (let j = 0; j < ad; j += fd) {
      const dx = Math.sin(t * frec * 2 * Math.PI + j / (fd * 4)) * onda * s * (0.3 + 0.7 * (j / ad));
      g.globalAlpha = 1 - 0.55 * (j / ad);
      g.drawImage(aux, 0, yd - j - fd, cw, fd, dx, yd + j, cw, fd);
    }
    g.globalAlpha = 1; g.fillStyle = tinte; g.fillRect(0, yd, cw, ad);
    g.restore();
  }

  const api = { paralaje, perfil, atmosfera, vaiven, capa, cordillera, arbol, rayos, niebla, reflejo };
  g0.CAPAS = api;
  if (typeof module !== "undefined") module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
