// «Typography in Motion»: 24 s · 120 BPM · 12 compases · un efecto por compás.
//
// Cada escena es una función pura del pulso local b ∈ [0, 4). Las capas y sus pilas de efectos se crean
// una vez; en cada fotograma solo se evalúan. La salida de cada escena es la geometría con la que arranca
// la siguiente (ver docs/propuesta-typography-in-motion.md, sección 3).

import fontData from '../../lib/typefx/fonts/anybody.js';
import {
  createEnv, createLayer, createTimeline, inline, getEffect, layout, setBBox, glyphBBox, mapGlyphs, transformGlyph,
  mat, keys as K, seg, clamp, lerp, ease, fract, drawMono, drawGlyphs, tracePath, area, centroid, pathFor,
} from '../../lib/typefx/index.js';

const W = 1920, H = 1080, M = 96;
const sg = (b, a, d, e = 'outExpo') => seg(b, a, a + d, e);
const lg = (a, b, t) => Math.exp(lerp(Math.log(a), Math.log(b), t));
const capOf = (size) => size * 0.675;

function fill(ctx, env, role, r = { x: 0, y: 0, w: W, h: H }) {
  ctx.fillStyle = env.palette.c(role);
  ctx.fillRect(r.x, r.y, r.w, r.h);
}

// Línea de parámetros: monoespaciada, pegada a la composición. Con bg, corta el plano como una franja.
function band(ctx, env, y, text, { ink = 'ink', bg = null, x = M, size = 32 } = {}) {
  if (bg) fill(ctx, env, bg, { x: 0, y: y - size * 1.15, w: W, h: size * 1.75 });
  drawMono(ctx, env.palette, text, x, y, { size, role: ink, weight: 600 });
}

const f2 = (v) => (Math.round(v * 100) / 100).toFixed(2);
const f0 = (v) => String(Math.round(v));

// ─────────────────────────────────────────────────────────── 01 STRETCH / SQUASH
function s01(env) {
  const mono = env.palette.is('mono');
  const scaleAt = (b, k, n) => {
    const c = Math.abs(k - (n - 1) / 2);
    let ls = Math.log(0.012) * (1 - ease.outElastic(clamp((b - 0.035 * k) / 1.05)));
    ls += Math.log(2.15) * sg(b, 1 + 0.05 * c, 0.45);
    ls += Math.log(0.07) * sg(b, 2, 0.3);
    ls += Math.log(80) * sg(b, 3 + 0.03 * k, 0.55, 'inOutExpo');
    return Math.exp(ls);
  };
  const planeTop = (b) => lerp(H, 0, sg(b, 1.5, 0.5, 'inExpo'));
  const planeBottom = (b) => (mono ? lerp(H, 0, sg(b, 3, 0.5, 'inOutCubic')) : H);
  const word = createLayer({
    source: (b) => ({
      text: 'STRETCH', cap: 430, wght: 900, wdth: 50, x: W / 2, y: H / 2 + 215, align: 'center',
      tracking: K(b, [[3, 0], [3.6, 0.42, 'outExpo']]),
      per: [(a) => ({ role: a.k === 0 && b < 1 ? 'accent' : 'ink' })],
    }),
    stack: [
      ['stretch-squash', { from: 1, amount: 1, volume: 0.6, maxSpread: 2.2, anchor: 'center', reflow: 'center', per: (k, n, p) => scaleAt(p.b, k, n) }],
      ['mask-reveal', {
        shape: 'rects', rects: (b) => [{ x: 0, y: planeTop(b), w: W, h: Math.max(0, planeBottom(b) - planeTop(b)) }],
        surface: 'paperInv', inside: 'inkInv', outside: 'keep',
      }],
    ],
  });
  return {
    id: 'stretch',
    draw(ctx, s) {
      fill(ctx, env, 'paper');
      word.draw(ctx, s.t, env);
      const sc = scaleAt(s.b, 3, 7);
      // La línea salta de sitio en cada pulso (no se arrastra con la letra): se lee sin estela.
      const y = clamp(H / 2 + (430 * scaleAt(Math.floor(s.b) + 0.95, 3, 7)) / 2 + 64, 120, 1010);
      const inPlane = y > planeTop(s.b) && y < planeBottom(s.b);
      band(ctx, env, y, `01  stretch-squash   axis:y   scale:×${f2(sc)}   volume:0.60   elastic:0.70   stagger:0.04b   anchor:center`, { ink: inPlane ? 'inkInv' : 'ink' });
    },
  };
}

