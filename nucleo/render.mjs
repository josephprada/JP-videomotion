// Motor de render: recorre el tiempo, llama window.seek(t) y entuba cada cuadro a ffmpeg.
// La película es una función pura del tiempo (ver CLAUDE.md). Este archivo no sabe nada de la película.
//
//   node render.mjs --film videos/001-ejemplo/escenas/escena3   → <película>/out/mudo_9x16.mp4
//   (--film es la carpeta de la película, relativa a la raíz del repo; en los ejemplos de abajo, <p>)
//   node render.mjs --film <p> --sub 4 --audio a.wav → mezcla con audio, desenfoque de movimiento
//   node render.mjs --film <p> --from 2 --to 3.5      → re-render solo de esos segundos
//   node render.mjs --film <p> --stills 0.5,2,4       → PNG sueltos en out/stills/
//   node render.mjs --film <p> --fmt 1x1              → otro formato desde la misma línea de tiempo
//   node render.mjs --film <p> --scale 0.5            → animatic a media resolución
//   node render.mjs --film <p> --page hoja --stills 0  → otra página (hoja de modelo, pruebas)
import { chromium } from "playwright-core";
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { lanzar } from "./navegador.mjs";
import { servir } from "./lib/servidor.mjs";

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf("--" + k); return i >= 0 ? argv[i + 1] : d; };
const num = (k, d) => Number(arg(k, d));

const FILM = arg("film");
if (!FILM) { console.error("falta --film <carpeta de la película, desde la raíz del repo>"); process.exit(1); }
const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dir = resolve(RAIZ, FILM);
if (!existsSync(join(dir, arg("page", "index") + ".html"))) { console.error("no existe la película: " + dir); process.exit(1); }
const FPS = num("fps", 60), SUB = num("sub", 1), SCALE = num("scale", 1), CRF = num("crf", 16);
const FMT = arg("fmt", "9x16");
const PAGE = arg("page", "index");                 // otra página de la película, p. ej. --page hoja
const OUT = join(dir, "out");
mkdirSync(OUT, { recursive: true });

const browser = await lanzar(chromium, { args: ["--disable-gpu-vsync", "--font-render-hinting=none"] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
// errores de la página; los 404 se informan con su URL (el genérico «Failed to load resource» no dice cuál).
// voz/palabras.srt es opcional: una escena sin voz lo pide y usa sus tiempos de respaldo.
page.on("console", (m) => { if (m.type() === "error" && !m.text().startsWith("Failed to load resource")) console.error("[página]", m.text()); });
page.on("response", (r) => { if (r.status() >= 400 && !r.url().endsWith("/voz/palabras.srt")) console.error(`[página] ${r.status()} ${decodeURIComponent(r.url())}`); });
page.on("pageerror", (e) => { console.error("[página]", e.message); process.exitCode = 1; });

// Servidor local (127.0.0.1): las escenas con módulos ES (typefx) no cargan con file://; las clásicas funcionan igual.
const srv = await servir(RAIZ);
const rel = relative(RAIZ, join(dir, PAGE + ".html")).split(sep).map(encodeURIComponent).join("/");
await page.goto(`${srv.url}/${rel}?render=1&fmt=${FMT}&scale=${SCALE}`);
// si la página falla al cargar (p. ej. una palabra que no está en la voz), se corta al instante en vez de esperar 60 s
const falla = new Promise((_, mal) => page.once("pageerror", mal));
try {
  await Promise.race([page.waitForFunction(() => window.seek && window.film && window.film.ready === true, null, { timeout: 60000 }), falla]);
} catch (e) {
  console.error("✖ la escena no cargó:", e.message.split("\n")[0]);
  await browser.close(); await srv.cerrar(); process.exit(1);
}
const film = await page.evaluate(() => ({ w: window.film.w, h: window.film.h, dur: window.film.dur }));
await page.setViewportSize({ width: film.w, height: film.h });
const canvas = page.locator("#c");

// toDataURL es mucho más rápido que un screenshot del navegador y no depende del layout
const frameAt = async (t) => {
  const b64 = await page.evaluate(async (t) => { await window.seek(t); return document.getElementById("c").toDataURL("image/png").slice(22); }, t);
  return Buffer.from(b64, "base64");
};

const stills = arg("stills");
if (stills) {
  mkdirSync(join(OUT, "stills"), { recursive: true });
  for (const s of stills.split(",").map(Number)) {
    const f = join(OUT, "stills", `${PAGE === "index" ? "" : PAGE + "_"}${FMT}_${s.toFixed(2)}s.png`);
    writeFileSync(f, await frameAt(s));
    console.log("still", f);
  }
  await browser.close(); await srv.cerrar();
  process.exit();
}

const T0 = num("from", 0), T1 = num("to", film.dur);
const name = arg("out", T0 > 0 || T1 < film.dur ? `parcial_${T0}-${T1}` : `mudo_${FMT}`);
const silent = join(OUT, name + ".mp4");

// tmix promedia SUB subcuadros consecutivos (desenfoque de movimiento real); select se queda con uno por grupo
const vf = SUB > 1 ? [`tmix=frames=${SUB}`, `select='eq(mod(n\\,${SUB})\\,${SUB - 1})'`, `setpts=N/${FPS}/TB`].join(",") : "null";
const ff = spawn("ffmpeg", ["-v", "error", "-y", "-f", "image2pipe", "-framerate", String(FPS * SUB), "-i", "-",
  "-vf", vf, "-r", String(FPS), "-c:v", "libx264", "-crf", String(CRF), "-preset", "slow", "-pix_fmt", "yuv420p", silent],
  { stdio: ["pipe", "inherit", "inherit"] });

const total = Math.round((T1 - T0) * FPS * SUB);
const t0 = Date.now();
for (let i = 0; i < total; i++) {
  const png = await frameAt(T0 + i / (FPS * SUB));
  if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once("drain", r));
  if (i % (FPS * SUB) === 0) console.log(`render ${(T0 + i / (FPS * SUB)).toFixed(1)}s / ${T1}s  (${((Date.now() - t0) / 1000).toFixed(0)} s reales)`);
}
ff.stdin.end();
await new Promise((r) => ff.on("close", r));
await browser.close(); await srv.cerrar();

const audio = arg("audio");
if (audio) {
  const fin = join(OUT, arg("final", `final_${FMT}`) + ".mp4");
  await new Promise((r, j) => spawn("ffmpeg", ["-v", "error", "-y", "-i", silent, "-ss", String(T0), "-i", resolve(dir, audio),
    "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", fin], { stdio: "inherit" })
    .on("close", (c) => (c ? j(new Error("ffmpeg audio " + c)) : r())));
  console.log("listo", fin);
} else console.log("listo", silent);
