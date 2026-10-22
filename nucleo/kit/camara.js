// Cámara con parallax compartida por las escenas. cam = { x, y, z, sx, sy, rot } (sx/sy: temblor en px).
// p < 1: capa lejana (se mueve y escala menos). p > 1: capa cercana (se magnifica más que el plano principal).
(function (g0) {
  function capa(g, W, H, ESC, cam, p, fn) {
    const z = (p <= 1 ? 1 + (cam.z - 1) * p : cam.z * p) * ESC;
    g.save(); g.translate(W / 2 + (cam.sx || 0) * p * ESC, H / 2 + (cam.sy || 0) * p * ESC); g.rotate((cam.rot || 0) * p);
    g.scale(z, z); g.translate(-cam.x * p, -cam.y * p - (1 - p) * 260); fn(); g.restore();
  }
  g0.CAMARA = { capa };
})(typeof globalThis !== "undefined" ? globalThis : window);