// ─────────────────────────────────────────────────────────── 02 WARP / DISTORT
function s02(env, next) {
  const mono = env.palette.is('mono');
  const bgRole = mono ? 'paper' : 'paperInv', ink = mono ? 'ink' : 'inkInv';
  const lensX = (b) => lerp(-300, W + 300, sg(b, 1, 1.2, 'inOutCubic'));
  const rows = 'WARPWARPWARPWARP\n'.repeat(5).trim();
  // La «A» central de la fila del medio viaja a la celda del morphing.
  const pick = { line: 2, k: 5 };
  const isolate = inline({
    transform(gs, p) {
      const u = sg(p.b, 3, 0.85, 'inOutExpo');
      if (u <= 0) return gs;
      return mapGlyphs(gs, (g) => {
        if (g.line === pick.line && g.k === pick.k) {
          const f = lg(1, next.size / g.size, u);
          const ox = lerp(g.x, next.x, u), oy = lerp(g.y, next.y, u);
          return transformGlyph(g, mat.chain(mat.translate(ox, oy), mat.scale(f), mat.translate(-g.x, -g.y)));
        }
        const dir = (g.line % 2 ? -1 : 1) * (g.k < pick.k ? -1 : 1);
        return transformGlyph(g, mat.translate(dir * 2600 * sg(p.b, 3, 0.6, 'inExpo'), 0));
      });
    },
  });
  const layer = createLayer({
    source: { text: rows, cap: 170, wght: 900, wdth: 110, x: W / 2, y: 215, align: 'center', lineHeight: 0.814, role: ink, per: [(a) => ({ dx: a.line % 2 ? -150 : 150 })] },
    stack: [
      ['stretch-squash', { from: 1, amount: 1, volume: 1, anchor: 'center', reflow: 'none', per: (k, n, p) => Math.exp(Math.log(14) * (1 - sg(p.b, 0, 0.7))) }],
      ['warp-distort', { field: 'sine', direction: 0, frequency: 1.6, speed: 0.5, amplitude: { keys: [[0, 0], [0.5, 72], [1.2, 42], [2, 18], [3, 0]] } }],
      ['warp-distort', { field: 'bulge', radius: 430, center: (b) => [lensX(b), 540], amplitude: { keys: [[0.9, 0], [1.15, 120, 'outBack'], [2.1, 120], [2.35, 0]] } }],
      ['warp-distort', { field: 'twist', radius: 780, center: [960, 540], frequency: 3, speed: 0.4, amplitude: { keys: [[1.9, 0], [2.35, 270, 'outExpo'], [2.95, 320], [3.45, 0, 'inOutExpo']] } }],
      isolate,
      ['mask-reveal', { shape: 'circle', at: (b) => [lensX(b), 540], radius: { keys: [[0.9, 0], [1.15, 300, 'outBack'], [2.05, 300], [2.3, 0, 'inExpo']] }, surface: 'surfaceA', inside: 'onSurfaceA', outside: ink }],
    ],
  });
  return {
    id: 'warp',
    draw(ctx, s) {
      fill(ctx, env, bgRole);
      layer.draw(ctx, s.t, env);
      const field = s.b < 1 ? 'sine' : s.b < 2 ? 'bulge' : s.b < 3 ? 'twist' : 'release';
      const amp = s.b < 1 ? K(s.b, [[0, 0], [0.5, 72], [1.2, 42]]) : s.b < 2 ? 120 : s.b < 3 ? 320 : 0;
      if (s.b < 3) band(ctx, env, 1046, `02  warp-distort   field:${field}   amp:${f0(amp)}${field === 'twist' ? '°' : 'px'}   freq:1.6   dir:0°   speed:0.5/b   density:6px`, { ink: bgRole === 'paper' ? 'ink' : 'inkInv', bg: bgRole });
    },
  };
}

// ─────────────────────────────────────────────────────────── 03 GLYPH MORPHING
function s03(env, cell) {
  const border = (b) => K(b, [[0, 1240], [1, 1240], [1.3, 780, 'outExpo'], [2, 780], [2.3, 1200, 'outExpo'], [3, 1200], [3.3, 940, 'outExpo']]);
  const glyph = createLayer({
    source: { text: 'A', size: cell.size, wght: 900, wdth: 110, x: cell.x, y: cell.y, tol: 0.5 },
    stack: [
      ['glyph-morph', { sequence: 'AMORPH', perStep: 0.7, hold: 0.4, easing: 'inOutCubic', weightDip: -380 }],
      ['split-fragment', { mode: 'slices', count: 9, offset: 420, pattern: 'alternate', spread: { keys: [[3.55, 0], [4, 0.35, 'inExpo']] } }],
      ['mask-reveal', { shape: 'rects', rects: (b) => [{ x: border(b), y: 0, w: W, h: H }], surface: 'surfaceA', inside: 'onSurfaceA', outside: 'keep' }],
    ],
  });
  const seq = 'MORPH';
  return {
    id: 'morph',
    draw(ctx, s) {
      const bx = border(s.b);
      const tx = Math.max(bx, 1000) + 64;
      fill(ctx, env, 'paper');
      glyph.draw(ctx, s.t, env);
      // Contraforma de la O en rojo, solo mientras la O está quieta (edición color).
      const pos = s.b / 0.7;
      if (env.palette.is('color') && pos >= 1.95 && pos < 2.42) {
        const gs = glyph.glyphsAt(s.t, env);
        ctx.beginPath();
        for (const g of gs.glyphs) {
          const big = g.contours.reduce((m, c) => (Math.abs(area(c)) > Math.abs(area(m)) ? c : m), g.contours[0]);
          tracePath(ctx, g.contours.filter((c) => Math.sign(area(c)) !== Math.sign(area(big))));
        }
        ctx.fillStyle = env.palette.c('accent');
        ctx.fill();
      }
      // MORPH se imprime letra a letra: contorno mientras no se ha resuelto, relleno al resolverse.
      const done = clamp(Math.floor(s.b / 0.7 + 0.001), 0, 5);
      const word = layout(env.font, { text: seq, cap: 110, wght: 900, wdth: 62, x: tx, y: 300 });
      drawGlyphs(ctx, { ...word, glyphs: word.glyphs.map((g, k) => ({ ...g, role: 'onSurfaceA', outline: k < done ? 0 : 2.5 })) }, env.palette);
      const step = Math.min(4, Math.floor(pos));
      const m = clamp((pos - step - 0.4) / 0.6);
      band(ctx, env, 362, `03  glyph-morph`, { ink: 'onSurfaceA', x: tx });
      band(ctx, env, 400, `from:${'AMORPH'[step]}  to:${'AMORPH'[step + 1]}  t:${f2(ease.inOutCubic(m))}`, { ink: 'onSurfaceA', x: tx });
      band(ctx, env, 438, `pts:128  hold:0.40  dip:-380`, { ink: 'onSurfaceA', x: tx });
    },
  };
}

