// 01 · STRETCH / SQUASH: estiramiento y compresión por glifo, con conservación de volumen opcional.

import { defineEffect, glyphProgress } from '../../engine/effect.js';
import { getEase, spring, lerp } from '../../engine/ease.js';
import { mapGlyphs, mapGlyphPoints } from '../../geometry/glyphset.js';

export default defineEffect({
  id: 'stretch-squash',
  name: 'Stretch / Squash',
  index: 1,
  params: {
    axis: { type: 'enum', options: ['y', 'x'], default: 'y', doc: 'Eje del estiramiento' },
    from: { type: 'number', min: 0.01, max: 20, step: 0.01, default: 1, doc: 'Factor inicial' },
    amount: { type: 'number', min: 0.01, max: 20, step: 0.01, default: 3, doc: 'Factor final (1 = sin cambio)' },
    volume: { type: 'number', min: 0, max: 1, step: 0.05, default: 0.5, doc: 'Conservación de volumen (el otro eje se compensa)' },
    elastic: { type: 'number', min: 0, max: 1, step: 0.05, default: 0, doc: 'Rebote de muelle al llegar' },
    anchor: { type: 'enum', options: ['baseline', 'center', 'cap'], default: 'baseline', doc: 'Punto fijo del estiramiento' },
    wave: { type: 'number', min: 0, max: 1, step: 0.01, default: 0, doc: 'Variación ondulada entre glifos' },
    waveFreq: { type: 'number', min: 0, max: 3, step: 0.05, default: 0.8, doc: 'Frecuencia de la onda (rad por glifo)' },
    maxSpread: { type: 'number', min: 1, max: 20, step: 0.1, default: 6, doc: 'Límite del ensanchado compensatorio (×)' },
    reflow: { type: 'enum', options: ['none', 'left', 'center'], default: 'center', doc: 'Recolocar al cambiar la anchura' },
    per: { type: 'fn', default: null, doc: 'Función (k, n, p) => factor extra por glifo' },
  },
  transform(gs, p) {
    const n = gs.glyphs.length;
    const f = gs.glyphs.map((g, k) => {
      const u = glyphProgress(p, k, n);
      const e = p.elastic > 0 ? lerp(getEase(p.easing)(u), spring(u, 2.2, 4.5), p.elastic) : getEase(p.easing)(u);
      let s = Math.exp(lerp(Math.log(p.from), Math.log(p.amount), e));
      s = Math.pow(s, p.intensity);
      if (p.wave) s *= Math.exp(p.wave * Math.sin(k * p.waveFreq + p.b * p.speed * Math.PI * 2) * 1.2);
      if (p.per) s *= p.per(k, n, p);
      return Math.max(0.002, s);
    });
    const inv = f.map((s) => Math.min(p.maxSpread, Math.pow(s, -p.volume)));
    // Con reflow, cada glifo ocupa su nueva anchura y los vecinos se apartan o se acercan.
    const sx = p.axis === 'y' ? inv : f;
    const shift = new Array(n).fill(0);
    if (p.reflow !== 'none') {
      let acc = 0;
      gs.glyphs.forEach((g, k) => {
        const d = g.adv * (sx[k] - 1);
        shift[k] = acc + d / 2;
        acc += d;
      });
      if (p.reflow === 'center') for (let k = 0; k < n; k++) shift[k] -= acc / 2;
    }
    return mapGlyphs(gs, (g, k) => {
      const cx = g.x + g.adv / 2;
      const cap = g.size * 0.675;
      const ay = p.anchor === 'baseline' ? g.y : p.anchor === 'center' ? g.y - cap / 2 : g.y - cap;
      const [a, b] = p.axis === 'y' ? [inv[k], f[k]] : [f[k], inv[k]];
      const moved = mapGlyphPoints(g, (x, y) => [cx + (x - cx) * a + shift[k], ay + (y - ay) * b]);
      return { ...moved, x: g.x + shift[k] + (g.x - cx) * (a - 1), adv: g.adv * a, sx: a, sy: b };
    });
  },
  demo: { text: 'STRETCH', cap: 260, params: { amount: 3.2, volume: 0.6, elastic: 0.7, stagger: 0.2, duration: 2 } },
});
