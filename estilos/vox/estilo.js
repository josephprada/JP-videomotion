// Estilo «vox»: collage de archivo sobre papel envejecido (mapas, recortes, marcador amarillo, etiquetas mono, lápiz rojo).
// Lo carga cada escena antes de <video>/js/escena.js. Define window.ESTILO.
// Requiere cargados: nucleo/lib/motion.js, nucleo/kit/fuentes.js, acabado.js y collage.js.
// La paleta va por roles en ESTILO.color; el video la cambia desde su sistema de diseño (Object.assign(ESTILO.color, {...})).
(function (g0) {
  const base = document.currentScript.src;
  const caras = ["40px Anton", "500 40px 'IBM Plex Mono'", "40px 'IM Fell English'", "italic 40px 'IM Fell English'"];
  const color = {
    papel: [233, 221, 194],                 // fondo (r, g, b): lo genera COLLAGE.papel
    tinta: "#141110", marcador: "#FFD21F", lapiz: "#C8361D",
    mar: "#B7C7BF", tierra: "#D8C9A3", lineas: "rgba(70,45,20,0.28)", recorte: "#F4EEDF",
  };
  const fuente = { titular: "170px Anton", archivo: "190px 'IM Fell English'", cita: "italic 40px 'IM Fell English'", mono: "500 26px 'IBM Plex Mono'" };

  g0.ESTILO = {
    id: "vox",
    fuentes: caras,
    // el papel no se mueve ni se corta: es la mesa donde se pegan los recortes
    fondo: (g, W, H) => g.drawImage(COLLAGE.papel(W, H, { color: color.papel, tostado: 0.2 }), 0, 0, W, H),
    color, fuente,
    listo: FUENTES.cargar(base, ["anton", "ibm-plex-mono/500.css", "im-fell-english/400.css", "im-fell-english/400-italic.css"], caras),
    preparar() {},
    // grano de película marcado, papel multiplicado y viñeta tostada
    acabado: (o = {}) => ACABADO.con({ papelA: 0.12, granoA: 0.11, vineta: "rgba(60,35,10,0.26)", ...o }),
    // los recortes se mueven «en dos» (stop motion, 12 fps); la cámara va a 60
    pj: (t) => M.held(t, 12),
  };
})(window);
