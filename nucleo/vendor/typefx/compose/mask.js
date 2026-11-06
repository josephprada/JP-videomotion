// Máscaras y recortes: añaden su forma al trazado actual del ctx (sin beginPath, para poder combinarlas).
// Se usan con save/beginPath/…/clip/restore, o con withClip.

import { tracePath } from './draw.js';

export const mask = {
  rects(ctx, rects) {
    for (const r of rects) ctx.rect(r.x, r.y, r.w, r.h);
  },
  poly(ctx, pts) {
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
  },
  glyphs(ctx, gs) {
    for (const g of gs.glyphs) tracePath(ctx, g.contours);
  },
  // Persianas: n franjas horizontales que se abren desde su centro (p = 0 cerradas, 1 abiertas).
  blinds(ctx, { x, y, w, h }, n, p, vertical = false) {
    for (let i = 0; i < n; i++) {
      if (vertical) {
        const sw = w / n, open = sw * p;
        ctx.rect(x + i * sw + (sw - open) / 2, y, open, h);
      } else {
        const sh = h / n, open = sh * p;
        ctx.rect(x, y + i * sh + (sh - open) / 2, w, open);
      }
    }
  },
};

// Pinta dentro de una máscara: clipFn(ctx) construye el trazado; drawFn pinta.
export function withClip(ctx, clipFn, drawFn, rule = 'nonzero') {
  ctx.save();
  ctx.beginPath();
  clipFn(ctx);
  ctx.clip(rule);
  drawFn(ctx);
  ctx.restore();
}
