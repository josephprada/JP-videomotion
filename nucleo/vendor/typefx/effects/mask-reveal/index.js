// 08 · MASK / REVEAL: el texto solo existe dentro de una forma (ventanas, persianas, diagonal, otro glifo).
// Con outside, fuera de la máscara se pinta la versión de polaridad contraria.

import { defineEffect } from '../../engine/effect.js';
import { mask } from '../../compose/mask.js';
import { layout } from '../../geometry/glyphset.js';

function buildMask(ctx, p, env) {
  const W = env.width ?? 1920, H = env.height ?? 1080;
  const pr = p.progress ?? p.e;
  if (p.shape === 'windows') {
    const rects = [];
    for (let i = 0; i < p.count; i++) {
      const w = p.size;
      const lane = H / p.count;
      const dir = i % 2 ? -1 : 1;
      const x = dir > 0 ? -w + (W + w) * pr * (1 + i * 0.12) : W - (W + w) * pr * (1 + i * 0.12);
      rects.push({ x, y: i * lane, w, h: lane });
    }
    mask.rects(ctx, rects);
  } else if (p.shape === 'blinds') {
    mask.blinds(ctx, { x: 0, y: 0, w: W, h: H }, p.count, pr, p.vertical);
  } else if (p.shape === 'diagonal') {
    const th = (p.direction * Math.PI) / 180;
    const nx = Math.cos(th), ny = Math.sin(th);
    const d = (pr - 0.5) * (Math.abs(nx) * W + Math.abs(ny) * H) * 1.1;
    const cx = W / 2 + nx * d, cy = H / 2 + ny * d;
    const tx = -ny * 4000, ty = nx * 4000;
    mask.poly(ctx, [[cx + tx, cy + ty], [cx - tx, cy - ty], [cx - tx - nx * 4000, cy - ty - ny * 4000], [cx + tx - nx * 4000, cy + ty - ny * 4000]]);
  } else if (p.shape === 'wipe') {
    const th = (p.direction * Math.PI) / 180;
    const horiz = Math.abs(Math.cos(th)) > 0.5;
    const back = horiz ? Math.cos(th) < 0 : Math.sin(th) < 0;
    const r = horiz ? { x: back ? W * (1 - pr) : 0, y: 0, w: W * pr, h: H } : { x: 0, y: back ? H * (1 - pr) : 0, w: W, h: H * pr };
    mask.rects(ctx, [r]);
  } else if (p.shape === 'glyph') {
    const gs = layout(env.font, { text: p.text, cap: p.cap, x: p.at[0], y: p.at[1], wght: p.wght, wdth: p.wdth, align: 'center' });
    mask.glyphs(ctx, gs);
  } else if (p.shape === 'rects') {
    mask.rects(ctx, p.rects || []);
  } else if (p.shape === 'circle') {
    ctx.moveTo(p.at[0] + p.radius, p.at[1]);
    ctx.arc(p.at[0], p.at[1], Math.max(0, p.radius), 0, Math.PI * 2);
  } else if (p.shape === 'poly') {
    mask.poly(ctx, p.points || []);
  }
}

export default defineEffect({
  id: 'mask-reveal',
  name: 'Mask / Reveal',
  index: 8,
  params: {
    shape: { type: 'enum', options: ['windows', 'blinds', 'diagonal', 'wipe', 'glyph', 'rects', 'circle', 'poly'], default: 'blinds', doc: 'Forma de la máscara' },
    count: { type: 'int', min: 1, max: 40, step: 1, default: 8, doc: 'Número de ventanas o lamas' },
    size: { type: 'number', min: 20, max: 1920, step: 1, default: 520, doc: 'Anchura de las ventanas (px)' },
    progress: { type: 'number', min: 0, max: 1, step: 0.001, default: null, doc: 'Progreso manual (nulo = tiempo)' },
    vertical: { type: 'bool', default: false, doc: 'Persianas verticales' },
    text: { type: 'text', default: 'M', doc: 'Texto de la máscara (shape = glyph)' },
    cap: { type: 'number', min: 50, max: 2000, step: 1, default: 900, doc: 'Altura de mayúscula de la máscara' },
    at: { type: 'vec2', default: [960, 990], doc: 'Línea base de la máscara (px)' },
    wght: { type: 'number', min: 100, max: 900, step: 1, default: 900, doc: 'Peso de la máscara' },
    wdth: { type: 'number', min: 50, max: 150, step: 1, default: 100, doc: 'Anchura de la máscara' },
    rects: { type: 'list', default: null, doc: 'Rectángulos explícitos (shape = rects)' },
    radius: { type: 'number', min: 0, max: 2400, step: 1, default: 400, doc: 'Radio (shape = circle; centro en at)' },
    points: { type: 'list', default: null, doc: 'Vértices [[x, y], …] (shape = poly)' },
    surface: { type: 'role', default: null, doc: 'Rol del plano que rellena la máscara' },
    inside: { type: 'role', default: null, doc: 'Rol del texto dentro de la máscara' },
    outside: { type: 'role', default: null, doc: "Rol del texto fuera (nulo = no se ve; 'keep' = el suyo)" },
    outsideSurface: { type: 'role', default: null, doc: 'Rol del fondo fuera de la máscara' },
  },
  render(ctx, next, p, env) {
    const W = env.width ?? 1920, H = env.height ?? 1080;
    if (p.outside || p.outsideSurface) {
      // Complemento de la máscara: rectángulo total menos la forma (regla par-impar).
      ctx.save();
      ctx.beginPath();
      ctx.rect(-10, -10, W + 20, H + 20);
      buildMask(ctx, p, env);
      ctx.clip('evenodd');
      if (p.outsideSurface) { ctx.fillStyle = env.palette.c(p.outsideSurface); ctx.fillRect(0, 0, W, H); }
      if (p.outside) next.draw(p.outside === 'keep' ? {} : { style: { role: p.outside } });
      ctx.restore();
    }
    ctx.save();
    ctx.beginPath();
    buildMask(ctx, p, env);
    ctx.clip('nonzero');
    if (p.surface) { ctx.fillStyle = env.palette.c(p.surface); ctx.fillRect(0, 0, W, H); }
    next.draw(p.inside && p.inside !== 'keep' ? { style: { role: p.inside } } : {});
    ctx.restore();
  },
  demo: { text: 'REVEAL', cap: 300, params: { shape: 'blinds', count: 9, duration: 2, surface: 'surfaceB', inside: 'onSurfaceB', outside: 'ink', easing: 'inOutExpo' } },
});

