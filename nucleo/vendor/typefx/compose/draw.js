// Pintado de GlyphSets y bloques sobre canvas, siempre por rol de color.

export function tracePath(ctx, contours) {
  for (const c of contours) {
    if (c.length < 6) continue;
    ctx.moveTo(c[0], c[1]);
    for (let i = 2; i < c.length; i += 2) ctx.lineTo(c[i], c[i + 1]);
    ctx.closePath();
  }
}

let scratch = null;
function scratchFor(ctx) {
  const { width, height } = ctx.canvas;
  if (!scratch) scratch = document.createElement('canvas');
  if (scratch.width !== width || scratch.height !== height) { scratch.width = width; scratch.height = height; }
  return scratch;
}

// Solapes en XOR: cada glifo se rellena aparte en un lienzo auxiliar que se limpia en cada llamada.
function drawXor(ctx, gs, pal, style) {
  const c = scratchFor(ctx);
  const x = c.getContext('2d');
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.clearRect(0, 0, c.width, c.height);
  x.setTransform(ctx.getTransform());
  x.globalCompositeOperation = 'xor';
  for (const g of gs.glyphs) {
    x.beginPath();
    tracePath(x, g.contours);
    x.fillStyle = pal.c(style.role ?? g.role);
    x.fill('nonzero');
  }
  x.globalCompositeOperation = 'source-over';
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(c, 0, 0);
  ctx.restore();
}

// style: { role, outline, mapRole(role), overlap: 'xor' }. Un glifo con outline > 0 se pinta solo con contorno.
export function drawGlyphs(ctx, gs, pal, style = {}) {
  if (style.overlap === 'xor') return drawXor(ctx, gs, pal, style);
  const groups = new Map();
  const ordered = gs.glyphs.slice().sort((a, b) => (a.z || 0) - (b.z || 0));
  // Agrupa por (z, rol, contorno) para pintar en pocas pasadas sin alterar el orden de capas.
  for (const g of ordered) {
    let role = style.role ?? g.role;
    if (style.mapRole) role = style.mapRole(role, g);
    const outline = style.outline ?? g.outline;
    const key = `${g.z || 0}|${role}|${outline}`;
    if (!groups.has(key)) groups.set(key, { role, outline, glyphs: [] });
    groups.get(key).glyphs.push(g);
  }
  for (const { role, outline, glyphs } of groups.values()) {
    ctx.beginPath();
    for (const g of glyphs) tracePath(ctx, g.contours);
    if (outline > 0) {
      ctx.lineWidth = outline;
      ctx.lineJoin = 'miter';
      ctx.strokeStyle = pal.c(role);
      ctx.stroke();
    } else {
      ctx.fillStyle = pal.c(role);
      ctx.fill('nonzero');
    }
  }
}

export function fillRect(ctx, pal, role, r) {
  ctx.fillStyle = pal.c(role);
  ctx.fillRect(r.x, r.y, r.w, r.h);
}

export function fillPoly(ctx, pal, role, pts) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fillStyle = pal.c(role);
  ctx.fill();
}

export function fillCircle(ctx, pal, role, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
  ctx.fillStyle = pal.c(role);
  ctx.fill();
}

// Texto de interfaz (monoespaciada). Se usa para la línea de parámetros.
export function drawMono(ctx, pal, text, x, y, { size = 28, role = 'ink', weight = 500, align = 'left', family = 'TypefxMono' } = {}) {
  ctx.font = `${weight} ${size}px ${family}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = pal.c(role);
  ctx.fillText(text, x, y);
}
