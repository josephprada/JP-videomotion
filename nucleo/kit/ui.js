// Lenguaje de interfaz para explicadores y comparativas: tarjetas, insignias, contadores rodantes, conectores que se
// dibujan y anillos de onda. Requiere nucleo/lib/motion.js (window.M). Lo puro se prueba en node; lo demás dibuja en canvas.
// Todo en coordenadas de diseño (dentro de P.dis). Se combina con FOCO para entrar y salir enfocando.
//   UI.tarjeta(g, 120, 600, 840, 520, { borde: "#B9A6FF", contenido: (g) => … })
//   UI.insignia(g, "Fable 5.2", 300, 580, { punto: "#E8673C" })
//   UI.digitos(g, UI.contador(t, 1.2, 1.4, 0, 237), 3, 540, 1300, { font: "800 120px Inter" })
//   UI.conector(g, [[300, 1150], [300, 1250], [780, 1250]], M.inv(2, 2.6, t))
//   UI.dibujarOnda(g, 540, 900, 260, t, 3.1)
(function (g0) {
  const M = g0.M;

  // ---- puro ----
  // Valor que va de «desde» a «hasta» entre t0 y t0 + dur (sale rápido y frena, como un contador de verdad)
  function contador(t, t0, dur, desde, hasta, { decimales = 0 } = {}) {
    const v = M.lerp(desde, hasta, M.ease.out(M.inv(t0, t0 + dur, t)));
    const f = Math.pow(10, decimales);
    return Math.round(v * f) / f;
  }

  // Posición (0..10, con fracción) de cada columna de un odómetro de n dígitos para el valor continuo v, de izquierda a derecha.
  // Las unidades ruedan con la fracción; cada columna de la izquierda solo rueda cuando todas las de su derecha pasan por 9.
  function odometro(v, n) {
    const cols = [];
    for (let i = 0; i < n; i++) {
      const base = Math.pow(10, i), entero = Math.floor(v / base) % 10;
      const resto = v % base, umbral = base - 1;
      const frac = i === 0 ? v - Math.floor(v) : Math.max(0, resto - umbral);
      cols.unshift(entero + frac);
    }
    return cols;
  }

  // Polilínea recortada a la fracción k de su largo total (para conectores que se dibujan)
  function trazoParcial(pts, k) {
    if (k >= 1) return pts.map((p) => [...p]);
    const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
    let resta = Math.max(0, k) * seg.reduce((s, l) => s + l, 0);
    const out = [[...pts[0]]];
    for (let i = 0; i < seg.length && resta > 1e-9; i++) {
      if (resta >= seg[i] - 1e-9) { out.push([...pts[i + 1]]); resta -= seg[i]; continue; }
      const f = resta / seg[i], a = pts[i], b = pts[i + 1];
      out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]); resta = 0;
    }
    return out;
  }

  // Anillo que se expande y se apaga desde t0: k = radio relativo (0..1), a = opacidad
  function onda(t, t0, { dur = 0.9 } = {}) {
    if (t < t0 || t >= t0 + dur) return { k: 0, a: 0 };
    const u = (t - t0) / dur;
    return { k: M.ease.out(u), a: Math.pow(1 - u, 1.5) };
  }

  // ---- dibujo ----
  const caja = (x, y, w, h, r) => { const p = new Path2D(); p.roundRect(x, y, w, h, r); return p; };

  // Tarjeta flotante: sombra suave abajo, fondo, contenido recortado a las esquinas, borde y brillo opcionales.
  function tarjeta(g, x, y, w, h, { r = 26, fondo = "#FFFFFF", sombra = { col: "rgba(8,28,92,0.38)", blur: 46, dy: 22 }, borde = null, anchoBorde = 3, brillo = null, contenido = null } = {}) {
    const p = caja(x, y, w, h, r);
    g.save();
    if (sombra) { g.shadowColor = sombra.col; g.shadowBlur = sombra.blur * Math.hypot(g.getTransform().a, g.getTransform().b); g.shadowOffsetY = sombra.dy * Math.hypot(g.getTransform().a, g.getTransform().b); }
    g.fillStyle = fondo; g.fill(p);
    g.restore();
    if (contenido) { g.save(); g.clip(p); contenido(g, x, y, w, h); g.restore(); }
    if (brillo) { g.save(); g.shadowColor = brillo; g.shadowBlur = 24 * Math.hypot(g.getTransform().a, g.getTransform().b); g.strokeStyle = brillo; g.lineWidth = anchoBorde; g.stroke(p); g.restore(); }
    if (borde) { g.save(); g.strokeStyle = borde; g.lineWidth = anchoBorde; g.stroke(p); g.restore(); }
  }

  // Insignia tipo píldora centrada en (x, y); punto = color del círculo de la izquierda. Devuelve el ancho.
  function insignia(g, texto, x, y, { font = "600 24px sans-serif", fondo = "#FFFFFF", color = "#3B3F5C", punto = null, alto = 44, borde = "rgba(60,70,120,0.16)" } = {}) {
    g.save(); g.font = font;
    const pad = alto * 0.42, dot = punto ? alto * 0.42 : 0, w = g.measureText(texto).width + pad * 2 + (punto ? dot + pad * 0.5 : 0);
    const x0 = x - w / 2, y0 = y - alto / 2, p = caja(x0, y0, w, alto, alto / 2);
    g.shadowColor = "rgba(8,28,92,0.22)"; g.shadowBlur = 12 * Math.hypot(g.getTransform().a, g.getTransform().b);
    g.fillStyle = fondo; g.fill(p); g.shadowColor = "transparent";
    if (borde) { g.strokeStyle = borde; g.lineWidth = 1.5; g.stroke(p); }
    let tx = x0 + pad;
    if (punto) { g.fillStyle = punto; g.beginPath(); g.arc(tx + dot / 2, y, dot / 2, 0, Math.PI * 2); g.fill(); tx += dot + pad * 0.5; }
    g.fillStyle = color; g.textBaseline = "middle"; g.textAlign = "left"; g.fillText(texto, tx, y + 1);
    g.restore();
    return w;
  }

  // Conector punteado que se dibuja hasta la fracción k; punta = punto brillante donde va el trazo
  function conector(g, pts, k, { color = "rgba(255,255,255,0.85)", ancho = 3, guion = [10, 9], punta = true } = {}) {
    if (k <= 0) return;
    const q = trazoParcial(pts, k);
    g.save(); g.strokeStyle = color; g.lineWidth = ancho; g.setLineDash(guion); g.lineCap = "round";
    g.beginPath(); g.moveTo(...q[0]); for (const p of q.slice(1)) g.lineTo(...p); g.stroke();
    if (punta && k < 1) {
      const [x, y] = q[q.length - 1]; g.setLineDash([]);
      g.shadowColor = color; g.shadowBlur = 14 * Math.hypot(g.getTransform().a, g.getTransform().b);
      g.fillStyle = "#FFFFFF"; g.beginPath(); g.arc(x, y, ancho * 1.8, 0, Math.PI * 2); g.fill();
    }
    g.restore();
  }

  // Anillo de onda (selección, «ganador») de radio R alrededor de (x, y)
  function dibujarOnda(g, x, y, R, t, t0, { dur = 0.9, color = "255,255,255", ancho = 3 } = {}) {
    const o = onda(t, t0, { dur });
    if (o.a <= 0) return;
    g.save(); g.strokeStyle = `rgba(${color},${o.a * 0.9})`; g.lineWidth = ancho;
    g.beginPath(); g.arc(x, y, R * (0.35 + 0.65 * o.k), 0, Math.PI * 2); g.stroke();
    g.restore();
  }

  // Odómetro: n columnas de dígitos que ruedan (valor continuo v). (x, y) = centro; fondo = cajita detrás de cada dígito.
  function digitos(g, v, n, x, y, { font = "800 120px sans-serif", color = "#1E3A8A", alto = 150, ancho = 104, sep = 14, fondo = "#FFFFFF", r = 18 } = {}) {
    const cols = odometro(v, n), total = n * ancho + (n - 1) * sep;
    g.save(); g.font = font; g.textAlign = "center"; g.textBaseline = "middle";
    cols.forEach((p, i) => {
      const cx = x - total / 2 + i * (ancho + sep), cy = y - alto / 2, box = caja(cx, cy, ancho, alto, r);
      if (fondo) { g.save(); g.shadowColor = "rgba(8,28,92,0.25)"; g.shadowBlur = 18 * Math.hypot(g.getTransform().a, g.getTransform().b); g.fillStyle = fondo; g.fill(box); g.restore(); }
      g.save(); g.clip(box); g.fillStyle = color;
      const d = Math.floor(p) % 10, f = p - Math.floor(p);
      g.fillText(String(d), cx + ancho / 2, y - f * alto);
      if (f > 0.001) g.fillText(String((d + 1) % 10), cx + ancho / 2, y + (1 - f) * alto);
      g.restore();
    });
    g.restore();
  }

  const api = { contador, odometro, trazoParcial, onda, tarjeta, insignia, conector, dibujarOnda, digitos };
  g0.UI = api;
  if (typeof module !== "undefined") module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
