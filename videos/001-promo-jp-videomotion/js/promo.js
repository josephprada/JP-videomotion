// Código compartido de las escenas de la promo (clásico, después de js/marca.js y js/escena.js).
//   PROMO.paso(W, H)                      punto de paso del corte por coincidencia: { x, y, r }
//   PROMO.piel(t, dur)                    estado FOCO de la piel: entra enfocándose y sale desenfocada (0,25 s)
//   PROMO.viaje(t, dur, destino, o)       el punto: sale del punto de paso, va a su papel en la piel y vuelve al final
//   PROMO.miniatura(g, i, x, y, w, h, t)  las seis pieles en miniatura (mosaico final y formatos)
(function (g0) {
  const { inv, lerp, spring } = M;
  const SALE = 0.25;
  const paso = (W, H) => ({ x: W / 2, y: H * 0.47, r: W < H ? 28 : 24 });
  const piel = (t, dur, o = {}) => FOCO.estado(t, { entra: 0, sale: dur - SALE, dur: SALE, blur: 18, escala: 0.06, ...o });
  // destino: { x, y, r } en diseño; llega con resorte desde el paso y regresa en los últimos 0,3 s
  function viaje(t, dur, destino, { llega = 0, regresa = dur - 0.3, k = [170, 20] } = {}, W = 1080, H = 1920) {
    const p = paso(W, H);
    const ida = M.clamp(spring(t - llega, ...k), 0, 1.15), vuelta = M.ease.inOut(inv(regresa, dur, t));
    const x = lerp(lerp(p.x, destino.x, ida), p.x, vuelta), y = lerp(lerp(p.y, destino.y, ida), p.y, vuelta);
    const r = lerp(lerp(p.r, destino.r ?? p.r, Math.min(1, ida)), p.r, vuelta);
    return { x, y, r };
  }

  // ---------------- miniaturas de las pieles (mismo dibujo que diseno/look.html) ----------------
  const C = MARCA.C;
  const PIELES = ["TARJETAS", "VOX", "CÓMIC", "CAPAS", "PLANO", "TIPOGRÁFICO"];
  function miniatura(g, i, x, y, w, h, t = 0, { punto = true } = {}) {
    const s = Math.min(w / 310, h / 170);
    const P = (fx, fy, r, o) => punto && MARCA.punto(g, x + w * fx, y + h * fy, r * s, o);
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    if (i === 0) {
      const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, "#5C9BF0"); gr.addColorStop(1, "#1D55C4"); g.fillStyle = gr; g.fillRect(x, y, w, h);
      g.fillStyle = "#FFFFFF"; g.beginPath(); g.roundRect(x + w * 0.13, y + h * 0.2, w * 0.74, h * 0.6, 18 * s); g.fill();
      g.fillStyle = "#1B2A55"; g.font = `800 ${Math.round(44 * s)}px Inter, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("06", x + w * 0.45, y + h * 0.52);
      P(0.78, 0.33, 15, { brillo: 0 });
    } else if (i === 1) {
      g.fillStyle = "rgb(233,221,194)"; g.fillRect(x, y, w, h);
      g.strokeStyle = "rgba(90,70,50,0.35)"; g.lineWidth = 1;
      for (let k = 1; k < 6; k++) { g.beginPath(); g.moveTo(x + k * w / 6, y); g.lineTo(x + k * w / 6, y + h); g.stroke(); g.beginPath(); g.moveTo(x, y + k * h / 6); g.lineTo(x + w, y + k * h / 6); g.stroke(); }
      P(0.55, 0.5, 13, { brillo: 0 });
      g.strokeStyle = C.rojo; g.lineWidth = 4 * s; g.beginPath(); g.ellipse(x + w * 0.55, y + h * 0.5, 36 * s, 30 * s, -0.2, 0.3, Math.PI * 2.1); g.stroke();
    } else if (i === 2) {
      g.fillStyle = "#1B2346"; g.fillRect(x, y, w, h); g.fillStyle = "#FFD23F"; g.fillRect(x + 14 * s, y + 14 * s, w - 28 * s, h - 28 * s);
      g.fillStyle = "rgba(0,0,0,0.12)"; for (let a = 0; a < w / (16 * s); a++) for (let b = 0; b < h / (14 * s); b++) { g.beginPath(); g.arc(x + 24 * s + a * 16 * s, y + 24 * s + b * 14 * s, 3 * s, 0, 7); g.fill(); }
      g.strokeStyle = "#111"; g.lineWidth = 6 * s; g.strokeRect(x + 14 * s, y + 14 * s, w - 28 * s, h - 28 * s);
      P(0.5, 0.52, 24, { brillo: 0 }); g.lineWidth = 5 * s; g.beginPath(); g.arc(x + w * 0.5, y + h * 0.52, 24 * s, 0, 7); g.stroke();
    } else if (i === 3) {
      const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, "#26286A"); gr.addColorStop(0.75, "#F4A57C"); g.fillStyle = gr; g.fillRect(x, y, w, h);
      P(0.5, 0.58, 24, { brillo: 1.4 });
      g.fillStyle = "#363A7A"; g.beginPath(); g.moveTo(x, y + h); g.lineTo(x, y + h * 0.7); g.lineTo(x + w * 0.3, y + h * 0.55); g.lineTo(x + w * 0.62, y + h * 0.78); g.lineTo(x + w, y + h * 0.6); g.lineTo(x + w, y + h); g.fill();
      g.fillStyle = "#2F5E58"; g.beginPath(); g.moveTo(x, y + h); g.lineTo(x, y + h * 0.86); g.quadraticCurveTo(x + w * 0.5, y + h * 0.7, x + w, y + h * 0.9); g.lineTo(x + w, y + h); g.fill();
    } else if (i === 4) {
      g.fillStyle = "#2E2160"; g.fillRect(x, y, w, h); g.fillStyle = "#3D2E7C"; g.fillRect(x, y + h * 0.78, w, h * 0.22);
      g.strokeStyle = C.papel; g.lineWidth = 2 * s; g.beginPath(); g.moveTo(x + w * 0.5, y + h * 0.42); g.quadraticCurveTo(x + w * 0.53, y + h * 0.58, x + w * 0.5, y + h * 0.7); g.stroke();
      P(0.5, 0.3, 20, { brillo: 0.6 });
      g.fillStyle = "#3E8E86"; g.fillRect(x + w * 0.5 - 13 * s, y + h * 0.7, 26 * s, 36 * s); g.fillStyle = "#C68A62"; g.beginPath(); g.arc(x + w * 0.5, y + h * 0.66, 12 * s, 0, 7); g.fill();
    } else {
      g.fillStyle = C.ink; g.fillRect(x, y, w, h);
      g.font = MARCA.F.display(Math.round(78 * s)); g.fillStyle = C.papel; g.textAlign = "center"; g.textBaseline = "alphabetic";
      g.fillText("IDEA", x + w * 0.45, y + h * 0.68);
      const ww = g.measureText("IDEA").width;
      P(0, 0, 0); if (punto) MARCA.punto(g, x + w * 0.45 + ww / 2 + 14 * s, y + h * 0.68 - 7 * s, 9 * s, { brillo: 0.4 });
    }
    g.restore();
  }

  g0.PROMO = { SALE, paso, piel, viaje, miniatura, PIELES };
})(window);
