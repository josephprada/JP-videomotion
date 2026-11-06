// Escena de tipografía cinética sobre typefx (nucleo/vendor/typefx, MIT) con el reloj de la voz.
// Con bpm 60, un pulso de typefx = un segundo: las claves y duraciones de los efectos se escriben en segundos.
// Módulo ES: la escena necesita el servidor local (render.mjs lo levanta solo; vista previa: node nucleo/jp.mjs servir).
//
//   import { escenaTipo, createLayer } from "../../../../nucleo/kit/tipo.mjs";
//   const E = await escenaTipo({ t0: 0, dur: 4.2, paleta: { fondo, tinta, acento } });
//   const T = { nadie: E.palabra("nadie", 0.3) };          // segundo global de la palabra en voz/palabras.srt
//   const capa = createLayer({ start: E.v(T.nadie), source: {...}, stack: [[efecto, params], …] });
//   E.dibujar((ctx, t, env) => { E.fondo(ctx, "paper"); capa.draw(ctx, t, env); });
//
// E.palabra(texto, respaldo): sin voz/palabras.srt (video sin narración) usa el respaldo; con voz, la palabra TIENE que
// estar en la alineación (si no, error): los tiempos nunca se inventan.
import anybody from "../vendor/typefx/fonts/anybody.js";
import jetbrains from "../vendor/typefx/fonts/jetbrains-mono.js";
import { createEnv, createRenderer } from "../vendor/typefx/index.js";
import { leerSrt } from "../lib/subtitulos.mjs";
import { buscarPalabra, paletaTypefx, formatoDiseno } from "../lib/tipovoz.mjs";

export * from "../vendor/typefx/index.js";
export { paletaTypefx, buscarPalabra };
export const FUENTES = { anybody, mono: jetbrains };

const BASE = new URL("../", import.meta.url);

async function cargarPalabras(url) {
  try {
    const r = await fetch(new URL(url, location.href));
    return r.ok ? leerSrt(await r.text()) : [];
  } catch { return []; }
}

// drawMono de typefx usa la familia «TypefxMono» (JetBrains Mono): se registra una vez.
async function registrarMono() {
  if ([...document.fonts].some((f) => f.family === "TypefxMono")) return;
  const f = new FontFace("TypefxMono", `url("${new URL("vendor/typefx/fuentes/JetBrainsMono[wght].ttf", BASE).href}")`, { weight: "100 900" });
  document.fonts.add(await f.load());
}

export async function escenaTipo({ t0 = 0, dur, paleta = "color", fuente = "anybody", voz = "../../voz/palabras.srt", subframes = 1 } = {}) {
  if (!dur) throw new Error("escenaTipo: falta dur (segundos)");
  const q = new URLSearchParams(location.search);
  const RENDER = q.has("render"), ESC = Number(q.get("scale") || 1), FMT = q.get("fmt") || "9x16";
  const [W, H] = formatoDiseno(FMT);
  const pal = typeof paleta === "string" ? paleta : paleta.swatches ? paleta : paletaTypefx(paleta);
  const env = createEnv({ fontData: FUENTES[fuente] || fuente, palette: pal, width: W, height: H, bpm: 60 });
  const [palabras] = await Promise.all([cargarPalabras(voz), registrarMono()]);

  const canvas = document.getElementById("c");
  const r = createRenderer(canvas, { width: Math.round(W * ESC), height: Math.round(H * ESC), fps: 60, subframes: Number(q.get("subframes") ?? subframes) });
  let pintar = null;
  window.film = { w: canvas.width, h: canvas.height, dur, ready: false };
  window.seek = (t) => r.frame(t, (ctx, tt) => {
    ctx.setTransform(ESC, 0, 0, ESC, 0, 0);
    if (pintar) pintar(ctx, tt, env);
  }, { duration: dur });

  const E = {
    env, W, H, U: Math.min(W, H), ESC, FMT, t0, dur, palabras, RENDER,
    v: (s) => s - t0,
    palabra(texto, respaldo, opciones) {
      if (!palabras.length && respaldo !== undefined) return respaldo;
      return buscarPalabra(palabras, texto, opciones).ini;
    },
    tramo(texto, opciones) { return buscarPalabra(palabras, texto, opciones); },
    fondo(ctx, rol = "paper", rect = { x: 0, y: 0, w: W, h: H }) { ctx.fillStyle = env.palette.c(rol); ctx.fillRect(rect.x, rect.y, rect.w, rect.h); },
    // registra la función de pintado y declara la escena lista para el render
    dibujar(fn) {
      pintar = fn;
      window.film.ready = true;
      if (!RENDER) { const ini = performance.now(); (function bucle() { window.seek(((performance.now() - ini) / 1000) % dur); requestAnimationFrame(bucle); })(); }
    },
  };
  return E;
}
