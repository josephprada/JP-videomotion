// Escena 1 · APERTURA (tiempo global 0,00–X,XX) · estilo tipográfico
// «Frase exacta de la voz que cubre esta escena.»
// t0 = segundo global donde empieza la escena; dur = siguiente corte − t0. Los efectos se miden en segundos (1 pulso = 1 s).
import { escenaTipo, createLayer } from "../../../../nucleo/kit/tipo.mjs";

const E = await escenaTipo({ t0: 0, dur: 3, paleta: { fondo: "#101820", tinta: "#F2EBDD", acento: "#FF5A36" } });
const { W, H, U } = E;
// Palabras clave en segundos de la voz (voz/palabras.srt). El segundo número es el respaldo SOLO si el video no tiene voz.
const T = { nadie: E.palabra("nadie", 0.3), creia: E.palabra("creía", 0.8), idea: E.palabra("idea", 1.9) };
const antes = 0.08; // whisper marca ~0,1 s tarde: el golpe va un pelo antes de la palabra

// 1 · «NADIE» aterriza: barra aplastada que se estira en letras, con rebote
const nadie = createLayer({
  start: E.v(T.nadie) - antes,
  source: { text: "NADIE", cap: U * 0.2, wght: 900, wdth: 60, x: W / 2, y: H * 0.4, align: "center" },
  stack: [["stretch-squash", { from: 0.02, amount: 1, volume: 0.6, maxSpread: 1.4, anchor: "center", elastic: 0.6, stagger: 0.04, duration: 0.7 }]],
});

// 2 · «creía en esta» entra fina y gana peso mientras la voz avanza
const creia = createLayer({
  start: E.v(T.creia) - antes,
  source: { text: "creía en esta", cap: U * 0.06, wght: 200, wdth: 100, x: W / 2, y: H * 0.48, align: "center" },
  stack: [["variable-weight", { mode: "tween", wghtFrom: 200, wghtTo: 600, duration: 0.9, easing: "outCubic" }]],
});

// 3 · «IDEA» es el golpe: acento (una vez por escena) y un eco que baja, la insistencia de la voz
const idea = createLayer({
  start: E.v(T.idea) - antes,
  source: { text: "IDEA", cap: U * 0.17, wght: 900, wdth: 110, x: W / 2, y: H * 0.62, align: "center", role: "accent" },
  stack: [
    ["stretch-squash", { from: 3, amount: 1, volume: 0.5, maxSpread: 2, anchor: "cap", elastic: 0.4, duration: 0.5 }],  // crece hacia abajo: no pisa la línea de arriba
    ["duplicate-echo", { copies: { keys: [[0, 0], [0.5, 3, "outExpo"]] }, delay: 0.07, offset: [0, U * 0.07], mode: "outline", stroke: 2.5 }],
  ],
});

E.dibujar((ctx, t, env) => {
  E.fondo(ctx, "paper");
  if (t >= nadie.start) nadie.draw(ctx, t, env);
  if (t >= creia.start) creia.draw(ctx, t, env);
  if (t >= idea.start) idea.draw(ctx, t, env);
});
