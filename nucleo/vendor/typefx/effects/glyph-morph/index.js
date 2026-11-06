// 03 · GLYPH MORPHING: un glifo se transforma en otro interpolando sus contornos (geometry/morph.js).

import { defineEffect } from '../../engine/effect.js';
import { getEase, clamp } from '../../engine/ease.js';

export default defineEffect({
  id: 'glyph-morph',
  name: 'Glyph Morphing',
  index: 3,
  params: {
    to: { type: 'text', default: '', doc: 'Texto destino, carácter a carácter (modo par)' },
    sequence: { type: 'text', default: '', doc: 'Cadena de letras por la que pasa cada glifo (modo cadena)' },
    progress: { type: 'number', min: 0, max: 1, step: 0.001, default: null, doc: 'Progreso manual (si es nulo, se usa el tiempo)' },
    perStep: { type: 'beats', min: 0.125, max: 4, step: 0.125, default: 0.5, doc: 'Pulsos por paso en modo cadena' },
    hold: { type: 'number', min: 0, max: 0.9, step: 0.05, default: 0.35, doc: 'Fracción de cada paso que la letra se queda quieta' },
    weightDip: { type: 'number', min: -800, max: 800, step: 10, default: 0, doc: 'Cambio de peso en mitad de la transformación' },
  },
  source(spec, p) {
    const ez = getEase(p.easing);
    if (p.sequence) {
      const seq = [...p.sequence];
      return {
        ...spec,
        per: [...(spec.per || []), (a) => {
          const pos = clamp((p.b - p.stagger * a.k) / p.perStep, 0, seq.length - 1);
          const i = Math.min(seq.length - 2, Math.floor(pos));
          const f = clamp((pos - i - p.hold) / (1 - p.hold));
          const m = ez(f) * p.intensity;
          return { ch: seq[i], morphTo: seq[i + 1], morph: m, wght: a.wght + p.weightDip * Math.sin(Math.PI * m) };
        }],
      };
    }
    const to = [...(p.to || '')];
    return {
      ...spec,
      per: [...(spec.per || []), (a) => {
        if (!to[a.i] || to[a.i] === a.ch) return {};
        const u = p.progress ?? clamp((p.b - p.stagger * a.k) / p.duration);
        const m = ez(u) * p.intensity;
        return { morphTo: to[a.i], morph: m, wght: a.wght + p.weightDip * Math.sin(Math.PI * m) };
      }],
    };
  },
  demo: { text: 'A', cap: 600, params: { sequence: 'AMORPH', perStep: 0.5, easing: 'inOutCubic' } },
});
