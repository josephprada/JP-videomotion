// Núcleo de efectos: definición, parámetros y la API común init / update / render / destroy.
//
// Un efecto declara sus parámetros (esquema) y uno o varios ganchos, según en qué etapa trabaja:
//   source(spec, p, env)      → spec        antes de medir: peso, anchura, tracking, morph…
//   transform(gs, p, env)     → GlyphSet    geometría: estirar, deformar, cortar, girar, trayectoria…
//   render(ctx, next, p, env)               composición: eco, máscara, recorte (envuelve el pintado)
//   compose(ctx, layers, p, env)            varias capas a la vez (layer-compose)
//
// Los parámetros pueden ser valores, funciones (b, t) => valor, o pistas { keys: [[pulso, valor, curva], …] }.
// update(time, params) recalcula TODO a partir del tiempo; nunca lee el fotograma anterior.

import { keys, clamp, getEase } from './ease.js';
import { layout } from '../geometry/glyphset.js';
import { drawGlyphs } from '../compose/draw.js';

export const COMMON_PARAMS = {
  intensity: { type: 'number', min: 0, max: 2, step: 0.01, default: 1, doc: 'Multiplicador global del efecto' },
  start: { type: 'beats', min: 0, max: 16, step: 0.25, default: 0, doc: 'Pulso de inicio, relativo a la capa' },
  duration: { type: 'beats', min: 0.25, max: 16, step: 0.25, default: 4, doc: 'Duración en pulsos' },
  easing: { type: 'ease', default: 'outExpo', doc: 'Curva del progreso' },
  direction: { type: 'angle', min: -180, max: 180, step: 1, default: 0, doc: 'Dirección del movimiento (grados)' },
  speed: { type: 'number', min: -4, max: 4, step: 0.05, default: 1, doc: 'Velocidad (ciclos por pulso)' },
  stagger: { type: 'beats', min: 0, max: 1, step: 0.01, default: 0, doc: 'Retardo entre glifos (pulsos)' },
  sync: { type: 'enum', options: ['beat', 'bar', 'free'], default: 'beat', doc: 'Cuantización al pulso' },
  seed: { type: 'int', min: 1, max: 9999, step: 1, default: 1, doc: 'Semilla del azar' },
};

const registry = new Map();

export function defineEffect(def) {
  const params = { ...COMMON_PARAMS, ...(def.params || {}) };
  const full = { ...def, params };
  registry.set(def.id, full);
  return full;
}

export const getEffect = (id) => {
  const def = registry.get(id);
  if (!def) throw new Error(`Efecto no registrado: ${id}`);
  return def;
};
export const listEffects = () => [...registry.values()];

export function resolveParams(schema, values, b, t) {
  const p = {};
  for (const key of new Set([...Object.keys(schema), ...Object.keys(values)])) {
    let v = key in values ? values[key] : schema[key]?.default;
    // Los parámetros de tipo fn son funciones en sí mismas (por glifo); el resto, si es función, depende del tiempo.
    if (typeof v === 'function' && schema[key]?.type !== 'fn') v = v(b, t);
    else if (v && typeof v === 'object' && Array.isArray(v.keys)) v = keys(b, v.keys);
    p[key] = v;
  }
  // Pulso local desde el inicio del efecto y progreso lineal/curvado en [0, 1].
  p.b = b - p.start;
  p.u = clamp(p.b / p.duration);
  p.e = getEase(p.easing)(p.u);
  return p;
}

// Progreso de un glifo con escalonado: útil para todos los efectos por glifo.
export const glyphProgress = (p, k, n = 1, from = 'start') => {
  const order = from === 'end' ? n - 1 - k : from === 'center' ? Math.abs(k - (n - 1) / 2) : k;
  return clamp((p.b - p.stagger * order) / p.duration);
};

export class Effect {
  constructor(def, params = {}) {
    this.def = typeof def === 'string' ? getEffect(def) : def;
    this.params = params;
    this.cache = {};
    this.p = null;
  }
  get id() { return this.def.id; }
  init(env = {}) { this.env = env; this.def.init?.(this.cache, env); return this; }
  // Cambia los parámetros base sin tocar el código del efecto.
  set(params) { this.params = { ...this.params, ...params }; return this; }
  // time: segundos desde el inicio de la capa. Devuelve los parámetros resueltos de ese instante.
  update(time, params = {}, env = this.env || {}) {
    const period = env.period ?? 0.5;
    this.p = resolveParams(this.def.params, { ...this.params, ...params }, time / period, time);
    this.p.t = time;
    return this.p;
  }
  source(spec, p = this.p, env = this.env) { return this.def.source ? this.def.source(spec, p, env) : spec; }
  transform(gs, p = this.p, env = this.env) { return this.def.transform ? this.def.transform(gs, p, env) : gs; }
  // Uso suelto: pinta un GlyphSet (o un spec de texto) con este efecto aplicado.
  render(ctx, input, env = this.env) {
    const spec = input.glyphs ? null : this.source(input, this.p, env);
    const gs = this.transform(spec ? layout(env.font, spec) : input, this.p, env);
    const base = (o = {}) => {
      ctx.save();
      if (o.matrix) ctx.transform(...o.matrix);
      drawGlyphs(ctx, o.gs || gs, env.palette, o.style || {});
      ctx.restore();
    };
    if (this.def.render) this.def.render(ctx, { draw: base, glyphsAt: () => gs, t: this.p.t }, this.p, env);
    else base();
  }
  destroy() { this.cache = {}; this.p = null; this.env = null; }
}

export const effect = (id, params) => new Effect(id, params);

// Efecto sin registrar, con los ganchos que se le pasen. Sirve para coreografía propia de una escena
// sin salirse del sistema: recibe los mismos parámetros comunes y entra en la misma pila.
export const inline = (hooks, params = {}) => new Effect({ id: 'inline', name: 'Inline', params: { ...COMMON_PARAMS, ...(hooks.params || {}) }, ...hooks }, params);
