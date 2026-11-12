// Escena 10 · TIPOGRÁFICO (global 25,8833–28,2167) · tipográfico (typefx) con Anton y la paleta JP
// «o solo con letra y voz.»
// Vuelta a casa: el punto llega del globo (punto de paso) y termina como punto final de «Y VOZ.»
import { escenaTipo, createLayer, layout, setBBox } from "../../../../nucleo/kit/tipo.mjs";
import anton from "../../js/fuente-anton.js";

const E = await escenaTipo({ t0: 25.8833, dur: 2.3334, fuente: anton, paleta: { fondo: "#0b0b0c", tinta: "#f2efe9", acento: "#e63329" } });
const { W, H, U } = E;
const T = { o: E.palabra("o", undefined, { desde: 25.8 }), solo: E.palabra("solo"), con: E.palabra("con", undefined, { desde: 25.8 }), letra: E.palabra("letra"), y: E.palabra("y", undefined, { desde: 27.5 }), voz: E.palabra("voz") };
const antes = 0.08;
const vertical = H > W;
const c1 = U * 0.075, c2 = U * (vertical ? 0.26 : 0.24), c3 = U * (vertical ? 0.24 : 0.2);
const x = W / 2;
const y1 = H * (vertical ? 0.33 : 0.25), y2 = y1 + c1 * 0.6 + c2 * 1.12, y3 = y2 + c3 * 1.3;
const f = { wght: 400, wdth: 100, align: "center" };

const solo = createLayer({ start: E.v(T.o) - antes, source: { ...f, text: "O SOLO CON", cap: c1, x, y: y1 },
  stack: [["tracking-spacing", { mode: "tween", from: 1.2, to: 0.35, duration: 0.8, easing: "outExpo" }]] });
const letra = createLayer({ start: E.v(T.letra) - antes, source: { ...f, text: "LETRA", cap: c2, x, y: y2 },
  stack: [
    ["stretch-squash", { from: 0.02, amount: 1, volume: 0.5, maxSpread: 1.25, anchor: "baseline", elastic: 0.5, stagger: 0.03, duration: 0.55 }],
    ["duplicate-echo", { copies: { keys: [[0, 0], [0.3, 3, "outExpo"], [0.9, 0, "inOutCubic"]] }, delay: 0.06, offset: [0, -c2 * 0.08], mode: "outline", stroke: 2.5 }],
  ] });
const voz = createLayer({ start: E.v(T.y) - antes, source: { ...f, text: "Y VOZ", cap: c3, x: x - c3 * 0.2, y: y3 },
  stack: [["stretch-squash", { from: 3, amount: 1, volume: 0.5, maxSpread: 2, anchor: "cap", elastic: 0.4, duration: 0.5 }]] });

// el punto: del paso al punto final de «Y VOZ.»
const caja = setBBox(layout(E.env.font, { ...f, text: "Y VOZ", cap: c3, x: x - c3 * 0.2, y: y3 }));
const r0 = vertical ? 28 : 24, r1 = c3 * 0.13;
const paso = { x: W / 2, y: H * 0.47 }, fin = { x: caja.x + caja.w + r1 * 1.7, y: y3 - r1 };
const llega = E.v(T.voz);

const ease = (k) => 1 - Math.pow(1 - Math.min(1, Math.max(0, k)), 3);
function punto(ctx, t) {
  // espera en el paso mientras entra el texto y salta al final de «VOZ» con un arco
  const k = ease((t - (llega - 0.25)) / 0.4);
  const px = paso.x + (fin.x - paso.x) * k, py = paso.y + (fin.y - paso.y) * k - Math.sin(k * Math.PI) * 160;
  const r = r0 + (r1 - r0) * k;
  ctx.save();
  const h = ctx.createRadialGradient(px, py, r * 0.6, px, py, r * 3.2);
  h.addColorStop(0, "rgba(230,51,41,0.3)"); h.addColorStop(1, "rgba(230,51,41,0)");
  ctx.fillStyle = h; ctx.fillRect(px - r * 3.2, py - r * 3.2, r * 6.4, r * 6.4);
  ctx.fillStyle = "#e63329"; ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

E.dibujar((ctx, t, env) => {
  E.fondo(ctx, "paper");
  if (t >= solo.start) solo.draw(ctx, t, env);
  if (t >= letra.start) letra.draw(ctx, t, env);
  if (t >= voz.start) voz.draw(ctx, t, env);
  punto(ctx, t);
});