// ─────────────────────────────────────────────────────────── 04 SPLIT / FRAGMENT
function s04(env, cell) {
  const color = env.palette.is('color');
  const h = createLayer({
    source: { text: 'H', size: cell.size, wght: 900, wdth: 110, x: cell.x, y: cell.y },
    stack: [['split-fragment', { mode: 'slices', count: 9, offset: 420, pattern: 'alternate', spread: { keys: [[0, 0.35], [0.55, 4, 'inExpo']] } }]],
  });
  const slices = createLayer({
    source: { text: 'SPLIT', cap: 400, wght: 900, wdth: 120, x: W / 2, y: 740, align: 'center' },
    stack: [['split-fragment', {
      mode: 'slices', count: 11, offset: 520, pattern: 'alternate', direction: 0,
      spread: { keys: [[0, 2.6], [0.55, 0.22, 'outExpo'], [0.88, 0.22], [1, 0, 'inExpo']] },
      roles: color ? ['ink', 'surfaceB'] : null,
    }]],
  });
  const shards = createLayer({
    source: { text: 'SPLIT', cap: 400, wght: 900, wdth: 120, x: W / 2, y: 740, align: 'center' },
    stack: [['split-fragment', {
      mode: 'shards', count: 22, offset: 300, rotation: 28, pattern: 'radial', seed: 4,
      spread: { keys: [[1, 0], [1.3, 1, 'outExpo'], [2, 1.35, 'linear']] },
      roles: color ? ['ink', 'ink', 'surfaceB'] : null,
    }]],
  });
  const frag = createLayer({
    source: { text: 'FRAGMENTFRAGMENT\nFRAGMENTFRAGMENT\nFRAGMENTFRAGMENT\nFRAGMENTFRAGMENT', cap: 210, wght: 900, wdth: 72, x: W / 2, y: 290, align: 'center', lineHeight: 0.8, per: [(a) => ({ dx: (a.line % 2 ? -1 : 1) * 160 })] },
    stack: [
      ['split-fragment', {
        mode: 'shards', count: 30, offset: 900, rotation: 50, pattern: 'random', seed: 11, direction: -20,
        spread: { keys: [[2, 1], [2.85, 0, 'inOutExpo']] },
        roles: color ? ['ink', 'ink', 'surfaceB', 'ink'] : null,
        rebel: (b) => ({ cell: 13, dx: 150 * sg(b, 3, 0.25, 'outBack'), dy: -90 * sg(b, 3, 0.25, 'outBack'), role: color ? 'accent' : 'keep' }),
      }],
      inline({ transform: (gs, p) => mapGlyphs(gs, (g) => transformGlyph(g, mat.translate((g.line % 2 ? -1 : 1) * 2600 * sg(p.b, 3.55, 0.45, 'inExpo'), 0))) }),
    ],
  });
  return {
    id: 'split',
    draw(ctx, s) {
      fill(ctx, env, 'paper');
      if (s.b < 0.6) h.draw(ctx, s.t, env);
      if (s.b < 1) slices.draw(ctx, s.t, env);
      else if (s.b < 2) shards.draw(ctx, s.t, env);
      else frag.draw(ctx, s.t, env);
      const txt = s.b < 1 ? `mode:slices   count:11   spread:${f2(K(s.b, [[0, 2.6], [0.55, 0.22, 'outExpo'], [0.88, 0.22], [1, 0, 'inExpo']]))}   offset:520px   pattern:alternate`
        : s.b < 2 ? `mode:shards   count:22   spread:${f2(K(s.b, [[1, 0], [1.3, 1, 'outExpo'], [2, 1.35, 'linear']]))}   rotation:28°   pattern:radial   seed:4`
          : `mode:shards   count:30   spread:${f2(K(s.b, [[2, 1], [2.85, 0, 'inOutExpo']]))}   rebel:#13   seed:11`;
      band(ctx, env, 1030, `04  split-fragment   ${txt}`, { bg: 'paper' });
    },
  };
}

// ─────────────────────────────────────────────────────────── 05 DUPLICATE / ECHO
function s05(env, rowsSpec) {
  const color = env.palette.is('color');
  const w210 = setBBox(layout(env.font, { text: 'ECHO', cap: 210, wght: 900, wdth: 100 })).w;
  const capAt = (b) => K(b, [[1.5, 210], [2, 150, 'inOutExpo'], [2.45, 270, 'outExpo'], [3.25, 270], [3.6, rowsSpec.cap, 'inOutExpo']]);
  const pos = (b) => {
    const xa = K(b, [[0, 2050], [0.6, 150, 'outExpo'], [1, 150], [1.5, 820, 'inOutExpo']]);
    if (b < 1.5) return [xa, 260];
    const cap = capAt(b);
    const centered = [960 - (w210 * cap) / 210 / 2, 560 + cap / 2];
    const v = sg(b, 1.5, 0.5, 'inOutExpo');
    const c = [lerp(820, centered[0], v), lerp(260, centered[1], v)];
    const u = sg(b, 3.25, 0.35, 'inOutExpo');
    return [lerp(c[0], rowsSpec.x, u), lerp(c[1], rowsSpec.y, u)];
  };
  const word = createLayer({
    source: (b) => {
      const [x, y] = pos(b);
      return {
        text: 'ECHO', cap: capAt(b), wght: K(b, [[3.38, 900], [3.42, 100, 'linear'], [3.95, 900, 'linear']]), wdth: 100, x, y,
        role: color && b < 1 ? 'accent' : 'ink',
      };
    },
    stack: [
      ['duplicate-echo', {
        copies: (b) => (b < 3 ? 7 : K(b, [[3, 7], [3.25, 0, 'inExpo'], [3.45, 0], [3.8, 6, 'outExpo']])),
        delay: (b) => (b < 2 ? 0.09 : b < 3 ? 0.07 : 0.075),
        offset: (b) => (b < 2 ? [0, 230] : b < 3.4 ? [0, 0] : [0, rowsSpec.step]),
        scale: (b) => (b < 2 || b >= 3.4 ? 1 : 1.17),
        pivot: [960, 560 - 60],
        mode: (b) => (b < 1 || b >= 3.4 ? 'fill' : 'outline'),
        stroke: 3,
        roles: color ? ['surfaceB', 'ink', 'surfaceA'] : null,
      }],
    ],
  });
  return {
    id: 'echo',
    draw(ctx, s) {
      fill(ctx, env, 'paper');
      word.draw(ctx, s.t, env);
      const mode = s.b < 1 ? 'fill' : s.b < 3 ? 'outline' : 'fill';
      const off = s.b < 2 ? 'offset:0,230px' : s.b < 3 ? 'scale:×1.17/copy' : 'offset:0,125px';
      band(ctx, env, 1030, `05  duplicate-echo   copies:7   delay:${s.b < 2 ? '0.09' : '0.07'}b   ${off}   mode:${mode}   t(k) = t − k·delay`, { bg: 'paper' });
    },
  };
}

