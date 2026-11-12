// Estilo «tarjetas»: escenario continuo (degradado con rayos de luz y rejilla tenue) donde entran y salen tarjetas
// enfocándose. Lo carga cada escena antes de <video>/js/escena.js. Define window.ESTILO.
// Requiere cargados: nucleo/lib/motion.js, nucleo/kit/fuentes.js, acabado.js, foco.js y ui.js.
// La paleta va por roles en ESTILO.color; el video la cambia desde su sistema de diseño (Object.assign(ESTILO.color, {...})).
(function (g0) {
  const base = document.currentScript.src;
  const caras = ["600 40px Inter", "800 40px Inter", "italic 40px 'Instrument Serif'"];
  const color = {
    cieloA: "#5C9BF0", cieloB: "#1D55C4",   // degradado del escenario (arriba → abajo)
    luz: "255,255,255",                       // rayos y halo (r,g,b)
    tarjeta: "#FFFFFF", tinta: "#1B2A55", suave: "#6B7393",
    acento: "#E8673C", borde: "#B9A6FF",      // acento: una vez por plano; borde: brillo de la tarjeta elegida
    crema: "#F4F1EA", tintaCrema: "#14171F", acentoCrema: "#2A5BD7",
  };
  const fuente = { texto: "600 52px Inter", fuerte: "800 52px Inter", clave: "italic 60px 'Instrument Serif'" };

  // Escenario: nunca se corta. Degradado + halo arriba + rayos que derivan muy lento + rejilla al 4 %.
  function escenario(g, W, H, t) {
    const gr = g.createLinearGradient(0, 0, W * 0.25, H);
    gr.addColorStop(0, color.cieloA); gr.addColorStop(1, color.cieloB);
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    const s = Math.min(W, H);
    const halo = g.createRadialGradient(W * 0.3, -s * 0.1, 0, W * 0.3, -s * 0.1, s * 1.1);
    halo.addColorStop(0, `rgba(${color.luz},0.28)`); halo.addColorStop(1, `rgba(${color.luz},0)`);
    g.fillStyle = halo; g.fillRect(0, 0, W, H);
    // rayos: franjas inclinadas con degradado transversal (sin filtro: barato y nítido en los bordes justos)
    g.save(); g.globalCompositeOperation = "screen";
    for (let i = 0; i < 6; i++) {
      const x0 = W * (-0.15 + i * 0.22) + Math.sin(t * 0.13 + i * 1.7) * W * 0.03, ancho = s * (0.16 + 0.08 * ((i * 37) % 3));
      const a = 0.03 + 0.035 * (0.5 + 0.5 * Math.sin(t * 0.21 + i * 2.3));
      const dx = H * 0.45, dir = Math.hypot(dx, H);
      const nx = H / dir, ny = -dx / dir;   // normal a la franja
      const lg = g.createLinearGradient(x0, 0, x0 + nx * ancho, ny * ancho);
      lg.addColorStop(0, `rgba(${color.luz},0)`); lg.addColorStop(0.5, `rgba(${color.luz},${a})`); lg.addColorStop(1, `rgba(${color.luz},0)`);
      g.fillStyle = lg; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + ancho, 0); g.lineTo(x0 + ancho + dx, H); g.lineTo(x0 + dx, H); g.closePath();
      g.save(); g.globalAlpha = 1; g.fill(); g.restore();
    }
    g.restore();
    // rejilla tenue (da escala y profundidad sin competir)
    const paso = Math.round(s / 14);
    g.save(); g.strokeStyle = `rgba(${color.luz},0.045)`; g.lineWidth = Math.max(1, s / 1080);
    g.beginPath();
    for (let x = paso / 2; x < W; x += paso) { g.moveTo(x, 0); g.lineTo(x, H); }
    for (let y = paso / 2; y < H; y += paso) { g.moveTo(0, y); g.lineTo(W, y); }
    g.stroke(); g.restore();
  }

  // Tarjeta crema de capítulo (interludio): fondo crema en un rectángulo; r = esquinas (0 = pantalla completa)
  function crema(g, x, y, w, h, r = 0) {
    g.save(); g.fillStyle = color.crema; const p = new Path2D(); p.roundRect(x, y, w, h, r); g.fill(p); g.restore();
  }

  g0.ESTILO = {
    id: "tarjetas",
    fuentes: caras,
    fondo: escenario,
    color, fuente, escenario, crema,
    listo: FUENTES.cargar(base, ["inter/600.css", "inter/800.css", "instrument-serif/400-italic.css"], caras),
    preparar() {},
    // grano muy fino y viñeta azul profunda; sin papel (es un look digital limpio).
    // limpio (0..1): la escena lo sube mientras una tarjeta crema llena el cuadro, para que la viñeta azul no la ensucie.
    limpio: 0,
    acabado(o = {}) {
      const a = o.vinetaA ?? 0.38;
      return (g, W, H, t) => ACABADO.con({ papelA: 0, granoA: 0.035, ...o, vineta: `rgba(8,24,80,${(a * (1 - g0.ESTILO.limpio)).toFixed(3)})` })(g, W, H, t);
    },
    pj: (t) => t,
  };
})(window);
