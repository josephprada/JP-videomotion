// Estilo «cómic»: lo carga cada escena antes de <video>/js/escena.js. Define window.ESTILO.
// Requiere cargados: nucleo/kit/fuentes.js, dibujo.js, acabado.js y comic.js.
(function (g0) {
  const base = document.currentScript.src;
  const caras = ["800 40px Montserrat", "500 40px Montserrat", "40px Bangers"];
  g0.ESTILO = {
    id: "comic",
    fuentes: caras,
    fondo: "#1B2346",
    listo: FUENTES.cargar(base, ["montserrat/800.css", "montserrat/500.css", "bangers"], caras),
    // tinta global en todas las formas de kit/dibujo.js
    preparar() { D.cfg.tinta = 3.2; D.cfg.colorTinta = "#1A1226"; },
    // semitono Ben-Day sobre las sombras del cuadro + papel; o.semitono para ajustar la trama
    acabado(o = {}) {
      const papel = ACABADO.con({ vineta: "rgba(40,20,60,0.42)", papelA: 0.1, granoA: 0.06, ...o });
      return (g, W, H, t) => {
        COMIC.semitono(g, W, H, { celda: Math.max(5, Math.round(11 * W / 1080)), umbral: 0.5, a: 0.42, tramado: 0.12, ...(o.semitono || {}) });
        papel(g, W, H, t);
      };
    },
    // personajes «en dos» (12 fps) con la cámara a 60
    pj: (t) => COMIC.aDos(t),
  };
})(window);