// ─────────────────────────────────────────────────────────── 06 VARIABLE WEIGHT
function s06(env, rowsSpec) {
  const color = env.palette.is('color');
  const rows = createLayer({
    source: { text: 'WEIGHT\n'.repeat(7).trim(), cap: rowsSpec.cap, wdth: 100, x: rowsSpec.x, y: rowsSpec.y, lineHeight: rowsSpec.step / (rowsSpec.cap / 0.675) },
    stack: [['variable-weight', { mode: 'ramp', rampBy: 'line', duration: 0.001, wghtFrom: { keys: [[0, 900], [0.75, 100, 'inOutExpo']] }, wghtTo: { keys: [[0, 300], [0.75, 900, 'inOutExpo']] } }]],
  });
  const wdthAt = (b) => K(b, [[2, 100], [2.55, 150, 'inOutExpo'], [3, 150], [3.3, 112, 'outExpo']]);
  const wghtAt = (b) => (b < 2 ? null : K(b, [[2, 700], [2.94, 700], [2.95, 100, 'linear'], [3.25, 900, 'outExpo']]));
  const bigSource = (b) => ({
    text: 'WEIGHT', cap: 330, wght: wghtAt(b) ?? 500, wdth: wdthAt(b), x: M, y: 760,
    per: [(a) => ({ role: color && b >= 3 && a.k === 3 ? 'accent' : 'ink' })],
  });
  const bigStack = [
    ['variable-weight', { mode: 'wave', waveLength: 5, speed: 0.9, intensity: (b) => (b < 2 ? 1 : 0), wghtFrom: 100, wghtTo: 900 }],
    ['rotation-spin', { mode: 'rotate', pivot: 'baseline-right', stagger: 0.05, per: (k, n, p) => 25 * ease.inQuad(clamp((p.b - 3.5 - 0.05 * k) / 0.5)), angle: 0 }],
  ];
  const probe = createLayer({ source: bigSource, stack: bigStack });
  const big = createLayer({
    source: bigSource,
    stack: [...bigStack, ['mask-reveal', { shape: 'rects', rects: (b) => (b < 2 ? [] : [band6(b)]), surface: 'surfaceA', inside: 'onSurfaceA', outside: 'keep' }]],
  });
  function band6(b) {
    const gs = probe.glyphsAt(b * env.period, env);
    const box = setBBox(gs);
    const w = (box.x + box.w + 48) * sg(b, 2, 0.5, 'outExpo');
    return { x: 0, y: 760 - 330 - 48, w, h: 330 + 96 };
  }
  const numeral = (b) => layout(env.font, { text: '06', cap: 640, wght: b < 1 ? K(b, [[0, 900], [0.75, 100, 'inOutExpo']]) : b < 2 ? 500 + 400 * Math.sin(b * Math.PI * 2) : wghtAt(b), wdth: b < 2 ? 100 : wdthAt(b) - 40, x: W - M, y: b < 1 ? 900 : 380, align: 'right' });
  return {
    id: 'variable',
    draw(ctx, s) {
      fill(ctx, env, 'paper');
      if (s.b < 1) {
        drawGlyphs(ctx, numeral(s.b), env.palette, { outline: 3 });
        rows.draw(ctx, s.t, env);
      } else {
        drawGlyphs(ctx, numeral(s.b), env.palette, { outline: 3 });
        big.draw(ctx, s.t, env);
      }
      const w = s.b < 1 ? `ramp:line   wght:${f0(K(s.b, [[0, 900], [0.75, 100, 'inOutExpo']]))}→${f0(K(s.b, [[0, 300], [0.75, 900, 'inOutExpo']]))}`
        : s.b < 2 ? 'mode:wave   wght:100↔900   λ:5 glyphs   speed:0.9'
          : `wght:${f0(wghtAt(s.b))}   wdth:${f0(wdthAt(s.b))}`;
      band(ctx, env, s.b < 1 ? 1030 : 900, `06  variable-weight   ${w}   axes:wght·wdth`, { ink: 'ink' });
    },
  };
}

