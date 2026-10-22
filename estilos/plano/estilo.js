// Estilo «plano»: lo carga cada escena antes de <video>/js/escena.js. Define window.ESTILO.
// Requiere cargados: nucleo/kit/fuentes.js, dibujo.js y acabado.js.
(function (g0) {
  const base = document.currentScript.src;
  const caras = ["800 40px Montserrat", "500 40px Montserrat"];
  g0.ESTILO = {
    id: "plano",
    fuentes: caras,
    fondo: "#2E2160",
    listo: FUENTES.cargar(base, ["montserrat/800.css", "montserrat/500.css"], caras),
    preparar() { D.cfg.tinta = 0; D.cfg.trama = null; },
    // acabado(opciones) → función (g, W, H, t); el video puede cambiar la viñeta o el grano
    acabado: (o = {}) => ACABADO.con({ vineta: "rgba(40,20,60,0.42)", ...o }),
    pj: (t) => t,
  };
})(window);
