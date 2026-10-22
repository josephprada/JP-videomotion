// Carga de fuentes de un estilo sin servidor (file://): inyecta el css de @fontsource y espera a que cada cara esté lista.
// Devuelve una promesa para ARMAZON.crear({ cargar: [ESTILO.listo] }): así window.film.ready no llega antes que la fuente.
//   FUENTES.cargar(document.currentScript.src, ["montserrat/800.css", "bangers"], ["800 40px Montserrat", "40px Bangers"])
(function (g0) {
  // los estilos viven en estilos/<id>/estilo.js → ../../nucleo/node_modules/@fontsource/<paquete>
  function rutaCss(base, paquete) {
    const archivo = paquete.includes("/") ? paquete : paquete + "/index.css";
    return new URL("../../nucleo/node_modules/@fontsource/" + archivo, base).href;
  }
  function cargar(base, paquetes, caras) {
    const hojas = paquetes.map((p) => new Promise((listo) => {
      const l = document.createElement("link");
      l.rel = "stylesheet"; l.href = rutaCss(base, p); l.onload = l.onerror = () => listo();
      document.head.appendChild(l);
    }));
    return Promise.all(hojas).then(() => Promise.all(caras.map((c) => document.fonts.load(c, "Aa ÉÑ 0123456789 % ¿?"))));
  }
  const api = { rutaCss, cargar };
  g0.FUENTES = api;
  if (typeof module !== "undefined") module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