// ─────────────────────────────────────────────────────────── 07 ROTATION / SPIN
function s07(env) {
  const color = env.palette.is('color');
  const blockAngle = (b) => 90 * (Math.floor(b) + ease.outExpo(clamp(fract(b) / 0.45))) * (b < 3.5 ? 1 : 0) + (b >= 3.5 ? 315 : 0);
  // El bloque gira un cuarto de vuelta por pulso y, al final, se abre en la franja de la escena 08.
  const block = (b) => {
    const a = (blockAngle(Math.min(b, 3.5)) * Math.PI) / 180;
    const u = sg(b, 3.5, 0.5, 'inOutExpo');
    const cx = lerp(1380, 960, u), cy = lerp(470, 540, u);
    const hw = lerp(280, 960, u), hh = lerp(280, 180, u);
    const r = a * (1 - u);
    return [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([x, y]) => [cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)]);
  };
  const text = (b) => (b < 3 ? 'ROTATE' : 'SPIN');
  const layer = createLayer({
    source: (b) => ({
      text: text(b), cap: b < 3 ? 300 : 420, wght: 900, wdth: 90, x: W / 2, y: b < 3 ? 700 : 760, align: 'center',
      per: [(a) => ({ role: color && a.k === 2 ? 'accent' : 'ink' })],
    }),
    stack: [
      ['rotation-spin', { mode: 'rotate', pivot: 'baseline-right', angle: 0, per: (k, n, p) => (p.b >= 1 ? 0 : K(p.b - 0.07 * k, [[0, 25], [0.45, 90, 'inQuad'], [0.62, 84, 'outQuad'], [0.95, 0, 'inOutBack']])) }],
      ['rotation-spin', { mode: 'sync', pivot: 'center', turns: 1, stagger: 0, easing: 'inOutQuart', intensity: (b) => (b >= 1 && b < 2 ? 1 : 0), start: 0 }],
      ['rotation-spin', { mode: 'set', angle: -90, spin: 'cw', easing: 'outExpo', start: 2, duration: 0.5, intensity: (b) => (b >= 2 && b < 3 ? 1 : 0) }],
      ['rotation-spin', { mode: 'flip', angle: 360, stagger: 0.07, start: 3, duration: 0.45, easing: 'inOutCubic', intensity: (b) => (b >= 3 ? 1 : 0) }],
      ['mask-reveal', { shape: 'poly', points: (b) => block(b), surface: 'surfaceA', inside: 'onSurfaceA', outside: 'keep' }],
    ],
  });
  return {
    id: 'rotation',
    draw(ctx, s) {
      fill(ctx, env, 'paper');
      layer.draw(ctx, s.t, env);
      const m = s.b < 1 ? 'mode:rotate   pivot:baseline-right   angle:90°   stagger:0.07b'
        : s.b < 2 ? 'mode:sync   turns:1+k%3   aligned on beat'
          : s.b < 3 ? 'mode:set   angle:−90°   pivot:center' : 'mode:flip   scaleX:cos θ   stagger:0.07b';
      band(ctx, env, 1030, `07  rotation-spin   ${m}`, { bg: 'paper' });
    },
  };
}

// ─────────────────────────────────────────────────────────── 08 MASK / REVEAL
function s08(env) {
  const lanes = (b) => [
    { x: K(b, [[0, -800], [0.5, 150, 'outExpo'], [1, 230]]), y: 0, w: 700, h: 360 },
    { x: K(b, [[0, 0], [0.4, 610, 'outExpo'], [1, 560]]), y: 360, w: K(b, [[0, 1920], [0.4, 700, 'outExpo']]), h: 360 },
    { x: K(b, [[0, 1920], [0.5, 1070, 'outExpo'], [1, 990]]), y: 720, w: 700, h: 360 },
  ];
  const p1 = createLayer({
    source: { text: 'MASK', cap: 640, wght: 900, wdth: 100, x: W / 2, y: 860, align: 'center' },
    stack: [['mask-reveal', { shape: 'rects', rects: (b) => lanes(b), surface: 'surfaceB', inside: 'onSurfaceB' }]],
  });
  const p2 = createLayer({
    source: (b) => ({
      text: 'REVEALREVEALREVEALREVEAL\n'.repeat(13).trim(), cap: 62, wght: 800, wdth: 100, x: -200, y: 70, lineHeight: 0.74,
      per: [(a) => ({ dx: (a.line % 2 ? -1 : 1) * (b - 1) * 260 - (a.line % 2) * 120 })],
    }),
    stack: [['mask-reveal', {
      shape: 'glyph', text: 'M', wght: 900, wdth: 120, at: [960, 1050], cap: { keys: [[1, 420], [1.3, 1010, 'outExpo']] },
      surface: 'accent', inside: 'onAccent',
    }]],
  });
  const p3 = createLayer({
    source: { text: 'REVEAL', cap: 330, wght: 900, wdth: 100, x: W / 2, y: 705, align: 'center' },
    stack: [['mask-reveal', { shape: 'blinds', count: 12, progress: { keys: [[2, 0], [2.6, 1, 'inOutExpo']] }, surface: 'paperInv', inside: 'inkInv', outside: 'ink' }]],
  });
  const p4 = createLayer({
    source: { text: 'MASK\nREVEAL', cap: 300, wght: 900, wdth: 100, x: M, y: 470, lineHeight: 0.9 },
    stack: [
      ['mask-reveal', { shape: 'diagonal', direction: 25, progress: { keys: [[3, 0], [3.5, 1, 'inOutExpo']] }, surface: 'paper', inside: 'ink', outside: 'inkInv', outsideSurface: 'paperInv' }],
      ['mask-reveal', { shape: 'blinds', vertical: true, count: 8, progress: { keys: [[3.6, 0], [4, 1, 'inExpo']] }, surface: 'paperInv', inside: 'inkInv', outside: 'keep' }],
    ],
  });
  return {
    id: 'mask',
    draw(ctx, s) {
      fill(ctx, env, s.b >= 2 && s.b < 3 && s.b > 2.6 ? 'paperInv' : 'paper');
      const L = [p1, p2, p3, p4][Math.min(3, Math.floor(s.b))];
      L.draw(ctx, s.t, env);
      const m = s.b < 1 ? 'shape:windows   count:3   w:700px   surface:surfaceB'
        : s.b < 2 ? 'shape:glyph("M")   cap:1010px   surface:accent'
          : s.b < 3 ? 'shape:blinds   count:12   outside:inverse' : 'shape:diagonal   angle:25°   → blinds:vertical';
      if (s.b >= 1 && s.b < 2) band(ctx, env, 1046, `08  mask-reveal   ${m}`, { bg: 'paper' });
      else if (s.b < 1) band(ctx, env, 1046, `08  mask-reveal   ${m}`, { bg: 'paper' });
      else if (s.b < 3) band(ctx, env, 1030, `08  mask-reveal   ${m}`, { ink: s.b > 2.6 ? 'inkInv' : 'ink' });
    },
  };
}

