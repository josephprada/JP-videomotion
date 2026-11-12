// Collage de archivo (estilo Vox y afines): papel envejecido, recortes con borde rasgado, marcador amarillo, etiquetas mono,
// círculos a mano, retícula de mapa e imágenes de archivo (monocromo sepia con contraste). Requiere nucleo/lib/motion.js (M).
// Lo puro se prueba en node; lo demás dibuja en canvas, en coordenadas de diseño (dentro de P.dis). Determinista: todo con semilla.
//   const fondo = COLLAGE.papel(1080, 1920, { semilla: 3 });          → lienzo para drawImage (se guarda en caché)
//   COLLAGE.recorte(g, 140, 400, 800, 560, (g, x, y, w, h) => g.drawImage(COLLAGE.archivo(img), x, y, w, h), { rot: -0.03 })
//   COLLAGE.rotulo(g, "14×", 200, 900, k, { font: "120px Anton" })   k = 0..1 revela el marcador y el texto
//   COLLAGE.etiqueta(g, "Groenlandia, tamaño real", 620, 1200, { linea: [520, 1100], k })
//   COLLAGE.circulo(g, 540, 700, 220, 150, k)                          círculo a lápiz rojo que se dibuja
(function (g0) {
  const M = g0.M;

  // ---- puro ----
  // Contorno rasgado de un rectángulo: puntos cada `paso` sobre el perímetro, movidos hasta ±amp por la normal
  function bordeRasgado(semilla, x, y, w, h, { paso = 14, amp = 5 } = {}) {
    const r = M.rng(semilla * 131 + 7), pts = [];
    const lados = [[x, y, 1, 0, w, 0, -1], [x + w, y, 0, 1, h, 1, 0], [x + w, y + h, -1, 0, w, 0, 1], [x, y + h, 0, -1, h, -1, 0]];
    for (const [sx, sy, dx, dy, largo, nx, ny] of lados) {
      const n = Math.max(1, Math.round(largo / paso));
      for (let i = 0; i < n; i++) {
        const d = (i / n) * largo, o = (r() - 0.5) * 2 * amp * (r() < 0.2 ? 1 : 0.45);
        pts.push([sx + dx * d + nx * o, sy + dy * d + ny * o]);
      }
    }
    return pts;
  }

  // Elipse trazada a mano hasta la fracción k: empieza arriba a la izquierda, tiembla un poco y se pasa de una vuelta
  function trazoMano(cx, cy, rx, ry, k, { semilla = 1, vueltas = 1.15, pasos = 96, temblor = 0.05 } = {}) {
    const n = Math.floor(pasos * vueltas * M.clamp(k));
    const a0 = -2.3, pts = [];
    for (let i = 0; i <= n && n > 0; i++) {
      const u = i / pasos, a = a0 + u * Math.PI * 2;
      const f = 1 + temblor * M.noise(semilla, u * 5) + 0.05 * u;   // el final no cae sobre el principio
      pts.push([cx + Math.cos(a) * rx * f, cy + Math.sin(a) * ry * f]);
    }
    return pts;
  }

  // Tono de archivo para un píxel: luminancia con contraste, tinta que nunca es negro puro, virado sepia
  function tonoArchivo(r, g, b, { contraste = 1.35, sepia = [1.07, 0.96, 0.8], tinta = 22, luz = 236 } = {}) {
    let l = 0.299 * r + 0.587 * g + 0.114 * b;
    l = M.clamp((l - 128) * contraste + 128, 0, 255);
    const v = tinta + (l * (luz - tinta)) / 255;
    return sepia.map((s) => Math.round(M.clamp(v * s, 0, 255)));
  }

  // ---- dibujo ----
  const cacheP = new Map();
  // Papel envejecido: manchas suaves, fibras y bordes tostados. Se genera una vez a 1/3 de resolución (se ve igual, cuesta 9 veces menos).
  function papel(W, H, { semilla = 3, color = [233, 221, 194], tostado = 0.38 } = {}) {
    const clave = [W, H, semilla, color, tostado].join();
    if (cacheP.has(clave)) return cacheP.get(clave);
    const w = Math.ceil(W / 3), h = Math.ceil(H / 3), c = document.createElement("canvas"); c.width = w; c.height = h;
    const x = c.getContext("2d"), im = x.createImageData(w, h), r = M.rng(semilla);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const manchas = M.noise(semilla + 1, i / 70 + j * 0.0131) * 0.6 + M.noise(semilla + 2, j / 55 + i * 0.0177) * 0.4;
      const fibra = M.noise(semilla + 3, i / 1.7 + j * 0.31) * 0.5;
      const dx = (i / w - 0.5) * 2, dy = (j / h - 0.5) * 2, borde = Math.pow(Math.min(1, Math.hypot(dx * 0.9, dy * 0.8)), 3.2);
      const k = 1 + manchas * 0.06 + fibra * 0.025 + (r() - 0.5) * 0.03 - borde * tostado;
      const p = (j * w + i) * 4;
      im.data[p] = color[0] * k; im.data[p + 1] = color[1] * k * (1 - borde * 0.05); im.data[p + 2] = color[2] * k * (1 - borde * 0.14); im.data[p + 3] = 255;
    }
    x.putImageData(im, 0, 0);
    cacheP.set(clave, c);
    return c;
  }

  const trazar = (g, pts) => { g.beginPath(); g.moveTo(...pts[0]); for (const p of pts.slice(1)) g.lineTo(...p); };
  const esc = (g) => Math.hypot(g.getTransform().a, g.getTransform().b);

  // Recorte de papel con borde rasgado, sombra y contenido (fn recibe g y la caja interior)
  function recorte(g, x, y, w, h, fn, { semilla = 1, rot = 0, margen = 16, papel: fondo = "#F4EEDF", sombra = "rgba(40,25,10,0.42)" } = {}) {
    g.save(); g.translate(x + w / 2, y + h / 2); g.rotate(rot); g.translate(-(x + w / 2), -(y + h / 2));
    const borde = bordeRasgado(semilla, x, y, w, h, { paso: 12, amp: 5 });
    g.save(); g.shadowColor = sombra; g.shadowBlur = 26 * esc(g); g.shadowOffsetY = 12 * esc(g);
    g.fillStyle = fondo; trazar(g, borde); g.closePath(); g.fill(); g.restore();
    if (fn) { g.save(); g.beginPath(); g.rect(x + margen, y + margen, w - margen * 2, h - margen * 2); g.clip(); fn(g, x + margen, y + margen, w - margen * 2, h - margen * 2); g.restore(); }
    g.restore();
  }

  // Trazo de marcador de x a x + w·k (bordes irregulares, color multiplicado sobre el papel)
  function marcador(g, x, y, w, h, k, { color = "#FFD21F", semilla = 2 } = {}) {
    if (k <= 0) return;
    const r = M.rng(semilla), n = 10, ancho = w * M.clamp(k), sup = [], inf = [];
    for (let i = 0; i <= n; i++) { const px = x + (ancho * i) / n; sup.push([px, y + (r() - 0.5) * h * 0.08]); inf.push([px, y + h + (r() - 0.5) * h * 0.08]); }
    g.save(); g.globalCompositeOperation = "multiply"; g.fillStyle = color;
    trazar(g, [...sup, ...inf.reverse()]); g.closePath(); g.fill(); g.restore();
  }

  // Rótulo: marcador detrás + texto negro revelado con él. (x, y) = esquina superior izquierda. Devuelve el ancho.
  function rotulo(g, texto, x, y, k, { font = "96px Anton", tinta = "#141110", fondo = "#FFD21F", pad = 0.22, semilla = 2 } = {}) {
    g.save(); g.font = font;
    const m = g.measureText(texto), alto = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent, p = alto * pad;
    const w = m.width + p * 2, h = alto + p * 2;
    marcador(g, x, y, w, h, k, { color: fondo, semilla });
    g.beginPath(); g.rect(x, y - h, w * M.clamp(k * 1.08), h * 3); g.clip();
    g.fillStyle = tinta; g.textBaseline = "alphabetic"; g.textAlign = "left";
    g.fillText(texto, x + p, y + p + m.actualBoundingBoxAscent);
    g.restore();
    return w;
  }

  // Etiqueta mono en mayúsculas, subrayada; linea = [x, y] de lo que señala: la guía sale del extremo del subrayado más
  // cercano y se dibuja con k. (x, y) = inicio del subrayado (el texto va encima).
  function etiqueta(g, texto, x, y, { font = "500 26px 'IBM Plex Mono'", color = "#2B2118", linea = null, k = 1, espacio = 3 } = {}) {
    if (k <= 0) return;
    g.save(); g.globalAlpha *= M.clamp(k * 2);
    g.font = font; g.letterSpacing = `${espacio}px`;
    const t = texto.toUpperCase(), w = g.measureText(t).width;
    g.strokeStyle = color; g.fillStyle = color; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + w * M.clamp(k * 1.5), y); g.stroke();
    if (linea) {
      const o = Math.abs(linea[0] - x) < Math.abs(linea[0] - (x + w)) ? [x, y] : [x + w, y];
      const q = [o[0] + (linea[0] - o[0]) * M.clamp(k), o[1] + (linea[1] - o[1]) * M.clamp(k)];
      g.beginPath(); g.moveTo(...o); g.lineTo(...q); g.stroke();
      g.beginPath(); g.arc(...q, 4, 0, Math.PI * 2); g.fill();
    }
    g.textBaseline = "bottom"; g.textAlign = "left";
    g.fillText(t, x, y - 8);
    g.restore();
  }

  // Círculo a lápiz que se dibuja hasta k
  function circulo(g, cx, cy, rx, ry, k, { color = "#C8361D", ancho = 7, semilla = 1 } = {}) {
    const p = trazoMano(cx, cy, rx, ry, k, { semilla });
    if (p.length < 2) return;
    g.save(); g.strokeStyle = color; g.lineWidth = ancho; g.lineCap = "round"; g.lineJoin = "round"; g.globalAlpha *= 0.92;
    trazar(g, p); g.stroke(); g.restore();
  }

  // Retícula de mapa: meridianos regulares y paralelos con el estiramiento de Mercator hacia los polos
  function reticula(g, x, y, w, h, { meridianos = 12, paralelos = 6, color = "rgba(70,45,20,0.28)", ancho = 1.5 } = {}) {
    g.save(); g.strokeStyle = color; g.lineWidth = ancho; g.beginPath();
    for (let i = 0; i <= meridianos; i++) { const px = x + (w * i) / meridianos; g.moveTo(px, y); g.lineTo(px, y + h); }
    const yMax = Math.log(Math.tan(Math.PI / 4 + (80 * Math.PI) / 360));
    for (let j = -paralelos; j <= paralelos; j++) {
      const lat = (j / paralelos) * 80 * (Math.PI / 180), my = Math.log(Math.tan(Math.PI / 4 + lat / 2));
      const py = y + h / 2 - (my / yMax) * (h / 2); g.moveTo(x, py); g.lineTo(x + w, py);
    }
    g.stroke(); g.restore();
  }

  // Imagen de archivo: copia de la imagen en monocromo sepia con contraste (en caché por imagen). Requiere mismo origen (servidor local).
  const cacheA = new WeakMap();
  function archivo(img, op = {}) {
    if (cacheA.has(img)) return cacheA.get(img);
    const c = document.createElement("canvas"); c.width = img.naturalWidth || img.width; c.height = img.naturalHeight || img.height;
    const x = c.getContext("2d", { willReadFrequently: true }); x.drawImage(img, 0, 0);
    const im = x.getImageData(0, 0, c.width, c.height), d = im.data;
    for (let i = 0; i < d.length; i += 4) { const [r, gg, b] = tonoArchivo(d[i], d[i + 1], d[i + 2], op); d[i] = r; d[i + 1] = gg; d[i + 2] = b; }
    x.putImageData(im, 0, 0); cacheA.set(img, c);
    return c;
  }

  const api = { bordeRasgado, trazoMano, tonoArchivo, papel, recorte, marcador, rotulo, etiqueta, circulo, reticula, archivo };
  g0.COLLAGE = api;
  if (typeof module !== "undefined") module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
