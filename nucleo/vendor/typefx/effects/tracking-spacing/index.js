// 09 · TRACKING / SPACING: espaciado entre glifos: uniforme, en onda, justificado o encajado en la rejilla.

import { defineEffect, glyphProgress } from '../../engine/effect.js';
import { getEase, lerp } from '../../engine/ease.js';
import { mapGlyphs, transformGlyph } from '../../geometry/glyphset.js';
import { mat } from '../../geometry/path.js';

export default defineEffect({
  id: 'tracking-spacing',
  name: 'Tracking / Spacing',
  index: 9,
  params: {
    mode: { type: 'enum', options: ['tween', 'wave', 'justify', 'grid'], default: 'tween', doc: 'tween · wave · justify (a una anchura) · grid (cada glifo a una columna)' },
    from: { type: 'number', min: -0.5, max: 2, step: 0.005, default: -0.12, doc: 'Tracking inicial (em)' },
    to: { type: 'number', min: -0.5, max: 2, step: 0.005, default: 0.6, doc: 'Tracking final (em)' },
    amplitude: { type: 'number', min: 0, max: 1, step: 0.005, default: 0.25, doc: 'Amplitud de la onda (em)' },
    waveLength: { type: 'number', min: 1, max: 20, step: 0.5, default: 4, doc: 'Glifos por ciclo' },
    width: { type: 'number', min: 100, max: 4000, step: 1, default: 1728, doc: 'Anchura objetivo en justify (px)' },
    columns: { type: 'list', default: null, doc: 'Bordes x de destino en grid (px), uno por glifo' },
  },
  source(spec, p, env) {
    const ez = getEase(p.easing);
    if (p.mode === 'grid') return spec;
    if (p.mode === 'justify') {
      const font = env.font;
      const size = spec.size ?? font.sizeForCap(spec.cap ?? 200);
      const chars = [...String(spec.text).split('\n')[0]];
      const natural = chars.reduce((s, ch) => s + (font.outline(ch, spec.wght ?? 700, spec.wdth ?? 100).adv * size) / font.unitsPerEm, 0);
      const tr = (p.width - natural) / ((chars.length - 1) * size);
      return { ...spec, tracking: lerp(p.from, tr, ez(p.u) * p.intensity) };
    }
    return {
      ...spec,
      per: [...(spec.per || []), (a) => {
        if (p.mode === 'wave') return { tracking: p.from + p.amplitude * p.intensity * Math.sin((a.k / p.waveLength - p.b * p.speed) * Math.PI * 2) };
        return { tracking: lerp(p.from, p.to, ez(glyphProgress(p, a.k, a.n)) * p.intensity) };
      }],
    };
  },
  transform(gs, p) {
    if (p.mode !== 'grid' || !p.columns) return gs;
    const ez = getEase(p.easing);
    const n = gs.glyphs.length;
    return mapGlyphs(gs, (g, k) => {
      const target = p.columns[Math.min(k, p.columns.length - 1)];
      const dx = (target - g.x) * ez(glyphProgress(p, k, n)) * p.intensity;
      return transformGlyph(g, mat.translate(dx, 0));
    });
  },
  demo: { text: 'SPACING', cap: 260, params: { mode: 'tween', from: -0.15, to: 0.5, stagger: 0.04, easing: 'inOutExpo', duration: 2 } },
});
