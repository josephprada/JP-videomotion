// Armazón genérico de una película (ruta A): lienzo, contrato window.seek/window.film, planos, fuentes, acabado y vista previa.
// No sabe de ningún universo ni estilo: el escenario lo pone cada escena y el look lo pone estilos/<estilo>/estilo.js.
//   const P = ARMAZON.crear({ dur: 7.9, fondo: "#2E2160", fuentes: ["800 40px Montserrat"], acabado: ACABADO.pintar });
//   P.planos([[0, 3.1, fnA], [3.1, 7.9, fnB]]);   // fn(t, u): t = tiempo de la escena, u = tiempo dentro del plano
//   P.dis(() => …)  dibuja en el espacio de diseño (1080 de ancho) sin importar la escala de render
//   P.capa(cam, p, fn)  capa con parallax (nucleo/kit/camara.js)
(function (g0) {
  const FORMATOS = { "9x16": [1080, 1920], "1x1": [1080, 1080], "16x9": [1920, 1080] };
  const tamano = (fmt, esc) => (FORMATOS[fmt] || FORMATOS["9x16"]).map((v) => Math.round(v * esc));
  function planoEn(planos, t) {
    for (const p of planos) if (t >= p[0] && t < p[1]) return p;
    return null;
  }

  function crear({ dur, fondo = "#2E2160", fuentes = [], acabado = null, cargar = [] }) {
    const q = new URLSearchParams(location.search);
    const RENDER = q.has("render"), ESC = Number(q.get("scale") || 1), FMT = q.get("fmt") || "9x16";
    const [W, H] = tamano(FMT, ESC);
    const c = document.getElementById("c"); c.width = W; c.height = H;
    const g = c.getContext("2d");
    let PLANOS = [];
    const P = { g, W, H, ESC, FMT, dur, RENDER,
      planos(lista) { PLANOS = lista; },
      dis(fn) { g.save(); g.scale(ESC, ESC); fn(); g.restore(); },
      capa(cam, p, fn) { CAMARA.capa(g, W, H, ESC, cam, p, fn); },
    };
    function seek(t) {
      g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = fondo; g.fillRect(0, 0, W, H);
      const pl = planoEn(PLANOS, t);
      if (pl) pl[2](t, t - pl[0]);
      if (acabado) acabado(g, W, H, t);
      return true;
    }
    window.seek = seek;
    window.film = { w: W, h: H, dur, ready: false };
    Promise.all([...fuentes.map((f) => document.fonts.load(f, "Aa ÉÑ 0123456789 % ¿?")), ...cargar]).then(() => { window.film.ready = true; });
    if (!RENDER) { const t0 = performance.now(); (function loop() { if (window.film.ready) seek(((performance.now() - t0) / 1000) % dur); requestAnimationFrame(loop); })(); }
    return P;
  }

  const api = { crear, planoEn, tamano, FORMATOS };
  g0.ARMAZON = api;
  if (typeof module !== "undefined") module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
