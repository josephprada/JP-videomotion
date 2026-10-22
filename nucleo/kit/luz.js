// Luz práctica por momentos (bombillo, ventanas encendidas, farol): un mapa de luz —ambiente oscuro más charcos
// de luz cálida— que se MULTIPLICA sobre el cuadro, y halos que se suman con «screen» encima.
// Coordenadas de diseño (1080×1920): se llama dentro de P.dis(). Sin estado entre cuadros (el lienzo auxiliar se reutiliza).
//   LUZ.aplicar(g, { k, amb, luces: [{ x, y, r, col, i, cono: { dir, ab, largo } }], halos: [{ x, y, r, col, a }] })
(function (g0) {
  let mapa = null;
  function lienzo(w, h) {
    if (!mapa || mapa.width !== w || mapa.height !== h) { mapa = document.createElement("canvas"); mapa.width = w; mapa.height = h; }
    return mapa;
  }
  const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
  function charco(m, L, esc) {
    const gr = m.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.r);
    gr.addColorStop(0, rgba(L.col, L.i)); gr.addColorStop(0.45, rgba(L.col, L.i * 0.55)); gr.addColorStop(1, rgba(L.col, 0));
    m.fillStyle = gr;
    if (L.cono) {
      // cono de luz con bordes suaves (desenfoque proporcional al tamaño)
      const { dir = Math.PI / 2, ab = 0.5, largo = L.r } = L.cono;
      m.save(); m.filter = `blur(${Math.round(largo * 0.05 * esc)}px)`;
      m.beginPath(); m.moveTo(L.x, L.y);
      m.lineTo(L.x + Math.cos(dir - ab) * largo, L.y + Math.sin(dir - ab) * largo);
      m.lineTo(L.x + Math.cos(dir + ab) * largo, L.y + Math.sin(dir + ab) * largo);
      m.closePath(); m.fill(); m.restore();
    } else m.fillRect(L.x - L.r, L.y - L.r, L.r * 2, L.r * 2);
  }
  function aplicar(g, { k = 1, amb = "#3A2F66", luces = [], halos = [] }) {
    if (k <= 0.001) return;
    const T = g.getTransform(), W = g.canvas.width, H = g.canvas.height, c = lienzo(W, H), m = c.getContext("2d");
    m.setTransform(1, 0, 0, 1, 0, 0); m.globalCompositeOperation = "source-over"; m.globalAlpha = 1; m.filter = "none";
    m.fillStyle = "#FFFFFF"; m.fillRect(0, 0, W, H);
    m.globalAlpha = k; m.fillStyle = amb; m.fillRect(0, 0, W, H); m.globalAlpha = 1;
    m.setTransform(T); m.globalCompositeOperation = "lighter";
    for (const L of luces) charco(m, L, T.a);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = "multiply"; g.drawImage(c, 0, 0); g.restore();
    g.save(); g.globalCompositeOperation = "screen";
    for (const h of halos) {
      const gr = g.createRadialGradient(h.x, h.y, 0, h.x, h.y, h.r);
      gr.addColorStop(0, rgba(h.col, h.a * k)); gr.addColorStop(0.3, rgba(h.col, h.a * k * 0.35)); gr.addColorStop(1, rgba(h.col, 0));
      g.fillStyle = gr; g.fillRect(h.x - h.r, h.y - h.r, h.r * 2, h.r * 2);
    }
    g.restore();
  }
  g0.LUZ = { aplicar };
})(typeof globalThis !== "undefined" ? globalThis : window);
