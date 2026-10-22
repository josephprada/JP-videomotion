// Arranque común de las escenas del video: armazón del núcleo + el estilo cargado (window.ESTILO) + tiempo de la voz.
//   const E = ESCENA.crear({ t0: 21.55, dur: 14.05 });
//   E.P (armazón), E.g (contexto), E.v(s) → tiempo local de un instante global, E.pj(t) → tiempo de los personajes
// Los tiempos se escriben en segundos globales (de la voz si hay voz): así storyboard, voz y código hablan del mismo número.
// Para cambiar el look del video se cambia el estilo que carga cada index.html, no este archivo.
(function (g0) {
  function crear({ t0, dur, fondo, acabado = {} }) {
    const E = g0.ESTILO;
    if (!E) throw new Error("falta el estilo: cada index.html carga estilos/<estilo>/estilo.js antes de js/escena.js");
    E.preparar();
    const P = ARMAZON.crear({ dur, fondo: fondo || E.fondo, fuentes: E.fuentes, acabado: E.acabado(acabado), cargar: [E.listo] });
    return { P, g: P.g, t0, v: (s) => s - t0, pj: E.pj, estilo: E.id };
  }
  g0.ESCENA = { crear };
})(typeof globalThis !== "undefined" ? globalThis : window);
