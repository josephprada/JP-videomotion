// 06 · VARIABLE WEIGHT: peso y anchura de la fuente variable, por glifo. Cambia la forma, no la escala.

import { defineEffect, glyphProgress } from '../../engine/effect.js';
import { getEase, lerp } from '../../engine/ease.js';

export default defineEffect({
  id: 'variable-weight',
  name: 'Variable Weight',
  index: 6,
  params: {
    mode: { type: 'enum', options: ['tween', 'wave', 'ramp'], default: 'tween', doc: 'tween: de un valor a otro · wave: onda por glifo · ramp: gradiente por línea o glifo' },
    wghtFrom: { type: 'number', min: 100, max: 900, step: 1, default: 100, doc: 'Peso inicial / mínimo' },
    wghtTo: { type: 'number', min: 100, max: 900, step: 1, default: 900, doc: 'Peso final / máximo' },
    wdthFrom: { type: 'number', min: 50, max: 150, step: 0.5, default: null, doc: 'Anchura inicial / mínima (nulo = no tocar)' },
    wdthTo: { type: 'number', min: 50, max: 150, step: 0.5, default: null, doc: 'Anchura final / máxima' },
    waveLength: { type: 'number', min: 1, max: 30, step: 0.5, default: 6, doc: 'Glifos por ciclo de onda' },
    rampBy: { type: 'enum', options: ['line', 'glyph'], default: 'line', doc: 'Qué recorre la rampa' },
  },
  source(spec, p) {
    const ez = getEase(p.easing);
    return {
      ...spec,
      per: [...(spec.per || []), (a) => {
        let f;
        if (p.mode === 'wave') f = 0.5 + 0.5 * Math.sin(((a.i / p.waveLength) - p.b * p.speed) * Math.PI * 2);
        else if (p.mode === 'ramp') {
          const lines = String(spec.text).split('\n').length;
          const r = p.rampBy === 'line' ? a.line / Math.max(1, lines - 1) : a.i / Math.max(1, a.total - 1);
          f = r * ez(glyphProgress(p, a.k, a.n));
        } else f = ez(glyphProgress(p, a.k, a.n));
        // intensity mezcla entre el peso que trae el glifo (0) y el del efecto (1).
        const out = { wght: lerp(a.wght, lerp(p.wghtFrom, p.wghtTo, f), p.intensity) };
        if (p.wdthFrom != null && p.wdthTo != null) out.wdth = lerp(a.wdth, lerp(p.wdthFrom, p.wdthTo, f), p.intensity);
        return out;
      }],
    };
  },
  demo: { text: 'WEIGHT', cap: 300, params: { mode: 'wave', waveLength: 6, speed: 0.5 } },
});