// ─────────────────────────────────────────────────────────── 09 TRACKING / SPACING
function s09(env, grid) {
  const cols = [...Array(8)].map((_, k) => M + k * 216);
  const crush = createLayer({
    source: { text: 'TRACKING', cap: 300, wght: 900, wdth: 100, x: W / 2, y: 690, align: 'center', role: 'inkInv' },
    stack: [['tracking-spacing', { mode: 'tween', from: { keys: [[0, -0.42], [0.5, -0.24, 'outExpo'], [1, -0.32]] }, to: 0, intensity: 0 }]],
  });
  const snap = createLayer({
    source: { text: 'TRACKING', cap: 230, wght: 900, wdth: 100, x: W / 2, y: 690, align: 'center' },
    stack: [['tracking-spacing', { mode: 'grid', columns: cols, start: 1, duration: 0.5, stagger: 0.04, easing: 'outExpo' }]],
  });
  const wave = createLayer({
    source: { text: 'SPACING', cap: 240, wght: 900, wdth: 100, x: W / 2, y: 660, align: 'center' },
    stack: [['tracking-spacing', { mode: 'wave', from: 0.12, amplitude: 0.24, waveLength: 3, speed: 1 }]],
  });
  const just = createLayer({
    source: { text: 'SPACING', cap: 300, wght: 900, wdth: 100, x: M, y: 690 },
    stack: [['tracking-spacing', { mode: 'justify', from: 0, width: 1728, start: 3, duration: 0.4, easing: 'inOutExpo' }]],
  });
  return {
    id: 'tracking',
    draw(ctx, s) {
      if (s.b < 1) {
        fill(ctx, env, 'paperInv');
        crush.draw(ctx, s.t, env, { overlap: 'xor' });
        band(ctx, env, 790, `09  tracking-spacing   mode:tween   tracking:${f2(K(s.b, [[0, -0.42], [0.5, -0.24, 'outExpo'], [1, -0.32]]))}em   overlap:xor`, { ink: 'inkInv', x: 360 });
        return;
      }
      fill(ctx, env, 'paper');
      if (s.b < 2) {
        // Guías de columna: aparecen en el golpe y muestran a dónde encaja cada letra.
        const u = sg(s.b, 1, 0.3);
        for (let i = 0; i <= 8; i++) fill(ctx, env, env.palette.is('color') ? 'surfaceB' : 'ink', { x: (i < 8 ? cols[i] : W - M) - 1, y: 0, w: 2, h: H * u });
        snap.draw(ctx, s.t, env);
        band(ctx, env, 790, `09  tracking-spacing   mode:grid   columns:8 × 216px   stagger:0.04b`, { x: cols[0] + 8 });
      } else if (s.b < 3) {
        wave.draw(ctx, s.t, env);
        band(ctx, env, 790, `09  tracking-spacing   mode:wave   base:0.12em   amp:0.24em   λ:3`, { x: M });
      } else {
        just.draw(ctx, s.t, env);
        band(ctx, env, 790, `09  tracking-spacing   mode:justify   width:1728px`, { x: M });
      }
    },
  };
}

