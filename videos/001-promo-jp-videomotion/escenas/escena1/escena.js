// Escena 1 · GANCHO (global 0,0000–1,4833) · tipográfico (typefx) con Anton y la paleta JP
// «Tienes una idea,»
// El punto rojo cae desde arriba y aterriza como punto final de «IDEA.»: es «la idea», el motivo de todo el video.
import { escenaTipo, createLayer, layout, setBBox } from "../../../../nucleo/kit/tipo.mjs";
import anton from "../../js/fuente-anton.js";

const E = await escenaTipo({ t0: 0, dur: 1.4833, fuente: anton, paleta: { fondo: "#0b0b0c", tinta: "#f2efe9", acento: "#e63329" } });
const { W, H, U } = E;
const T = { tienes: E.palabra("tienes"), una: E.palabra("una"), idea: E.palabra("idea") };
const antes = 0.08;
const vertical = H > W;
const cap = U * (vertical ? 0.27 : 0.2);
const x0 = vertical ? W * 0.1 : W * 0.14;
const y0 = H / 2 - cap * 0.75;
const Y = [y0, y0 + cap * 1.25, y0 + cap * 2.5];
const fuente = { cap, wght: 400, wdth: 100, align: "left" };

const capa = (texto, t, y, stack) => createLayer({ start: E.v(t) - antes, source: { ...fuente, text: texto, x: x0, y }, stack });
const tienes = capa("TIENES", T.tienes, Y[0], [["stretch-squash", { from: 0.02, amount: 1, volume: 0.5, maxSpread: 1.6, anchor: "baseline", elastic: 0.5, stagger: 0.03, duration: 0.5 }]]);
const una = capa("UNA", T.una, Y[1], [["tracking-spacing", { mode: "tween", from: 0.6, to: 0, duration: 0.45, easing: "outExpo" }]]);
const idea = capa("IDEA", T.idea, Y[2], [["stretch-squash", { from: 3, amount: 1, volume: 0.5, maxSpread: 2, anchor: "baseline", elastic: 0.45, duration: 0.5 }]]);

// dónde queda el punto final: justo después de «IDEA», sobre la línea de base
const caja = setBBox(layout(E.env.font, { ...fuente, text: "IDEA", x: x0, y: Y[2] }));
const r = cap * 0.13;
const destino = { x: caja.x + caja.w + r * 1.7, y: Y[2] - r };
const aterriza = E.v(T.idea) + 0.12;

function punto(ctx, t) {
  // cae con gravedad desde arriba del cuadro, rebota una vez y se asienta
  let y, aplasta = 1;
  if (t < aterriza) { const k = Math.max(0, t / aterriza); y = -r * 3 + (destino.y + r * 3) * k * k; }
  else {
    const u = t - aterriza;
    y = destino.y - Math.abs(Math.sin(u * 9)) * r * 2.2 * Math.exp(-u * 7);
    if (u < 0.06) aplasta = 0.72;
  }
  ctx.save();
  const h = ctx.createRadialGradient(destino.x, y, r * 0.6, destino.x, y, r * 3.2);
  h.addColorStop(0, "rgba(230,51,41,0.32)"); h.addColorStop(1, "rgba(230,51,41,0)");
  ctx.fillStyle = h; ctx.fillRect(destino.x - r * 3.2, y - r * 3.2, r * 6.4, r * 6.4);
  ctx.translate(destino.x, y + r * (1 - aplasta)); ctx.scale(1 / aplasta, aplasta);
  ctx.fillStyle = "#e63329"; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

E.dibujar((ctx, t, env) => {
  E.fondo(ctx, "paper");
  if (t >= tienes.start) tienes.draw(ctx, t, env);
  if (t >= una.start) una.draw(ctx, t, env);
  if (t >= idea.start) idea.draw(ctx, t, env);
  punto(ctx, t);
});
