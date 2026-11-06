// 07 · ROTATION / SPIN: giro individual de cada glifo alrededor de su pivote.
// En modo sync cada glifo da un número entero de vueltas por pulso: todos se alinean justo en el golpe.

import { defineEffect, glyphProgress } from '../../engine/effect.js';
import { getEase, fract } from '../../engine/ease.js';
import { glyphBBox, mapGlyphs, transformGlyph, setBBox } from '../../geometry/glyphset.js';
import { mat } from '../../geometry/path.js';

export default defineEffect({
  id: 'rotation-spin',
  name: 'Rotation / Spin',
  index: 7,
  params: {
    mode: { type: 'enum', options: ['rotate', 'sync', 'flip', 'set'], default: 'rotate', doc: 'rotate: hasta un ángulo · sync: vueltas alineadas al pulso · flip: giro de tarjeta en plano · set: todo el bloque' },
    angle: { type: 'number', min: -720, max: 720, step: 1, default: 90, doc: 'Ángulo final (grados)' },
    turns: { type: 'int', min: 1, max: 4, step: 1, default: 1, doc: 'Vueltas por pulso en modo sync (se suma una por glifo alterno)' },
    pivot: { type: 'enum', options: ['center', 'baseline-left', 'baseline-right', 'baseline-center', 'cap-left'], default: 'center', doc: 'Pivote de cada glifo' },
    spin: { type: 'enum', options: ['cw', 'ccw', 'alternate'], default: 'cw', doc: 'Sentido' },
    origin: { type: 'vec2', default: null, doc: 'Pivote del modo set (por defecto, el centro del bloque)' },
    per: { type: 'fn', default: null, doc: 'Función (k, n, p) => grados extra por glifo' },
  },
  transform(gs, p) {
    const n = gs.glyphs.length;
    const ez = getEase(p.easing);
    if (p.mode === 'set') {
      const box = setBBox(gs);
      const [ox, oy] = p.origin || [box.x + box.w / 2, box.y + box.h / 2];
      const a = (p.angle * ez(p.u) * p.intensity * Math.PI) / 180 * (p.spin === 'ccw' ? -1 : 1);
      return mapGlyphs(gs, (g) => transformGlyph(g, mat.around(ox, oy, mat.rotate(a))));
    }
    return mapGlyphs(gs, (g, k) => {
      const sign = p.spin === 'ccw' ? -1 : p.spin === 'alternate' ? (k % 2 ? -1 : 1) : 1;
      const b = glyphBBox(g);
      const cap = g.size * 0.675;
      const piv = {
        center: [b.x + b.w / 2, b.y + b.h / 2],
        'baseline-left': [g.x, g.y],
        'baseline-right': [g.x + g.adv, g.y],
        'baseline-center': [g.x + g.adv / 2, g.y],
        'cap-left': [g.x, g.y - cap],
      }[p.pivot];
      let a;
      if (p.mode === 'sync') {
        const turns = p.turns + (k % 3);
        const local = p.b - p.stagger * k;
        a = local <= 0 ? 0 : sign * turns * Math.PI * 2 * ez(fract(local)) * p.intensity;
      } else {
        a = (sign * p.angle * Math.PI) / 180 * ez(glyphProgress(p, k, n)) * p.intensity;
      }
      if (p.per) a += (p.per(k, n, p) * Math.PI) / 180;
      if (p.mode === 'flip') return transformGlyph(g, mat.around(piv[0], piv[1], mat.scale(Math.cos(a), 1)));
      return transformGlyph(g, mat.around(piv[0], piv[1], mat.rotate(a)));
    });
  },
  demo: { text: 'SPIN', cap: 380, params: { mode: 'sync', turns: 1, stagger: 0.05, easing: 'inOutQuart' } },
});