// ─────────────────────────────────────────────────────────── 10 SCALE / CROPPING
function s10(env) {
  const color = env.palette.is('color');
  const spacing = { text: 'SPACING', cap: 300, wght: 900, wdth: 100, x: M, y: 690, tol: 0.04 };
  const justStack = ['tracking-spacing', { mode: 'justify', from: 0, width: 1728, duration: 0.001 }];
  // Punto dentro de la contraforma de la A (tercer glifo de SPACING justificado).
  const probe = createLayer({ source: spacing, stack: [justStack] }).glyphsAt(1, env);
  const holes = probe.glyphs[2].contours.filter((c) => area(c) * area(probe.glyphs[2].contours[0]) < 0);
  const focusA = holes.length ? centroid(holes[0]) : [glyphBBox(probe.glyphs[2]).x + 100, 560];
  const zoomIn = createLayer({
    source: spacing,
    stack: [justStack, ['scale-cropping', {
      zoom: { keys: [[0, 1], [0.75, 16, 'inOutExpo'], [1, 19, 'linear']] },
      focus: (b) => { const u = sg(b, 0, 0.75, 'inOutExpo'); return [lerp(960, focusA[0], u), lerp(540, focusA[1], u)]; },
      surface: 'surfaceA',
    }]],
    style: { role: 'onSurfaceA' },
  });
  const scale = { text: 'SCALE', cap: 300, wght: 900, wdth: 100, x: W / 2, y: 690, align: 'center', tol: 0.08 };
  const drop = (b, i) => sg(b, 1 + i * 0.08, 0.32, 'outExpo');
  const tri = createLayer({
    source: scale,
    stack: [['scale-cropping', {
      windows: (b) => [
        { x: 0, y: 0, w: 640, h: H * drop(b, 0), zoom: K(b, [[1, 4], [2, 11]]), focus: [700, 520], cy: 540, surface: 'surfaceA', role: 'onSurfaceA' },
        { x: 640, y: 0, w: 640, h: H * drop(b, 1), zoom: K(b, [[1, 1.2], [2, 1.55]]), focus: [960, 560], cy: 540, surface: 'paper', role: 'ink' },
        { x: 1280, y: H * (1 - drop(b, 2)), w: 640, h: H * drop(b, 2), zoom: K(b, [[1, 0.42], [2, 0.3]]), focus: [960, 560], cy: 540, surface: color ? 'accent' : 'surfaceB', role: color ? 'onAccent' : 'onSurfaceB' },
      ],
    }]],
  });
  const crop = createLayer({
    source: { text: 'CROP', cap: 300, wght: 900, wdth: 100, x: W / 2, y: 690, align: 'center', tol: 0.08 },
    stack: [['scale-cropping', {
      windows: (b) => {
        const x = K(b, [[2, W], [2.35, 620, 'outExpo']]);
        return [{ x, y: 0, w: W - x, h: H, cx: x + (W - x) / 2, zoom: K(b, [[2, 6], [3, 7.4]]), focus: [K(b, [[2, 600], [3, 690]]), 560], surface: 'surfaceB', role: 'onSurfaceB' }];
      },
    }]],
  });
  // path-flow con flow 0: el texto se ensarta en la recta (y = 640) sin moverse; offset alinea la x.
  const outSpec = { text: 'SCALE / CROP', cap: 200, wght: 900, wdth: 100, x: W / 2, y: 640, align: 'center', tol: 0.1 };
  const outX0 = setBBox(layout(env.font, outSpec)).x;
  const out = createLayer({
    source: outSpec,
    stack: [
      ['path-flow', { path: 'line', lane: 100, offset: outX0 + 400, flow: 0, morphTo: 's-curve', morph: { keys: [[3.5, 0], [4, 0.75, 'inOutCubic']] }, deform: 'bend', density: 10 }],
      ['scale-cropping', { zoom: { keys: [[3, 9], [3.42, 0.86, 'inOutExpo'], [4, 0.8]] }, focus: (b) => [K(b, [[3, 760], [3.42, 960, 'inOutExpo']]), 560] }],
    ],
  });
  return {
    id: 'scale',
    draw(ctx, s) {
      fill(ctx, env, 'paper');
      if (s.b < 1) {
        zoomIn.draw(ctx, s.t, env);
        if (s.b > 0.75) band(ctx, env, 1030, `10  scale-cropping   zoom:×${f0(K(s.b, [[0, 1], [0.75, 16, 'inOutExpo'], [1, 19, 'linear']]))}   focus:counter(A)`, { ink: 'onSurfaceA' });
      } else if (s.b < 2) {
        tri.draw(ctx, s.t, env);
        band(ctx, env, 1030, `10  scale-cropping   windows:3   zoom:×11 · ×1.5 · ×0.3`, { ink: 'ink', x: 640 + 32 });
      } else if (s.b < 3) {
        drawGlyphs(ctx, layout(env.font, { text: 'SCALE', cap: 44, wght: 900, wdth: 100, x: M, y: 540 }), env.palette);
        band(ctx, env, 600, `cap:44px`, { ink: 'ink' });
        crop.draw(ctx, s.t, env);
        band(ctx, env, 1030, `10  scale-cropping   cap:44px vs ×7.4 crop   contrast:1:120`, { ink: 'onSurfaceB', x: K(s.b, [[2, W], [2.35, 620, 'outExpo']]) + 32 });
      } else {
        out.draw(ctx, s.t, env);
        band(ctx, env, 1030, `10  scale-cropping   zoom:×${f2(K(s.b, [[3, 9], [3.42, 0.86, 'inOutExpo'], [4, 0.8]]))}   → path-flow`, { bg: 'paper' });
      }
    },
  };
}

// ─────────────────────────────────────────────────────────── 11 PATH / FLOW
function s11(env, finalLanes) {
  const color = env.palette.is('color');
  const cap = 96;
  const lanes = [-1, 0, 1];
  const morphTo = (b) => (b < 3 ? 'spiral' : 'line');
  const morph = (b) => (b < 3 ? K(b, [[1, 0], [1.8, 1, 'inOutCubic'], [2, 1], [2.4, 0, 'inOutCubic']]) : sg(b, 3, 0.55, 'inOutCubic'));
  const laneOff = (b, i) => (b < 2 ? 0 : b < 3 ? i * 250 * sg(b, 2, 0.4, 'outExpo') : lerp(i * 250, finalLanes[i + 1], sg(b, 3, 0.55, 'inOutCubic')));
  const flowText = 'FLOW·'.repeat(16);
  const lanesLayers = lanes.map((i) => createLayer({
    source: { text: flowText, cap, wght: 800, wdth: 100, x: 0, y: 0, role: 'onSurfaceB' },
    stack: [['path-flow', {
      path: 's-curve', morphTo, morph, offset: -900 + i * 300,
      flow: i === 0 ? 300 : -300 * i, lane: (b) => laneOff(b, i) + (cap / 2), density: 9,
    }]],
  }));
  return {
    id: 'path',
    draw(ctx, s) {
      fill(ctx, env, 'paper');
      if (color) fill(ctx, env, 'surfaceA', { x: 0, y: 0, w: K(s.b, [[0, 960], [1, 960], [1.3, 1320, 'outExpo'], [2, 1320], [2.3, 700, 'outExpo'], [3, 700], [3.4, 0, 'inOutExpo']]), h: H });
      const active = s.b < 2 ? [1] : [0, 1, 2];
      for (const i of active) {
        const P = pathFor('s-curve', morphTo(s.b), morph(s.b), laneOff(s.b, lanes[i]));
        ctx.beginPath();
        for (let k = 0; k < P.points.length; k += 2) (k ? ctx.lineTo : ctx.moveTo).call(ctx, P.points[k], P.points[k + 1]);
        ctx.lineWidth = cap * 1.7;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'butt';
        ctx.strokeStyle = env.palette.c(color && i === 2 && s.b < 3 ? 'accent' : 'surfaceB');
        ctx.stroke();
        lanesLayers[i].draw(ctx, s.t, env);
      }
      const p = s.b < 1 ? 'path:s-curve' : s.b < 2 ? `path:s-curve→spiral   morph:${f2(morph(s.b))}` : s.b < 3 ? 'lanes:3   flow:±300px/b' : `→ line   morph:${f2(morph(s.b))}`;
      band(ctx, env, 1030, `11  path-flow   ${p}   deform:bend   flow:300px/b`, { ink: 'ink' });
    },
  };
}

