// Capa: un texto (source) + una pila de efectos. Es la unidad que se combina, encadena y recoloca.
//
//   createLayer({ source: { text: 'ECHO', cap: 300, x, y }, stack: [['tracking-spacing', {…}], ['duplicate-echo', {…}]] })
//
// source puede ser un spec fijo o una función (b, t) => spec. El orden de la pila importa:
// los ganchos source y transform se aplican en orden; los render envuelven de dentro hacia fuera
// (el último de la pila es el más exterior).

import { Effect } from '../engine/effect.js';
import { layout } from '../geometry/glyphset.js';
import { drawGlyphs } from './draw.js';

export function createLayer({ source, stack = [], font = null, style = {}, start = 0 } = {}) {
  const effects = stack.map((e) => (e instanceof Effect ? e : new Effect(e[0], e[1] || {})));

  function params(t, env) {
    return effects.map((e) => e.update(t - start, {}, env));
  }

  function glyphsAt(t, env) {
    const ps = params(t, env);
    const period = env.period ?? 0.5;
    let spec = typeof source === 'function' ? source((t - start) / period, t - start) : source;
    effects.forEach((e, k) => { if (e.def.source) spec = e.def.source(spec, ps[k], env); });
    let gs = layout(font || env.font, spec);
    effects.forEach((e, k) => { if (e.def.transform) gs = e.def.transform(gs, ps[k], env); });
    return gs;
  }

  function draw(ctx, t, env, extraStyle = {}) {
    const ps = params(t, env);
    const run = (k, opts) => {
      if (k < 0) {
        const gs = opts.gs || glyphsAt(opts.t ?? t, env);
        ctx.save();
        if (opts.matrix) ctx.transform(...opts.matrix);
        drawGlyphs(ctx, gs, env.palette, { ...style, ...extraStyle, ...(opts.style || {}) });
        ctx.restore();
        return;
      }
      const e = effects[k];
      if (!e.def.render) return run(k - 1, opts);
      e.def.render(ctx, {
        t: opts.t ?? t,
        draw: (o = {}) => run(k - 1, { ...opts, ...o, style: { ...(opts.style || {}), ...(o.style || {}) } }),
        glyphsAt: (tt) => glyphsAt(tt, env),
      }, ps[k], env);
    };
    run(effects.length - 1, {});
  }

  return { effects, glyphsAt, draw, start, source };
}
