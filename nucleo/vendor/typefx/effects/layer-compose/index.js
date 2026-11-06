// 12 · LAYER / COMPOSE: varias capas (cada una con su pila de efectos) en ranuras de la rejilla
// que se reorganizan. Es un compositor: recibe capas, no glifos.

import { defineEffect } from '../../engine/effect.js';
import { getEase, clamp } from '../../engine/ease.js';

const lerpRect = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, w: a.w + (b.w - a.w) * t, h: a.h + (b.h - a.h) * t });

export default defineEffect({
  id: 'layer-compose',
  name: 'Layer / Compose',
  index: 12,
  params: {
    layouts: { type: 'list', default: null, doc: 'Lista de disposiciones; cada una, un rectángulo por capa (px)' },
    step: { type: 'number', min: 0, max: 16, step: 0.001, default: null, doc: 'Índice de disposición (fracción = transición). Nulo = un cambio por pulso' },
    transition: { type: 'number', min: 0.05, max: 1, step: 0.01, default: 0.35, doc: 'Fracción del pulso que dura el cambio' },
    fit: { type: 'enum', options: ['cover', 'contain', 'stretch'], default: 'cover', doc: 'Cómo encaja cada capa (diseñada a 1920×1080) en su ranura' },
    surfaces: { type: 'list', default: null, doc: 'Rol de fondo de cada capa' },
  },
  // layers: [{ draw(ctx, t, env, style), role? }]
  compose(ctx, layers, p, env) {
    const W = env.width ?? 1920, H = env.height ?? 1080;
    const L = p.layouts;
    const raw = p.step ?? p.b;
    const i = clamp(Math.floor(raw), 0, L.length - 1);
    const j = Math.min(L.length - 1, i + 1);
    const f = getEase(p.easing)(clamp((raw - Math.floor(raw)) / p.transition));
    const fromLayout = L[i], toLayout = raw >= L.length - 1 ? L[i] : L[j];
    layers.forEach((layer, k) => {
      const a = fromLayout[k], b = toLayout[k];
      if (!a || !b) return;
      const r = raw >= L.length - 1 ? a : lerpRect(a, b, f);
      if (r.w < 1 || r.h < 1) return;
      ctx.save();
      ctx.beginPath();
      ctx.rect(r.x, r.y, r.w, r.h);
      ctx.clip();
      const surf = p.surfaces?.[k];
      if (surf) { ctx.fillStyle = env.palette.c(surf); ctx.fillRect(r.x, r.y, r.w, r.h); }
      let sx = r.w / W, sy = r.h / H;
      if (p.fit === 'cover') sx = sy = Math.max(sx, sy);
      else if (p.fit === 'contain') sx = sy = Math.min(sx, sy);
      ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
      ctx.scale(sx, sy);
      ctx.translate(-W / 2, -H / 2);
      layer.draw(ctx, p.t, env);
      ctx.restore();
    });
  },
  demo: { text: 'LAYER', cap: 300, params: {} },
});
