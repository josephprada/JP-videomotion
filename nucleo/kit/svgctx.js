// Contexto de dibujo que graba SVG en vez de píxeles: el mismo código del canvas exporta el catálogo vectorial.
// Cubre lo que usan dibujo.js y los personajes: transformaciones, fill/stroke/clip con Path2D (D.P guarda la cadena en __d),
// arc/ellipse/rect/moveTo/lineTo/curvas, fillRect, fillText, degradados lineales/radiales, globalAlpha y lineDash.
//   const s = new SVGCtx(1200, 1600); dibujar(s); const svg = s.toString();
(function (g0) {
  const f = (n) => +(+n).toFixed(2);
  const mul = (a, b) => [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3], a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const medidor = typeof document !== "undefined" ? document.createElement("canvas").getContext("2d") : null;
  let uid = 0;

  class Grad {
    constructor(tipo, args) { this.tipo = tipo; this.args = args; this.stops = []; }
    addColorStop(o, c) { this.stops.push([o, c]); }
  }

  class SVGCtx {
    constructor(w, h) {
      this.canvas = { width: w, height: h }; this.w = w; this.h = h;
      this.defs = []; this.out = [];
      this.st = { m: [1, 0, 0, 1, 0, 0], fillStyle: "#000", strokeStyle: "#000", lineWidth: 1, lineCap: "butt", lineJoin: "miter", globalAlpha: 1, font: "10px sans-serif", textAlign: "start", textBaseline: "alphabetic", dash: [], clips: 0 };
      this.pila = []; this.cam = null;
      this.globalCompositeOperation = "source-over"; this.filter = "none"; this.imageSmoothingEnabled = true;
    }
    // ---- estado ----
    save() { this.pila.push({ ...this.st, m: this.st.m.slice(), dash: this.st.dash.slice(), clips: 0 }); }
    restore() { for (let i = 0; i < this.st.clips; i++) this.out.push("</g>"); const s = this.pila.pop(); if (s) this.st = s; }
    get fillStyle() { return this.st.fillStyle; } set fillStyle(v) { this.st.fillStyle = v; }
    get strokeStyle() { return this.st.strokeStyle; } set strokeStyle(v) { this.st.strokeStyle = v; }
    get lineWidth() { return this.st.lineWidth; } set lineWidth(v) { this.st.lineWidth = v; }
    get lineCap() { return this.st.lineCap; } set lineCap(v) { this.st.lineCap = v; }
    get lineJoin() { return this.st.lineJoin; } set lineJoin(v) { this.st.lineJoin = v; }
    get globalAlpha() { return this.st.globalAlpha; } set globalAlpha(v) { this.st.globalAlpha = v; }
    get font() { return this.st.font; } set font(v) { this.st.font = v; }
    get textAlign() { return this.st.textAlign; } set textAlign(v) { this.st.textAlign = v; }
    get textBaseline() { return this.st.textBaseline; } set textBaseline(v) { this.st.textBaseline = v; }
    setLineDash(d) { this.st.dash = d.slice(); }
    // ---- transformaciones ----
    transform(a, b, c, d, e, f2) { this.st.m = mul(this.st.m, [a, b, c, d, e, f2]); }
    setTransform(a, b, c, d, e, f2) { if (typeof a === "object") ({ a, b, c, d, e, f: f2 } = a); this.st.m = [a, b, c, d, e, f2]; }
    resetTransform() { this.st.m = [1, 0, 0, 1, 0, 0]; }
    translate(x, y) { this.transform(1, 0, 0, 1, x, y); }
    scale(x, y) { this.transform(x, 0, 0, y, 0, 0); }
    rotate(a) { const c = Math.cos(a), s = Math.sin(a); this.transform(c, s, -s, c, 0, 0); }
    tm() { return `matrix(${this.st.m.map(f).join(" ")})`; }
    // ---- trazados sueltos (beginPath…) ----
    beginPath() { this.cam = { d: "", m: this.st.m.slice() }; }
    _p(s) { if (!this.cam) this.beginPath(); this.cam.d += s; }
    moveTo(x, y) { this._p(`M${f(x)} ${f(y)}`); }
    lineTo(x, y) { this._p(`L${f(x)} ${f(y)}`); }
    quadraticCurveTo(a, b, x, y) { this._p(`Q${f(a)} ${f(b)} ${f(x)} ${f(y)}`); }
    bezierCurveTo(a, b, c, d, x, y) { this._p(`C${f(a)} ${f(b)} ${f(c)} ${f(d)} ${f(x)} ${f(y)}`); }
    closePath() { this._p("Z"); }
    rect(x, y, w, h) { this._p(`M${f(x)} ${f(y)}h${f(w)}v${f(h)}h${f(-w)}Z`); }
    arc(x, y, r, a0, a1, ccw) { this.ellipse(x, y, r, r, 0, a0, a1, ccw); }
    ellipse(x, y, rx, ry, rot, a0, a1, ccw) {
      const full = Math.abs(a1 - a0) >= Math.PI * 2 - 1e-6;
      if (full) { this._p(`M${f(x + rx)} ${f(y)}A${f(rx)} ${f(ry)} 0 1 0 ${f(x - rx)} ${f(y)}A${f(rx)} ${f(ry)} 0 1 0 ${f(x + rx)} ${f(y)}Z`); return; }
      // arco parcial: polilínea fina (solo lo usan trazos decorativos)
      const n = 24, pts = [];
      for (let i = 0; i <= n; i++) {
        const a = a0 + ((a1 - a0) * i) / n, px = rx * Math.cos(a), py = ry * Math.sin(a);
        pts.push([x + px * Math.cos(rot) - py * Math.sin(rot), y + px * Math.sin(rot) + py * Math.cos(rot)]);
      }
      this._p((this.cam && this.cam.d ? "L" : "M") + pts.map((p) => `${f(p[0])} ${f(p[1])}`).join("L"));
    }
    // ---- pintura ----
    _pintura(v) {
      if (typeof v === "string") return esc(v);
      if (v instanceof Grad) {
        const id = "gr" + uid++, m = this.tm(), stops = v.stops.map(([o, c]) => `<stop offset="${f(o)}" stop-color="${esc(c)}"/>`).join("");
        if (v.tipo === "lineal") { const [x0, y0, x1, y1] = v.args; this.defs.push(`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" gradientTransform="${m}" x1="${f(x0)}" y1="${f(y0)}" x2="${f(x1)}" y2="${f(y1)}">${stops}</linearGradient>`); }
        else { const [x0, y0, r0, x1, y1, r1] = v.args; this.defs.push(`<radialGradient id="${id}" gradientUnits="userSpaceOnUse" gradientTransform="${m}" fx="${f(x0)}" fy="${f(y0)}" fr="${f(r0)}" cx="${f(x1)}" cy="${f(y1)}" r="${f(r1)}">${stops}</radialGradient>`); }
        return `url(#${id})`;
      }
      return "none";
    }
    _d(p) { if (p && p.__d) return { d: p.__d, m: this.st.m }; if (this.cam) return { d: this.cam.d, m: this.cam.m }; return null; }
    _alfa() { return this.st.globalAlpha < 1 ? ` opacity="${f(this.st.globalAlpha)}"` : ""; }
    fill(p) {
      const t = this._d(p); if (!t || !t.d) return;
      const pin = this._pintura(this.st.fillStyle); if (pin === "none") return;
      this.out.push(`<path d="${t.d}" transform="matrix(${t.m.map(f).join(" ")})" fill="${pin}"${this._alfa()}/>`);
    }
    stroke(p) {
      const t = this._d(p); if (!t || !t.d) return;
      const dash = this.st.dash.length ? ` stroke-dasharray="${this.st.dash.join(" ")}"` : "";
      this.out.push(`<path d="${t.d}" transform="matrix(${t.m.map(f).join(" ")})" fill="none" stroke="${this._pintura(this.st.strokeStyle)}" stroke-width="${f(this.st.lineWidth)}" stroke-linecap="${this.st.lineCap}" stroke-linejoin="${this.st.lineJoin}"${dash}${this._alfa()}/>`);
    }
    clip(p) {
      const t = this._d(p); if (!t || !t.d) return;
      const id = "cl" + uid++;
      this.defs.push(`<clipPath id="${id}" clipPathUnits="userSpaceOnUse"><path d="${t.d}" transform="matrix(${t.m.map(f).join(" ")})"/></clipPath>`);
      this.out.push(`<g clip-path="url(#${id})">`); this.st.clips++;
    }
    fillRect(x, y, w, h) { const pin = this._pintura(this.st.fillStyle); if (pin === "none") return; this.out.push(`<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" transform="${this.tm()}" fill="${pin}"${this._alfa()}/>`); }
    clearRect() {}
    strokeRect(x, y, w, h) { this.beginPath(); this.rect(x, y, w, h); this.stroke(); }
    fillText(s, x, y) {
      const m = /(?:(\d+)\s+)?(\d+(?:\.\d+)?)px\s+(.+)/.exec(this.st.font) || []; // el peso, si viene, va separado por espacio
      const peso = m[1] || 400, px = m[2] || 10, fam = (m[3] || "sans-serif").replace(/'/g, "");
      const anc = { center: "middle", right: "end", end: "end" }[this.st.textAlign] || "start";
      const base = { middle: "middle", top: "hanging", hanging: "hanging" }[this.st.textBaseline] || "alphabetic";
      this.out.push(`<text x="${f(x)}" y="${f(y)}" transform="${this.tm()}" font-family="${esc(fam)}" font-weight="${peso}" font-size="${px}" text-anchor="${anc}" dominant-baseline="${base}" fill="${this._pintura(this.st.fillStyle)}"${this._alfa()}>${esc(s)}</text>`);
    }
    measureText(s) { if (!medidor) return { width: s.length * 10 }; medidor.font = this.st.font; return medidor.measureText(s); }
    createLinearGradient(...a) { return new Grad("lineal", a); }
    createRadialGradient(...a) { return new Grad("radial", a); }
    createPattern() { return null; }
    drawImage() {}
    toString() {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.w} ${this.h}" width="${this.w}" height="${this.h}"><defs>${this.defs.join("")}</defs>${this.out.join("")}</svg>`;
    }
  }
  g0.SVGCtx = SVGCtx;
})(typeof globalThis !== "undefined" ? globalThis : window);
