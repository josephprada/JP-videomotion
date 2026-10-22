// Lenguaje de «cómic en movimiento» (referencia: Spider-Man: Un nuevo universo), en 2D sobre canvas.
// Todo determinista (semillas fijas, sin estado entre cuadros). Las partes puras se prueban en comic.test.js.
//   aDos(t, fps)                  animación «en dos»: los personajes a 12 fps, la cámara fluida
//   semitono(g, W, H, o)          las sombras del cuadro se vuelven puntos de tinta (Ben-Day); en las más hondas, tramado
//   separar(g, W, H, dx)          lo ya pintado se separa en R/G/B corridos (desenfoque de impresión); desfase(dist, max) da dx
//   contorno(g, W, H, fn, o)      silueta exterior en tinta gruesa por detrás de lo que dibuja fn
//   impacto, lineasFoco, onomatopeya, cajaNarrador, vineta, fondoPuntos   gráfica de cómic
//   pincel, manchas, luzBorde, globo   entintado a mano: trazo afinado, salpicaduras, luz de borde de color, globos
(function (g0) {
  const aDos = (t, fps = 12) => Math.floor(t * fps + 1e-9) / fps;
  const luminancia = (r, g, b) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  // radio del punto de semitono según la luz de la celda: 0 en las luces, tope ~0,58 de la celda en el negro
  function radioPunto(lum, celda, umbral = 0.62) {
    if (lum >= umbral) return 0;
    const k = 1 - lum / umbral;
    return celda * 0.58 * Math.sqrt(k);
  }

  const esNavegador = typeof document !== "undefined";
  const _l = {};
  function lienzo(n, w, h) {
    let c = _l[n]; if (!c || c.width !== w || c.height !== h) { c = document.createElement("canvas"); c.width = w; c.height = h; _l[n] = c; }
    const x = c.getContext("2d", { willReadFrequently: n === "muestra" }); x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = "source-over"; x.globalAlpha = 1; x.filter = "none"; x.clearRect(0, 0, w, h); return [c, x];
  }

  // ---------------- pasadas sobre el cuadro ----------------
  function semitono(g, W, H, { celda = 9, a = 0.55, oscurece = 0.42, umbral = 0.62, tramado = 0.2, tinta = "#1A1226" } = {}) {
    const cw = Math.ceil(W / celda), ch = Math.ceil(H / celda);
    const [m, mx] = lienzo("muestra", cw, ch);
    mx.imageSmoothingEnabled = true; mx.drawImage(g.canvas, 0, 0, cw, ch);
    const px = mx.getImageData(0, 0, cw, ch).data;
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = a; g.globalCompositeOperation = "multiply";
    for (let j = 0; j < ch; j++) {
      const off = (j % 2) * celda * 0.5;
      for (let i = 0; i < cw; i++) {
        const k = (j * cw + i) * 4, r = px[k], gg = px[k + 1], b = px[k + 2], lum = luminancia(r, gg, b);
        const rad = radioPunto(lum, celda, umbral);
        if (rad <= 0.4) continue;
        g.fillStyle = `rgb(${(r * oscurece) | 0},${(gg * oscurece) | 0},${(b * oscurece) | 0})`;
        g.beginPath(); g.arc(i * celda + celda / 2 + off, j * celda + celda / 2, rad, 0, Math.PI * 2); g.fill();
      }
    }
    // tramado en las sombras más hondas: líneas diagonales de tinta
    if (tramado > 0) {
      g.globalCompositeOperation = "source-over"; g.globalAlpha = tramado; g.strokeStyle = tinta; g.lineWidth = Math.max(1, celda * 0.16); g.beginPath();
      for (let j = 0; j < ch; j += 1) for (let i = 0; i < cw; i += 1) {
        const k = (j * cw + i) * 4; if (luminancia(px[k], px[k + 1], px[k + 2]) > 0.16) continue;
        const x = i * celda, y = j * celda; g.moveTo(x, y + celda); g.lineTo(x + celda, y);
      }
      g.stroke();
    }
    g.restore();
  }

  // separación de color por desenfoque: |distancia al plano de foco| → píxeles de desfase (curva suave, tope max)
  const desfase = (dist, max) => max * Math.min(1, Math.abs(dist)) ** 0.8;
  // separar: lo que ya está pintado en g se descompone en R, G y B y se recompone con R y B corridos en sentidos
  // opuestos (el «desenfoque de impresión» de Spider-Verse). Llamarlo después del fondo y antes de lo que está en foco.
  function separar(g, W, H, dx, { dy = 0 } = {}) {
    if (Math.abs(dx) < 0.3 && Math.abs(dy) < 0.3) return;
    const [f, fx] = lienzo("separarF", W, H); fx.drawImage(g.canvas, 0, 0);
    const canal = (n, col) => { const [c, x] = lienzo(n, W, H); x.drawImage(f, 0, 0); x.globalCompositeOperation = "multiply"; x.fillStyle = col; x.fillRect(0, 0, W, H); x.globalCompositeOperation = "destination-in"; x.drawImage(f, 0, 0); return c; };
    const r = canal("separarR", "#FF0000"), v = canal("separarG", "#00FF00"), b = canal("separarB", "#0000FF");
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.filter = "none";
    g.globalCompositeOperation = "source-over"; g.fillStyle = "#000"; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = "lighter"; g.drawImage(r, -dx, -dy); g.drawImage(v, 0, 0); g.drawImage(b, dx, dy);
    g.restore();
  }
  function contorno(g, W, H, fn, { grosor = 7, color = "#1A1226" } = {}) {
    const [c, x] = lienzo("contorno", W, H); x.setTransform(g.getTransform()); fn(x);
    const [m, mx] = lienzo("contornoM", W, H);
    for (let i = 0; i < 12; i++) { const an = (i / 12) * Math.PI * 2; mx.drawImage(c, Math.cos(an) * grosor, Math.sin(an) * grosor); }
    mx.globalCompositeOperation = "source-in"; mx.fillStyle = color; mx.fillRect(0, 0, W, H);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(m, 0, 0); g.drawImage(c, 0, 0); g.restore();
  }

  // ---------------- gráfica ----------------
  const rnd = (s) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  // ráfaga de impacto: estrella blanca dentada con borde de tinta y líneas radiales. k: 0…1+ (resorte)
  function impacto(g, x, y, r, k, { semilla = 1, puntas = 14, relleno = "#FFFDF6", tinta = "#1A1226", lineas = true } = {}) {
    if (k <= 0) return;
    g.save(); g.translate(x, y); g.scale(k, k);
    if (lineas) {
      g.strokeStyle = tinta; g.lineCap = "round";
      for (let i = 0; i < 28; i++) { const an = (i / 28) * Math.PI * 2 + rnd(semilla + i) * 0.12, r0 = r * (1.05 + 0.25 * rnd(i + semilla * 3)), r1 = r * (1.6 + 0.6 * rnd(i * 7 + semilla));
        g.lineWidth = r * 0.025 * (1 + rnd(i)); g.beginPath(); g.moveTo(Math.cos(an) * r0, Math.sin(an) * r0); g.lineTo(Math.cos(an) * r1, Math.sin(an) * r1); g.stroke(); }
    }
    g.beginPath();
    for (let i = 0; i < puntas * 2; i++) { const an = (i / (puntas * 2)) * Math.PI * 2, rr = i % 2 ? r * (0.55 + 0.12 * rnd(i + semilla)) : r * (0.92 + 0.18 * rnd(i * 3 + semilla)); g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); }
    g.closePath(); g.fillStyle = relleno; g.fill(); g.lineWidth = r * 0.045; g.strokeStyle = tinta; g.lineJoin = "miter"; g.stroke();
    g.restore();
  }
  // líneas de foco (manga/cómic): radiales hacia (x, y), desde fuera del cuadro
  function lineasFoco(g, W, H, x, y, { n = 70, hueco = 380, a = 0.85, color = "#1A1226", semilla = 2 } = {}) {
    g.save(); g.globalAlpha = a; g.fillStyle = color;
    const R = Math.hypot(W, H);
    for (let i = 0; i < n; i++) {
      const an = (i / n) * Math.PI * 2 + rnd(i + semilla) * 0.05, w = 0.004 + 0.01 * rnd(i * 5 + semilla), r0 = hueco * (1 + 0.35 * rnd(i * 11 + semilla));
      g.beginPath(); g.moveTo(x + Math.cos(an) * r0, y + Math.sin(an) * r0);
      g.lineTo(x + Math.cos(an - w) * R, y + Math.sin(an - w) * R); g.lineTo(x + Math.cos(an + w) * R, y + Math.sin(an + w) * R); g.closePath(); g.fill();
    }
    g.restore();
  }
  // onomatopeya: Bangers con contorno de tinta grueso, sombra corrida y letras con giro propio
  function onomatopeya(g, txt, x, y, { px = 160, relleno = "#FFD23F", tinta = "#1A1226", sombra = "#FF2E88", rot = -0.08, k = 1, semilla = 3 } = {}) {
    if (k <= 0) return;
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
    g.font = `${px}px Bangers`; g.textBaseline = "middle"; g.textAlign = "left"; g.lineJoin = "round";
    const letras = [...txt], ws = letras.map((l) => g.measureText(l).width), tot = ws.reduce((a, b) => a + b, 0);
    let cx = -tot / 2;
    letras.forEach((l, i) => {
      const lx = cx + ws[i] / 2, ly = (rnd(i + semilla) - 0.5) * px * 0.12, lr = (rnd(i * 3 + semilla) - 0.5) * 0.22;
      g.save(); g.translate(lx, ly); g.rotate(lr); g.textAlign = "center";
      g.lineWidth = px * 0.16; g.strokeStyle = tinta; g.fillStyle = sombra; g.strokeText(l, px * 0.06, px * 0.07); g.fillText(l, px * 0.06, px * 0.07);
      g.strokeText(l, 0, 0); g.fillStyle = relleno; g.fillText(l, 0, 0);
      g.restore(); cx += ws[i];
    });
    g.restore();
  }
  // caja de narrador: amarilla, borde de tinta, letra de cómic en mayúsculas (puede ir en varias líneas)
  function cajaNarrador(g, lineas, x, y, { px = 54, fondo = "#FFE14D", tinta = "#1A1226", rot = -0.02, k = 1, ancho = null } = {}) {
    if (k <= 0) return;
    const L = Array.isArray(lineas) ? lineas : [lineas];
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
    g.font = `${px}px Bangers`; const w = ancho || Math.max(...L.map((s) => g.measureText(s.toUpperCase()).width)) + px * 1.1, h = L.length * px * 1.08 + px * 0.7;
    g.fillStyle = tinta; g.fillRect(-w / 2 + px * 0.16, -h / 2 + px * 0.2, w, h);
    g.fillStyle = fondo; g.fillRect(-w / 2, -h / 2, w, h); g.lineWidth = px * 0.09; g.strokeStyle = tinta; g.strokeRect(-w / 2, -h / 2, w, h);
    g.fillStyle = tinta; g.textAlign = "center"; g.textBaseline = "middle";
    L.forEach((s, i) => g.fillText(s.toUpperCase(), 0, -h / 2 + px * 0.35 + px * 1.08 * (i + 0.5)));
    g.restore();
  }
  // viñeta: dibuja fn recortado a un cuadro con borde de tinta (calle blanca alrededor si se pide)
  function vineta(g, x, y, w, h, fn, { borde = 10, tinta = "#1A1226", rot = 0 } = {}) {
    g.save(); g.translate(x + w / 2, y + h / 2); g.rotate(rot); g.translate(-w / 2, -h / 2);
    g.save(); g.beginPath(); g.rect(0, 0, w, h); g.clip(); fn(g); g.restore();
    g.lineWidth = borde; g.strokeStyle = tinta; g.strokeRect(0, 0, w, h);
    g.restore();
  }
  // viñeta de forma libre (diagonales): recorta al polígono, dibuja fn y entinta el borde con SU propio Path2D
  // (con g.stroke() a secas se trazaría la última figura que dibujó fn, no el polígono)
  function vinetaPoligono(g, pts, fn, { borde = 10, tinta = "#1A1226" } = {}) {
    const p = new Path2D(); pts.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y))); p.closePath();
    g.save(); g.clip(p); fn(g); g.restore();
    g.save(); g.lineWidth = borde; g.strokeStyle = tinta; g.lineJoin = "miter"; g.stroke(p); g.restore();
  }
  // fondo de puntos Ben-Day: degradado hecho de puntos que crecen hacia un lado
  function fondoPuntos(g, x, y, w, h, base, punto, { celda = 22, desde = 0.05, hasta = 0.5, vertical = true } = {}) {
    g.save(); g.fillStyle = base; g.fillRect(x, y, w, h); g.fillStyle = punto;
    for (let j = 0; j * celda < h + celda; j++) for (let i = 0; i * celda < w + celda; i++) {
      const u = vertical ? (j * celda) / h : (i * celda) / w, r = celda * (desde + (hasta - desde) * Math.min(1, Math.max(0, u)));
      if (r < 0.6) continue;
      g.beginPath(); g.arc(x + i * celda + (j % 2) * celda / 2, y + j * celda, r, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }

  // ---------------- entintado a mano ----------------
  // trazo de pincel: polígono que sigue la línea, con ancho sin(π·u) (puntas finas, centro lleno). Puro: se prueba.
  function pincelPoligono(pts, w) {
    const n = pts.length, L = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], m = Math.hypot(dx, dy) || 1;
      const nx = -dy / m, ny = dx / m, h = (w / 2) * Math.sin(Math.PI * (n > 1 ? i / (n - 1) : 0.5));
      L.push([pts[i][0] + nx * h, pts[i][1] + ny * h]); R.push([pts[i][0] - nx * h, pts[i][1] - ny * h]);
    }
    return [...L, ...R.reverse()];
  }
  function pincel(g, pts, w, color = "#120A1E") {
    const poli = pincelPoligono(pts, w);
    g.beginPath(); poli.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fillStyle = color; g.fill();
  }
  // salpicadura de tinta: [x, y, radio] relativos al centro; la primera es la mancha central. Pura y determinista.
  function salpicadura(semilla, n, r) {
    const out = [[0, 0, r * 0.32]];
    for (let i = 1; i < n; i++) {
      const an = rnd(semilla * 31 + i) * Math.PI * 2, d = r * (0.25 + 0.75 * Math.sqrt(rnd(semilla * 17 + i * 3)));
      out.push([Math.cos(an) * d, Math.sin(an) * d, r * (0.015 + 0.09 * (1 - d / r) * rnd(semilla + i * 7) + 0.01)]);
    }
    return out;
  }
  function manchas(g, x, y, r, { semilla = 1, n = 26, color = "#120A1E", k = 1 } = {}) {
    if (k <= 0) return;
    g.save(); g.translate(x, y); g.scale(k, k); g.fillStyle = color;
    for (const [px, py, pr] of salpicadura(semilla, n, r)) { g.beginPath(); g.arc(px, py, pr, 0, Math.PI * 2); g.fill(); }
    // chorreones de la mancha central
    for (let i = 0; i < 7; i++) { const an = rnd(semilla * 5 + i) * Math.PI * 2, l = r * (0.45 + 0.4 * rnd(semilla + i * 11)); pincel(g, [[0, 0], [Math.cos(an) * l * 0.5, Math.sin(an) * l * 0.5], [Math.cos(an) * l, Math.sin(an) * l]], r * 0.12, color); }
    g.restore();
  }
  // luz de borde de color: la silueta de lo que dibuja fn, corrida (dx, dy) en píxeles reales, por detrás del dibujo
  function luzBorde(g, W, H, fn, { color = "#00D1FF", dx = -5, dy = -3 } = {}) {
    const [c, x] = lienzo("luzBorde", W, H); x.setTransform(g.getTransform()); fn(x);
    const [m, mx] = lienzo("luzBordeM", W, H); mx.drawImage(c, 0, 0); mx.globalCompositeOperation = "source-in"; mx.fillStyle = color; mx.fillRect(0, 0, W, H);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(m, dx, dy); g.drawImage(c, 0, 0); g.restore();
  }
  // globo de diálogo: blanco con borde de tinta y cola hacia (cx, cy) en coordenadas del globo
  function globo(g, lineas, x, y, { px = 44, cola = [-60, 120], tinta = "#120A1E", fondo = "#FFFFFF", k = 1, grito = false } = {}) {
    if (k <= 0) return;
    const L = Array.isArray(lineas) ? lineas : [lineas];
    g.save(); g.translate(x, y); g.scale(k, k); g.font = `${px}px Bangers`;
    const w = Math.max(...L.map((s) => g.measureText(s.toUpperCase()).width)) / 2 + px * 0.9, h = (L.length * px * 1.05) / 2 + px * 0.7;
    g.beginPath();
    if (grito) { for (let i = 0; i < 28; i++) { const an = (i / 28) * Math.PI * 2, rr = i % 2 ? 1.18 : 0.98; g.lineTo(Math.cos(an) * w * rr, Math.sin(an) * h * rr); } g.closePath(); }
    else g.ellipse(0, 0, w, h, 0, 0, Math.PI * 2);
    const an = Math.atan2(cola[1], cola[0]), base = 0.22;
    g.moveTo(Math.cos(an - base) * w * 0.9, Math.sin(an - base) * h * 0.9); g.lineTo(cola[0], cola[1]); g.lineTo(Math.cos(an + base) * w * 0.9, Math.sin(an + base) * h * 0.9);
    g.fillStyle = fondo; g.fill("nonzero"); g.lineWidth = px * 0.09; g.lineJoin = "round"; g.strokeStyle = tinta; g.stroke();
    g.fillStyle = fondo; g.beginPath(); g.ellipse(0, 0, w * 0.95, h * 0.9, 0, 0, Math.PI * 2); if (!grito) g.fill();
    g.fillStyle = tinta; g.textAlign = "center"; g.textBaseline = "middle";
    L.forEach((s, i) => g.fillText(s.toUpperCase(), 0, (i - (L.length - 1) / 2) * px * 1.05));
    g.restore();
  }

  // patrón de puntos Ben-Day para D.cfg.trama: celda y radio en píxeles de pantalla; `escala` = escala del contexto
  // en el momento de dibujar (así los puntos no engordan con un primer plano)
  const _tiles = {};
  function patronPuntos(g, { celda = 9, radio = 2.6, color = "rgba(18,10,30,0.42)", escala = 1 } = {}) {
    const k = `${celda}|${radio}|${color}`;
    let t = _tiles[k];
    if (!t) {
      t = document.createElement("canvas"); t.width = celda * 2; t.height = celda * 2; const x = t.getContext("2d"); x.fillStyle = color;
      for (const [cx, cy] of [[celda / 2, celda / 2], [celda * 1.5, celda * 1.5]]) { x.beginPath(); x.arc(cx, cy, radio, 0, Math.PI * 2); x.fill(); }
      _tiles[k] = t;
    }
    const pat = g.createPattern(t, "repeat"); pat.setTransform(new DOMMatrix().scaleSelf(1 / escala)); return pat;
  }

  const api = { aDos, luminancia, radioPunto, desfase, semitono, separar, contorno, impacto, lineasFoco, onomatopeya, cajaNarrador, vineta, fondoPuntos, pincelPoligono, pincel, salpicadura, manchas, luzBorde, globo, patronPuntos, vinetaPoligono };
  g0.COMIC = api;
  if (typeof module !== "undefined") module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
