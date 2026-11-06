// GlyphSet: el formato común que comparten todos los efectos.
//
// { glyphs: [Glyph], size, lineHeight }
// Glyph: { ch, i, line, x, y, size, adv, wght, wdth, contours: [Float64Array], role, outline, z }
//   x, y: origen del glifo en la línea base (px, mundo). contours: ya en coordenadas de mundo.
//   role: rol de color (ver color/roles.js). outline: 0 = relleno; > 0 = solo contorno de ese grosor.
//
// Los efectos nunca mutan un GlyphSet: devuelven uno nuevo.

import { bbox, mapContour, mat, densify } from './path.js';
import { morphOutline } from './morph.js';

// spec: { text, size | cap, x, y, wght, wdth, tracking (em), align, lineHeight (em), role, per: [fn] }
// per: funciones (attrs) => attrs que ajustan cada glifo antes de medirlo (peso, anchura, tamaño, morph…).
export function layout(font, spec) {
  const size = spec.size ?? font.sizeForCap(spec.cap ?? 200);
  const lines = String(spec.text).split('\n');
  const lineHeight = (spec.lineHeight ?? 0.9) * size;
  const glyphs = [];
  let index = 0;
  const total = [...String(spec.text).replace(/\n/g, '')].length;
  lines.forEach((text, line) => {
    const chars = [...text];
    const attrs = chars.map((ch, k) => {
      let a = {
        ch, i: index + k, k, n: chars.length, total, line,
        size, wght: spec.wght ?? 700, wdth: spec.wdth ?? 100,
        tracking: spec.tracking ?? 0, dx: 0, dy: 0, role: spec.role ?? 'ink', outline: spec.outline ?? 0,
        morphTo: null, morph: 0, tol: spec.tol ?? 1,
      };
      for (const fn of spec.per || []) a = { ...a, ...fn(a) };
      return a;
    });
    const outlines = attrs.map((a) => {
      const scale = a.size / font.unitsPerEm;
      const o = a.morphTo && a.morph > 0
        ? morphOutline(font, a.ch, a.morphTo, Math.min(1, a.morph), a.wght, a.wdth)
        : font.outline(a.ch, a.wght, a.wdth, a.tol);
      return { o, scale };
    });
    const advs = outlines.map(({ o, scale }) => o.adv * scale);
    let width = 0;
    advs.forEach((w, k) => { width += w + (k < advs.length - 1 ? attrs[k].tracking * attrs[k].size : 0); });
    const align = spec.align ?? 'left';
    let cx = (spec.x ?? 0) - (align === 'center' ? width / 2 : align === 'right' ? width : 0);
    const by = (spec.y ?? 0) + line * lineHeight;
    attrs.forEach((a, k) => {
      const { o, scale } = outlines[k];
      const gx = cx + a.dx, gy = by + a.dy;
      const m = [scale, 0, 0, scale, gx, gy];
      glyphs.push({
        ch: a.morph >= 1 && a.morphTo ? a.morphTo : a.ch, i: a.i, k: a.k, line, x: gx, y: gy, size: a.size, adv: advs[k],
        wght: a.wght, wdth: a.wdth, role: a.role, outline: a.outline, z: 0,
        contours: o.contours.map((c) => mat.apply(m, c)),
      });
      cx += advs[k] + a.tracking * a.size;
    });
  });
  return { glyphs, size, lineHeight };
}

export const glyphBBox = (g) => bbox(g.contours);
export const setBBox = (gs) => bbox(gs.glyphs.flatMap((g) => g.contours));

export const withGlyphs = (gs, glyphs) => ({ ...gs, glyphs });
export const mapGlyphs = (gs, fn) => withGlyphs(gs, gs.glyphs.map((g, k) => fn(g, k, gs.glyphs.length)));

export function transformGlyph(g, m) {
  const x = m[0] * g.x + m[2] * g.y + m[4], y = m[1] * g.x + m[3] * g.y + m[5];
  return { ...g, x, y, contours: g.contours.map((c) => mat.apply(m, c)) };
}

export function mapGlyphPoints(g, fn) {
  return { ...g, contours: g.contours.map((c) => mapContour(c, (x, y) => fn(x, y, g))) };
}

export const transformSet = (gs, m) => mapGlyphs(gs, (g) => transformGlyph(g, m));
export const densifySet = (gs, maxLen) => mapGlyphs(gs, (g) => ({ ...g, contours: g.contours.map((c) => densify(c, maxLen)) }));
export const concatSets = (...sets) => ({ ...sets[0], glyphs: sets.flatMap((s) => s.glyphs) });
