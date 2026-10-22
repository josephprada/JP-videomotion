// Acabado de cuadro: papel (multiply), grano que cambia a 30 fps (overlay) y viñeta. Texturas con semilla: determinista.
// Mismo acabado para cualquier estilo; la viñeta, el papel y el grano son configurables.
//   ACABADO.pintar(g, W, H, t)                    viñeta violeta por defecto
//   ACABADO.con({ vineta: "rgba(30,20,10,0.4)" })  devuelve otro pintar(g, W, H, t)
(function (g0) {
  let grano = null, papel = null;
  function texturas() {
    grano = document.createElement("canvas"); grano.width = 512; grano.height = 512;
    { const gx = grano.getContext("2d"), im = gx.createImageData(512, 512), r = M.rng(99);
      for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (r() - 0.5) * 120; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
      gx.putImageData(im, 0, 0); }
    papel = document.createElement("canvas"); papel.width = 270; papel.height = 480;
    { const px = papel.getContext("2d"), im = px.createImageData(270, 480);
      for (let y = 0; y < 480; y++) for (let x = 0; x < 270; x++) { const v = 200 + 40 * (M.noise(11, x / 9 + y * 0.013) * 0.5 + M.noise(12, y / 7 + x * 0.021) * 0.5); const i = (y * 270 + x) * 4; im.data[i] = v; im.data[i + 1] = v * 0.97; im.data[i + 2] = v * 0.92; im.data[i + 3] = 255; }
      px.putImageData(im, 0, 0); }
  }
  function con({ papelA = 0.18, granoA = 0.09, vineta = "rgba(40,20,60,0.42)" } = {}) {
    return function pintar(g, W, H, t) {
      if (!grano) texturas();
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
      g.globalCompositeOperation = "multiply"; g.globalAlpha = papelA; g.drawImage(papel, 0, 0, W, H);
      g.globalCompositeOperation = "overlay"; g.globalAlpha = granoA;
      const f = Math.floor(t * 30), ox = (f * 137) % 512, oy = (f * 251) % 512;
      g.translate(-ox, -oy); g.fillStyle = g.createPattern(grano, "repeat"); g.fillRect(0, 0, W + 512, H + 512);
      g.restore();
      if (!vineta) return;
      const v = g.createRadialGradient(W / 2, H * 0.45, H * 0.35, W / 2, H * 0.5, H * 0.75);
      v.addColorStop(0, vineta.replace(/[\d.]+\)$/, "0)")); v.addColorStop(1, vineta);
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = v; g.fillRect(0, 0, W, H); g.restore();
    };
  }
  g0.ACABADO = { con, pintar: con() };
})(typeof globalThis !== "undefined" ? globalThis : window);