// ─────────────────────────────────────────────────────────── 12 LAYER / COMPOSE
function s12(env, laneYs) {
  const color = env.palette.is('color');
  const L = [
    createLayer({ source: { text: 'STRETCH', cap: 300, wght: 900, wdth: 50, x: W / 2, y: 690, align: 'center' }, stack: [['stretch-squash', { from: 1, amount: 1, volume: 0.6, anchor: 'center', wave: 0.6, waveFreq: 0.9, speed: 0.5 }], ['tracking-spacing', { mode: 'wave', from: 0.2, amplitude: 0.15 }]] }),
    createLayer({ source: { text: 'WARPWARP\nWARPWARP\nWARPWARP', cap: 220, wght: 900, wdth: 110, x: W / 2, y: 330, align: 'center', lineHeight: 0.8, role: 'onSurfaceB' }, stack: [['warp-distort', { field: 'sine', amplitude: 70, frequency: 1.8, speed: 0.5, direction: 0 }]] }),
    createLayer({ source: { text: 'SHATTER\nSHATTER', cap: 280, wght: 900, wdth: 80, x: W / 2, y: 470, align: 'center', lineHeight: 0.85, role: 'onSurfaceA' }, stack: [['split-fragment', { mode: 'shards', count: 18, pattern: 'radial', offset: 140, rotation: 16, seed: 7, spread: (b) => 0.5 + 0.5 * Math.cos(b * Math.PI * 2) }]] }),
    createLayer({ source: { text: 'SPIN', cap: 420, wght: 900, wdth: 90, x: W / 2, y: 760, align: 'center' }, stack: [['rotation-spin', { mode: 'sync', turns: 1, easing: 'inOutQuart' }]] }),
  ];
  const slots = [
    laneYs.map((y, i) => ({ x: 0, y: i * 270, w: W, h: 270 })),
    [{ x: 0, y: 0, w: 1150, h: 620 }, { x: 1150, y: 0, w: 770, h: 620 }, { x: 0, y: 620, w: 700, h: 460 }, { x: 700, y: 620, w: 1220, h: 460 }],
    [{ x: 0, y: 0, w: 480, h: H }, { x: 480, y: 0, w: 480, h: H }, { x: 960, y: 0, w: 480, h: H }, { x: 1440, y: 0, w: 480, h: H }],
    [{ x: 0, y: 760, w: 480, h: 320 }, { x: 480, y: 760, w: 480, h: 320 }, { x: 960, y: 760, w: 480, h: 320 }, { x: 1440, y: 760, w: 480, h: 320 }],
  ];
  const compose = getEffect('layer-compose');
  const surfaces = ['paper', 'surfaceB', 'surfaceA', 'paperInv'];
  const lockup = createLayer({
    source: { text: 'TYPOGRAPHY\nIN MOTION', cap: 200, wght: 900, wdth: 56, x: M, y: 330, lineHeight: 0.98 },
    stack: [['stretch-squash', { from: 1, amount: 1, volume: 0, anchor: 'center', reflow: 'none', per: (k, n, p) => lg(1, 0.012, sg(p.b, 3.8, 0.2, 'inExpo')) * lg(0.02, 1, ease.outElastic(clamp((p.b - 3 - 0.015 * k) / 0.5))) }]],
  });
  return {
    id: 'layer',
    draw(ctx, s) {
      fill(ctx, env, 'paper');
      const p = { layouts: slots, step: Math.max(0, s.b - 0.65), transition: 0.35, easing: 'inOutExpo', fit: 'cover', surfaces, t: s.t, b: s.b };
      const layers = L.map((l, i) => ({ draw: (c, t, e) => l.draw(c, t, e, i === 3 ? { role: color ? 'inkInv' : 'inkInv' } : {}) }));
      const shrink = sg(s.b, 3.8, 0.2, 'inExpo');
      if (shrink < 1) {
        ctx.save();
        if (shrink > 0) { ctx.translate(0, 540); ctx.scale(1, 1 - shrink * 0.988); ctx.translate(0, -540); }
        compose.compose(ctx, layers, p, env);
        ctx.restore();
      }
      if (s.b >= 3) {
        lockup.draw(ctx, s.t, env);
        if (s.b < 3.8) band(ctx, env, 712, `12  layer-compose   layers:4   effects:12   typefx v1.0   1920×1080   60 fps   120 bpm`, { ink: 'ink' });
      } else {
        band(ctx, env, 1046, `12  layer-compose   layers:4   layout:${Math.min(3, Math.floor(s.b + 0.35)) + 1}/4   fit:cover`, { ink: 'ink', bg: 'paper' });
      }
    },
  };
}

// beats: contenido de beats.json (rejilla medida sobre la pista). Sin él, 120 BPM desde t = 0.
export function createComposition({ edition = 'color', beats = null } = {}) {
  const env = createEnv({ fontData, palette: edition, bpm: beats?.bpm ?? 120, offset: beats?.offset ?? 0 });
  // Celda compartida por WARP (destino de la A), MORPH y SPLIT.
  const cellSize = 700 / 0.675;
  const aAdv = (env.font.outline('A', 900, 110).adv * cellSize) / env.font.unitsPerEm;
  const cell = { size: cellSize, x: 640 - aAdv / 2, y: 900 };
  const rowsSpec = { cap: 112, x: M, y: 150, step: 128 };
  const finalLanes = [-405, 0, 405];
  const scenes = [
    s01(env), s02(env, cell), s03(env, cell), s04(env, cell), s05(env, rowsSpec), s06(env, rowsSpec),
    s07(env), s08(env), s09(env), s10(env), s11(env, finalLanes), s12(env, [0, 270, 540, 810]),
  ].map((s, i) => ({ ...s, beat: i * 4, beats: 4 }));
  const timeline = createTimeline({ clock: env.clock, scenes });
  return { env, timeline, duration: timeline.duration, draw: (ctx, t) => timeline.draw(ctx, t, env) };
}
