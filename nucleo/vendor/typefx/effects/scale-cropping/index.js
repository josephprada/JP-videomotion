// 10 · SCALE / CROPPING: escalado extremo dentro de ventanas de recorte. Cada ventana es una cámara.

import { defineEffect } from '../../engine/effect.js';

export default defineEffect({
  id: 'scale-cropping',
  name: 'Scale / Cropping',
  index: 10,
  params: {
    windows: { type: 'list', default: null, doc: 'Ventanas [{ x, y, w, h, zoom, focus: [x, y], surface }] (px)' },
    zoom: { type: 'number', min: 0.05, max: 80, step: 0.01, default: 1, doc: 'Zoom de la ventana única (si no hay windows)' },
    focus: { type: 'vec2', default: [960, 540], doc: 'Punto del mundo que queda en el centro de la ventana' },
    surface: { type: 'role', default: null, doc: 'Rol del fondo de cada ventana' },
  },
  render(ctx, next, p, env) {
    const W = env.width ?? 1920, H = env.height ?? 1080;
    const wins = p.windows || [{ x: 0, y: 0, w: W, h: H, zoom: p.zoom, focus: p.focus, surface: p.surface }];
    for (const w of wins) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(w.x, w.y, w.w, w.h);
      ctx.clip();
      const surf = w.surface ?? p.surface;
      if (surf) { ctx.fillStyle = env.palette.c(surf); ctx.fillRect(w.x, w.y, w.w, w.h); }
      const z = Math.pow(w.zoom ?? p.zoom, p.intensity);
      const f = w.focus ?? p.focus;
      const cx = w.cx ?? w.x + w.w / 2, cy = w.cy ?? w.y + w.h / 2;
      next.draw({ matrix: [z, 0, 0, z, cx - f[0] * z, cy - f[1] * z], style: w.role ? { role: w.role } : {} });
      ctx.restore();
    }
  },
  demo: { text: 'SCALE', cap: 300, params: { zoom: { keys: [[0, 1], [1.5, 14, 'inOutExpo'], [3, 14], [4, 1, 'inOutExpo']] }, focus: [870, 560] } },
});
