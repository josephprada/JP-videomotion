// Marca JP del video 001 (sistemas-diseno/jp): define window.ESTILO (escenas de marca) y window.MARCA (paleta, tipos,
// punto rojo, rótulos y la firma en movimiento dibujada en canvas desde js/firma-datos.js).
// Requiere cargados: nucleo/lib/motion.js, nucleo/kit/fuentes.js, nucleo/kit/acabado.js y js/firma-datos.js.
//   MARCA.firma(g, t, { cx, cy, ancho })            firma completa (2,3 s): se escribe el logo y despliega JOSEPH PRADA
//   MARCA.firma(g, t, { cx, cy, alto, modo: "logo" }) solo el logo JP escribiéndose (0,8 s) y quieto después
//   MARCA.punto(g, x, y, r)                         el punto rojo: «la idea», el motivo que cruza todo el video
//   MARCA.rotulo(g, "TARJETAS", x, y)               etiqueta Geist Mono en mayúsculas con cuadro rojo y línea fina
(function (g0) {
  const src = document.currentScript.src;
  // FUENTES.rutaCss resuelve ../../nucleo/node_modules desde estilos/<id>/: se le da una base con esa profundidad
  const base = new URL("../../../estilos/jp/estilo.js", src).href;

  const C = {
    ink: "#0b0b0c", papel: "#f2efe9", rojo: "#e63329", rojoTexto: "#f53d31", rojoApagado: "#a8231c",
    banda: "#121214", hundido: "#050506",
    suave: "rgba(242,239,233,0.78)", tenue: "rgba(242,239,233,0.52)",
    linea: "rgba(242,239,233,0.14)", lineaFuerte: "rgba(242,239,233,0.40)",
  };
  const F = {
    display: (px) => `400 ${px}px Anton`,                       // siempre en MAYÚSCULAS
    texto: (px, w = 500) => `${w} ${px}px "Geist Variable"`,
    mono: (px, w = 500) => `${w} ${px}px "Geist Mono Variable"`, // etiquetas en MAYÚSCULAS, tracking 0,16–0,22 em
    firma: (px) => `400 ${Math.max(44, px)}px "Mrs Saint Delafield"`, // solo >= 44 px
  };
  const caras = [F.display(40), F.texto(40), F.mono(40), F.firma(60)];
  const listo = FUENTES.cargar(base, [
    "anton/400.css",
    "../@fontsource-variable/geist/index.css",
    "../@fontsource-variable/geist-mono/index.css",
    "mrs-saint-delafield/400.css",
  ], caras);

  // Fondo ink con un haz de luz cálido que entra desde arriba a la izquierda (continuo entre planos)
  function fondo(g, W, H) {
    g.fillStyle = C.ink; g.fillRect(0, 0, W, H);
    const r = Math.hypot(W, H) * 0.75;
    const haz = g.createRadialGradient(W * 0.18, -H * 0.05, 0, W * 0.18, -H * 0.05, r);
    haz.addColorStop(0, "rgba(255,196,150,0.10)"); haz.addColorStop(0.45, "rgba(230,51,41,0.035)"); haz.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = haz; g.fillRect(0, 0, W, H);
  }

  // cubic-bezier de CSS, para copiar las curvas de la guía de movimiento tal cual
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const X = (s) => ((ax * s + bx) * s + cx) * s, Y = (s) => ((ay * s + by) * s + cy) * s, dX = (s) => (3 * ax * s + 2 * bx) * s + cx;
    return (x) => {
      x = M.clamp(x); let s = x;
      for (let i = 0; i < 8; i++) { const e = X(s) - x, d = dX(s); if (Math.abs(e) < 1e-6 || Math.abs(d) < 1e-6) break; s -= e / d; }
      let lo = 0, hi = 1; s = M.clamp(s);
      for (let i = 0; i < 20 && Math.abs(X(s) - x) > 1e-5; i++) { if (X(s) < x) lo = s; else hi = s; s = (lo + hi) / 2; }
      return Y(s);
    };
  }
  const EASE = {
    trazo: bezier(0.65, 0, 0.35, 1), inOut: bezier(0.83, 0, 0.17, 1),
    camara: bezier(0.4, 0, 0.1, 1), expo: bezier(0.16, 1, 0.3, 1),
  };
  const tramo = (t, a, dur, ease) => ease(M.clamp((t - a) / dur));

  // ---------------- punto rojo ----------------
  function punto(g, x, y, r, { brillo = 1, color = C.rojo } = {}) {
    if (r <= 0) return;
    g.save();
    if (brillo > 0) {
      const h = g.createRadialGradient(x, y, r * 0.6, x, y, r * 3.2);
      h.addColorStop(0, `rgba(230,51,41,${0.32 * brillo})`); h.addColorStop(1, "rgba(230,51,41,0)");
      g.fillStyle = h; g.fillRect(x - r * 3.2, y - r * 3.2, r * 6.4, r * 6.4);
    }
    g.fillStyle = color; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    g.restore();
  }

  // ---------------- rótulo de bloque ----------------
  function rotulo(g, texto, x, y, { px = 26, color = C.papel, alinear = "left", linea = 0, a = 1 } = {}) {
    g.save(); g.globalAlpha *= a;
    g.font = F.mono(px); g.letterSpacing = `${(px * 0.2).toFixed(1)}px`;
    g.textBaseline = "middle"; g.textAlign = "left";
    const t = texto.toUpperCase(), w = g.measureText(t).width, q = px * 0.42;
    const x0 = alinear === "center" ? x - (w + q * 2.2) / 2 : alinear === "right" ? x - (w + q * 2.2) : x;
    g.fillStyle = C.rojo; g.fillRect(x0, y - q / 2, q, q);
    g.fillStyle = color; g.fillText(t, x0 + q * 2.2, y + px * 0.04);
    if (linea > 0) { g.fillStyle = C.lineaFuerte; g.fillRect(x0, y + px * 0.95, (w + q * 2.2) * M.clamp(linea), 1.5); }
    g.restore();
    return w + q * 2.2;
  }

  // ---------------- firma en movimiento ----------------
  const D = g0.FIRMA_DATOS;
  const LOGO_X = 1092, T_FIRMA = 2.3;
  const caminos = {};
  const camino = (d) => caminos[d] || (caminos[d] = new Path2D(d));
  let largoLinea = 0;
  function largo() {
    if (largoLinea) return largoLinea;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.style.cssText = "position:absolute;width:0;height:0;visibility:hidden";
    const p = document.createElementNS("http://www.w3.org/2000/svg", "path"); p.setAttribute("d", D.LINEA_J);
    svg.appendChild(p); document.body.appendChild(svg); largoLinea = p.getTotalLength(); svg.remove();
    return largoLinea;
  }
  // Pieza J o P: la forma del logo enmascarada por su línea central escrita hasta «avance» (como la máscara de la guía)
  function pieza(g, cual, avance, color) {
    if (avance <= 0) return;
    g.save();
    g.clip(camino(cual === "J" ? D.LOGO_J : D.LOGO_P));
    g.fillStyle = color;
    if (avance >= 1) { g.fillRect(-60, -60, 520, 400); g.restore(); return; }
    if (cual === "P") { g.translate(D.CENTRO.x, D.CENTRO.y); g.rotate(Math.PI); g.translate(-D.CENTRO.x, -D.CENTRO.y); }
    const L = largo();
    g.strokeStyle = color; g.lineWidth = 74; g.lineCap = "round";
    g.setLineDash([L * avance, L + 10]);
    g.stroke(camino(D.LINEA_J));
    g.restore();
  }
  function letra(g, k, color) {
    for (const s of D.GLIFOS[k]) {
      g.strokeStyle = color; g.lineWidth = D.GROSOR; g.lineCap = s.cap; g.lineJoin = s.join || "round";
      g.stroke(camino(s.d));
    }
  }
  // t en segundos desde que empieza la firma. ancho: ancho final del nombre en px (modo completa); alto: alto del logo (modo logo)
  function firma(g, t, { cx, cy, ancho = 900, alto = 220, modo = "completa", rojo = C.rojo, papel = C.papel, todoRojo = false } = {}) {
    const escribe = tramo(t, 0, 0.8, EASE.trazo);
    g.save();
    if (modo === "logo") {
      const s = alto / D.ALTO;
      g.translate(cx, cy); g.scale(s, s); g.translate(-200, -D.ALTO / 2);
      pieza(g, "J", escribe, rojo); pieza(g, "P", escribe, rojo);
      g.restore(); return;
    }
    const s1 = ancho / D.NOMBRE_ANCHO;
    const s = s1 * M.lerp(3.2, 1, tramo(t, 1.05, 0.9, EASE.camara));
    g.translate(cx, cy); g.scale(s, s); g.translate(-D.NOMBRE_CENTRO.x, -D.NOMBRE_CENTRO.y);
    const mueve = tramo(t, 1.1, 0.9, EASE.inOut);
    const xJ = M.lerp(LOGO_X, 0, mueve), xP = M.lerp(LOGO_X + D.P_ORIGEN_X, D.NOMBRE[6].x, mueve) - D.P_ORIGEN_X;
    // el resto del nombre sale de detrás de cada inicial (recorte de la banda 0..274: astas planas)
    g.save();
    g.beginPath(); g.rect(-400, 0, D.NOMBRE_ANCHO + 800, D.ALTO); g.clip();
    D.NOMBRE.forEach((L, i) => {
      if (L.logo) return;
      const ini = i < 6 ? D.NOMBRE[0] : D.NOMBRE[6], j = i < 6 ? i - 1 : i - 7;
      const p = tramo(t, 1.55 + j * 0.03, 0.6, EASE.expo);
      if (p <= 0) return;
      g.save();
      g.globalAlpha = p;
      const blur = 14 * (1 - p) * s;
      if (blur > 0.3) g.filter = `blur(${blur.toFixed(2)}px)`;
      g.translate(M.lerp(ini.x + 30, L.x, p), 0);
      letra(g, L.k, todoRojo ? rojo : papel);
      g.restore();
    });
    g.restore();
    g.save(); g.translate(xJ, 0); pieza(g, "J", escribe, rojo); g.restore();
    g.save(); g.translate(xP, 0); pieza(g, "P", escribe, rojo); g.restore();
    g.restore();
  }

  g0.MARCA = { C, F, EASE, bezier, tramo, punto, rotulo, firma, T_FIRMA, fondo, caras, listo };
  g0.ESTILO = {
    id: "jp",
    fuentes: caras,
    fondo,
    listo,
    preparar() {},
    acabado: (o = {}) => ACABADO.con({ papelA: 0, granoA: 0.06, vineta: "rgba(0,0,0,0.5)", ...o }),
    pj: (t) => t,
  };
})(window);
