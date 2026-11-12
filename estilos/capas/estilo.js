// Estilo «capas» (2.5D): paisaje pintado en planos con parallax, perspectiva atmosférica, niebla, rayos de luz y reflejo.
// Lo carga cada escena antes de <video>/js/escena.js. Define window.ESTILO.
// Requiere cargados: nucleo/lib/motion.js, nucleo/kit/acabado.js, foco.js y capas.js.
// La paleta va por roles en ESTILO.color; el video la cambia desde su sistema de diseño (Object.assign(ESTILO.color, {...})).
(function (g0) {
  const color = {
    cieloA: "#26286A", cieloB: "#F4A57C", agua: "#5B4F86",   // cenit, horizonte y lo que queda bajo el horizonte
    sol: "#FFE6B8", luz: "255,232,196",                       // disco del sol y luz de los rayos (r,g,b)
    niebla: "#CFA7C4",                                        // a este color se tiñe lo lejano
    monte: "#363A7A", colina: "#2F5E58", pradera: "#5B9A4C", pasto: "#2E6A3A",
    copa: "#2C5A4E", copaLuz: "#4F8D6A", tronco: "#3A2A33",
    flores: ["#F25C8A", "#FFD166", "#B57BFF", "#FF8A5B", "#FFFFFF"],
  };
  const horizonte = 0.6;   // fracción del alto donde el cielo toca el horizonte

  // Cielo (infinito: no se mueve con la cámara). Sirve como fondo y para pintar el cielo dentro de un reflejo (en diseño).
  function cielo(g, W, H) {
    const gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, color.cieloA); gr.addColorStop(horizonte * 0.92, color.cieloB); gr.addColorStop(horizonte * 1.02, color.cieloB); gr.addColorStop(1, color.agua);
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    // sol bajo, detrás de las montañas, con halo amplio
    const sx = W * 0.6, sy = H * 0.455, r = W * 0.08;
    const halo = g.createRadialGradient(sx, sy, 0, sx, sy, W * 0.75);
    halo.addColorStop(0, `rgba(${color.luz},0.55)`); halo.addColorStop(0.25, `rgba(${color.luz},0.18)`); halo.addColorStop(1, `rgba(${color.luz},0)`);
    g.fillStyle = halo; g.fillRect(0, 0, W, H);
    g.fillStyle = color.sol; g.beginPath(); g.arc(sx, sy, r, 0, Math.PI * 2); g.fill();
  }

  g0.ESTILO = {
    id: "capas",
    fuentes: [],
    fondo: cielo,
    color, cielo, horizonte,
    sol: () => [1080 * 0.6, 1920 * 0.455],   // posición del sol en diseño (9:16) para los rayos
    listo: Promise.resolve(),
    preparar() {},
    // textura pictórica suave (papel muy leve), grano fino y viñeta violeta del atardecer
    acabado: (o = {}) => ACABADO.con({ papelA: 0.07, granoA: 0.05, vineta: "rgba(40,20,70,0.34)", ...o }),
    pj: (t) => t,
  };
})(window);
