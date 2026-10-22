#!/usr/bin/env node
// CLI de JP-videomotion. Lo usan los flujos (flujos/*.md) desde cualquier agente; también sirve a mano.
//   node nucleo/jp.mjs doctor                         ¿está todo instalado? (con cómo arreglarlo en este sistema operativo)
//   node nucleo/jp.mjs agente                         detecta el agente y lo guarda en .jp/local.yaml
//   node nucleo/jp.mjs catalogo [--json]              perfiles, estilos, métodos, sistemas de diseño, universos y videos
//   node nucleo/jp.mjs nuevo <slug> [--perfil p --estilo e --metodo m --idioma es --formato 9x16 ...]
//   node nucleo/jp.mjs estado <video> [--json]        fases del video: completadas, saltadas, actual, pendientes
//   node nucleo/jp.mjs completar <video> <fase> [--nota "..."]
//   node nucleo/jp.mjs reabrir <video> <fase> [--nota "..."]
//   node nucleo/jp.mjs subtitulos <video> [--quemar] [--entrada montaje/out/final.mp4]
// <video> es la carpeta (videos/007-slug) o solo el número (007).
import { existsSync, readFileSync, writeFileSync, readdirSync, mkdirSync, cpSync, statSync } from "node:fs";
import { join, resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import YAML from "yaml";
import { resolverPerfil, estado, completar, reabrir } from "./lib/fases.mjs";
import { detectarAgente } from "./lib/agente.mjs";
import { leerSrt, agrupar, aSrt, aAss } from "./lib/subtitulos.mjs";
import { buscarChrome } from "./navegador.mjs";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [cmd, ...resto] = process.argv.slice(2);
const pos = resto.filter((a, i) => !a.startsWith("--") && !(resto[i - 1] || "").startsWith("--"));
const opt = (k, d) => { const i = resto.indexOf("--" + k); if (i < 0) return d; const v = resto[i + 1]; return v === undefined || v.startsWith("--") ? true : v; };
const hoy = () => new Date().toISOString().slice(0, 10);
const leerYaml = (f) => YAML.parse(readFileSync(f, "utf8")) || {};
const dirs = (d) => (existsSync(d) ? readdirSync(d).filter((x) => !x.startsWith(".") && statSync(join(d, x)).isDirectory()) : []);
const fallar = (m) => { console.error("✖ " + m); process.exit(1); };

function config() {
  const f = join(RAIZ, "jp.config.yaml");
  const base = leerYaml(join(RAIZ, "config/defecto.yaml"));
  return existsSync(f) ? { ...base, ...leerYaml(f), configurado: true } : { ...base, configurado: false };
}
const leerPerfil = (n) => { const f = join(RAIZ, "perfiles", n, "perfil.yaml"); if (!existsSync(f)) fallar(`no existe el perfil «${n}» (perfiles/${n}/perfil.yaml)`); return leerYaml(f); };

function carpetaVideo(v) {
  if (!v) fallar("falta el video: carpeta (videos/007-slug) o número (007)");
  const directo = resolve(RAIZ, v);
  if (existsSync(join(directo, "video.yaml"))) return directo;
  const n = dirs(join(RAIZ, "videos")).find((d) => d.startsWith(String(v).padStart(3, "0") + "-"));
  if (n) return join(RAIZ, "videos", n);
  fallar(`no encuentro el video «${v}»`);
}

// ---------------- doctor ----------------
function hay(bin, args = ["-version"]) { const r = spawnSync(bin, args, { encoding: "utf8", shell: process.platform === "win32" }); return r.status === 0 ? (r.stdout || r.stderr || "") : null; }
function doctor() {
  const so = process.platform, pista = (w, m, l) => (so === "win32" ? w : so === "darwin" ? m : l);
  const filas = [];
  const fila = (nombre, ok, requerido, arreglo, nota = "") => filas.push({ nombre, ok, requerido, arreglo, nota });
  const vNode = Number(process.versions.node.split(".")[0]);
  fila("Node.js ≥ 20", vNode >= 20, true, "https://nodejs.org (LTS)", process.versions.node);
  fila("Dependencias del núcleo", existsSync(join(RAIZ, "nucleo/node_modules/playwright-core")) && existsSync(join(RAIZ, "nucleo/node_modules/yaml")), true, "cd nucleo && npm install");
  const ff = hay("ffmpeg");
  fila("ffmpeg + ffprobe", !!ff && !!hay("ffprobe"), true, pista("winget install Gyan.FFmpeg", "brew install ffmpeg", "sudo apt install ffmpeg"));
  const filtros = ff ? hay("ffmpeg", ["-hide_banner", "-filters"]) || "" : "";
  fila("ffmpeg con libass (subtítulos quemados)", / subtitles /.test(filtros), false, "instala un ffmpeg «full» (el de Gyan, Homebrew o apt ya lo traen)");
  const chrome = buscarChrome();
  fila("Chrome / Chromium / Edge", !!chrome, true, pista("winget install Google.Chrome", "brew install --cask google-chrome", "sudo apt install chromium") + " · o define CHROME_PATH", chrome || "");
  fila("bash (scripts de nucleo/tools)", !!hay("bash", ["--version"]), true, pista("instala Git for Windows (trae Git Bash)", "ya viene con macOS", "ya viene con Linux"));
  fila("git", !!hay("git", ["--version"]), true, pista("winget install Git.Git", "xcode-select --install", "sudo apt install git"));
  fila("git-lfs (entregables .mp4)", !!hay("git", ["lfs", "version"]), false, pista("winget install GitHub.GitLFS", "brew install git-lfs", "sudo apt install git-lfs") + " && git lfs install");
  const whisper = hay("whisper-cli", ["--help"]) !== null;
  const modelo = process.env.WHISPER_MODEL || join(process.env.HOME || process.env.USERPROFILE || "", ".cache/whisper/ggml-small.bin");
  fila("whisper-cli + modelo (tiempos de la voz y subtítulos)", whisper && existsSync(modelo), false, pista("descarga whisper.cpp de GitHub (releases) y el modelo ggml-small.bin", "brew install whisper-cpp", "compila whisper.cpp") + ` · modelo en ${modelo} o WHISPER_MODEL`);
  const py = hay("python", ["--version"]) || hay("python3", ["--version"]);
  fila("Python + librosa (solo si se entrega una pista musical)", !!py && (hay("python", ["-c", "import librosa"]) !== null || hay("python3", ["-c", "import librosa"]) !== null), false, "pip install numpy librosa soundfile");
  for (const f of filas) console.log(`${f.ok ? "✔" : f.requerido ? "✖" : "·"} ${f.nombre}${f.nota ? `  (${f.nota})` : ""}${f.ok ? "" : `\n    → ${f.arreglo}`}`);
  const faltan = filas.filter((f) => !f.ok && f.requerido).length;
  console.log(faltan ? `\n${faltan} requisito(s) obligatorio(s) sin cumplir.` : "\nTodo lo obligatorio está listo. Lo marcado con · es opcional (solo para ciertas fases).");
  process.exit(faltan ? 1 : 0);
}

// ---------------- agente ----------------
function agente() {
  const det = detectarAgente();
  const declarado = opt("id");
  const id = declarado || det?.id || null;
  if (!id) { console.log("No se detectó el agente. Declárate con: node nucleo/jp.mjs agente --id <tu-agente>"); process.exit(2); }
  mkdirSync(join(RAIZ, ".jp"), { recursive: true });
  const f = join(RAIZ, ".jp/local.yaml");
  const local = existsSync(f) ? leerYaml(f) : {};
  local.agente = { id, fuente: declarado ? "declarado" : det.fuente, fecha: hoy() };
  writeFileSync(f, YAML.stringify(local));
  console.log(`agente: ${id} (${local.agente.fuente}) → .jp/local.yaml`);
}

// ---------------- catálogo ----------------
function primeraLinea(f) { if (!existsSync(f)) return ""; const l = readFileSync(f, "utf8").split(/\r?\n/).find((x) => x.startsWith("# ")); return l ? l.slice(2).trim() : ""; }
function catalogo() {
  const yamlDe = (base, n, archivo) => { const f = join(RAIZ, base, n, archivo); return existsSync(f) ? leerYaml(f) : {}; };
  const c = {
    perfiles: dirs(join(RAIZ, "perfiles")).map((n) => { const p = yamlDe("perfiles", n, "perfil.yaml"); return { id: n, nombre: p.nombre || n, descripcion: p.descripcion || "", hereda: p.hereda || null }; }),
    estilos: dirs(join(RAIZ, "estilos")).filter((n) => !n.startsWith("_")).map((n) => { const e = yamlDe("estilos", n, "estilo.yaml"); return { id: n, nombre: e.nombre || n, descripcion: e.descripcion || "", metodos: e.metodos || [], muestra: e.muestra || null }; }),
    metodos: dirs(join(RAIZ, "metodos")).map((n) => { const m = yamlDe("metodos", n, "metodo.yaml"); return { id: n, nombre: m.nombre || n, estado: m.estado || "experimental", descripcion: m.descripcion || "" }; }),
    sistemas_diseno: dirs(join(RAIZ, "sistemas-diseno")).filter((n) => !n.startsWith("_")).map((n) => { const s = yamlDe("sistemas-diseno", n, "sistema.yaml"); return { id: n, nombre: s.nombre || n, origen: s.origen || "", descripcion: s.descripcion || "" }; }),
    universos: dirs(join(RAIZ, "universos")).filter((n) => !n.startsWith("_")).map((n) => ({ id: n, titulo: primeraLinea(join(RAIZ, "universos", n, "LEEME.md")) })),
    videos: dirs(join(RAIZ, "videos")).filter((n) => !n.startsWith("_")).map((n) => {
      const v = yamlDe("videos", n, "video.yaml");
      return { carpeta: `videos/${n}`, titulo: v.titulo || n, perfil: v.perfil, estilo: v.estilo, metodo: v.metodo, idioma: v.idioma, sistema_diseno: v.sistema_diseno || null, fase: v.estado?.fase || null };
    }),
  };
  if (opt("json")) { console.log(JSON.stringify(c, null, 1)); return; }
  const sec = (t, l, f) => { console.log(`\n${t}`); if (!l.length) console.log("  (ninguno)"); for (const x of l) console.log("  " + f(x)); };
  sec("PERFILES (qué tipo de video)", c.perfiles, (p) => `${p.id.padEnd(18)} ${p.nombre}${p.descripcion ? " — " + p.descripcion : ""}`);
  sec("ESTILOS (cómo se ve)", c.estilos, (e) => `${e.id.padEnd(18)} ${e.nombre}${e.descripcion ? " — " + e.descripcion : ""}`);
  sec("MÉTODOS (cómo se produce)", c.metodos, (m) => `${m.id.padEnd(18)} ${m.nombre} [${m.estado}]`);
  sec("SISTEMAS DE DISEÑO (marca)", c.sistemas_diseno, (s) => `${s.id.padEnd(18)} ${s.nombre}${s.origen ? " · " + s.origen : ""}`);
  sec("UNIVERSOS (personajes y escenarios compartidos)", c.universos, (u) => `${u.id.padEnd(18)} ${u.titulo}`);
  sec("VIDEOS", c.videos, (v) => `${v.carpeta.padEnd(34)} ${v.perfil}/${v.estilo}/${v.metodo} · ${v.idioma} · fase: ${v.fase || "terminado"}`);
}

// ---------------- nuevo ----------------
function nuevo() {
  const slug = pos[0];
  if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) fallar("uso: jp nuevo <slug-en-minusculas-con-guiones> [--perfil … --estilo … --metodo …]");
  const cfg = config();
  const def = cfg.video || {};
  const nums = dirs(join(RAIZ, "videos")).map((d) => parseInt(d, 10)).filter((n) => !isNaN(n));
  const num = String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, "0");
  const dest = join(RAIZ, "videos", `${num}-${slug}`);
  const perfil = opt("perfil", def.perfil || "libre"), estilo = opt("estilo", def.estilo || "plano"), metodo = opt("metodo", def.metodo || "canvas");
  leerPerfil(perfil);
  if (!existsSync(join(RAIZ, "estilos", estilo))) fallar(`no existe el estilo «${estilo}» (mira: jp catalogo)`);
  if (!existsSync(join(RAIZ, "metodos", metodo))) fallar(`no existe el método «${metodo}»`);
  const sistema = opt("sistema-diseno", def.sistema_diseno || null);
  if (sistema && sistema !== "ninguno" && !existsSync(join(RAIZ, "sistemas-diseno", sistema))) fallar(`no existe el sistema de diseño «${sistema}» (sistemas-diseno/)`);

  cpSync(join(RAIZ, "videos/_plantilla"), dest, { recursive: true });
  const guionPerfil = [perfil, leerPerfil(perfil).hereda, "libre"].filter(Boolean).map((p) => join(RAIZ, "perfiles", p, "guion.md")).find(existsSync);
  if (guionPerfil) cpSync(guionPerfil, join(dest, "guion.md"));
  const idx = join(dest, "escenas/escena1/index.html");
  writeFileSync(idx, readFileSync(idx, "utf8").replaceAll("{{ESTILO}}", estilo).replaceAll("{{TITULO}}", `${num} · ${slug}`));

  const si = (v) => v === true || v === "si" || v === "sí" || v === "true";
  const f = join(dest, "video.yaml");
  const doc = YAML.parseDocument(readFileSync(f, "utf8"));
  const set = (k, v) => { if (v !== undefined && v !== null) doc.setIn(k, v); };
  set(["id"], num); set(["slug"], slug); set(["titulo"], opt("titulo", slug)); set(["creado"], hoy());
  set(["perfil"], perfil); set(["estilo"], estilo); set(["metodo"], metodo);
  set(["idioma"], opt("idioma", def.idioma || cfg.idioma_contenido || "es"));
  const formatos = String(opt("formato", (def.formatos || ["9x16"]).join(","))).split(",");
  doc.setIn(["formatos"], doc.createNode(formatos));
  set(["duracion"], opt("duracion", def.duracion));
  const plat = opt("plataformas", (def.plataformas || []).join(","));
  if (plat) doc.setIn(["plataformas"], doc.createNode(String(plat).split(",").filter(Boolean)));
  set(["voz"], opt("voz", def.voz)); set(["musica"], opt("musica", def.musica));
  set(["subtitulos", "modo"], opt("subtitulos", def.subtitulos));
  if (opt("datos-reales") !== undefined) set(["datos_reales"], si(opt("datos-reales")));
  set(["marcas_terceros"], opt("marcas", cfg.marcas_terceros || "permitidas"));
  set(["sistema_diseno"], sistema && sistema !== "ninguno" ? sistema : null);
  set(["modo"], opt("modo", def.modo || "interactivo"));
  const reu = opt("reutiliza");
  if (reu) doc.setIn(["reutiliza", "de"], doc.createNode(String(reu).split(",")));
  writeFileSync(f, doc.toString());
  const v = YAML.parse(doc.toString());
  const fases = resolverPerfil(perfil, leerPerfil);
  const conEstado = { ...v, estado: { ...(v.estado || {}), fase: estado(fases, v).actual } };
  doc.setIn(["estado", "fase"], conEstado.estado.fase);
  writeFileSync(f, doc.toString());
  console.log(`creado ${relative(RAIZ, dest).replaceAll("\\", "/")} · perfil ${perfil} · estilo ${estilo} · método ${metodo}`);
  console.log(`siguiente: node nucleo/jp.mjs estado ${num}`);
}

// ---------------- estado / completar / reabrir ----------------
function cargarVideo(v) {
  const dir = carpetaVideo(v), f = join(dir, "video.yaml");
  const doc = YAML.parseDocument(readFileSync(f, "utf8"));
  const video = doc.toJS() || {};
  const fases = resolverPerfil(video.perfil || "libre", leerPerfil);
  return { dir, f, doc, video, fases };
}
const ICONO = { completada: "✔", saltada: "⤼", actual: "▶", pendiente: "·" };
function mostrarEstado() {
  const { dir, video, fases } = cargarVideo(pos[0]);
  const e = estado(fases, video);
  if (opt("json")) { console.log(JSON.stringify({ video: relative(RAIZ, dir), ...e }, null, 1)); return; }
  console.log(`${video.id} · ${video.titulo} — perfil ${video.perfil} · estilo ${video.estilo} · método ${video.metodo} · modo ${video.modo || "interactivo"}\n`);
  for (const f of e.fases) console.log(`  ${ICONO[f.estado]} ${f.id.padEnd(14)} ${(f.nombre || "").padEnd(34)} ${f.para && f.estado !== "saltada" ? "⛔ compuerta" : ""}`);
  if (e.terminado) { console.log("\nTodas las fases completadas."); return; }
  const fa = e.fases.find((f) => f.estado === "actual");
  const p = (r) => (existsSync(join(RAIZ, r)) ? r : null);
  console.log(`\nFase actual: ${fa.id}${fa.para ? " (al terminar: mostrar el resultado y ESPERAR la aprobación)" : ""}`);
  console.log("Leer antes de trabajar:");
  for (const r of [p("perfiles/libre/FASES.md") && `perfiles/libre/FASES.md § ${fa.id}`, video.perfil !== "libre" && p(`perfiles/${video.perfil}/PERFIL.md`),
    p(`metodos/${video.metodo}/METODO.md`) && `metodos/${video.metodo}/METODO.md § ${fa.id}`, p(`estilos/${video.estilo}/ESTILO.md`),
    video.sistema_diseno && p(`sistemas-diseno/${video.sistema_diseno}/SISTEMA.md`)].filter(Boolean)) console.log("  - " + r);
}
function cambiarEstado(fn, verbo) {
  const { f, doc, video, fases } = cargarVideo(pos[0]);
  const id = pos[1]; if (!id) fallar(`uso: jp ${verbo} <video> <fase> [--nota "…"]`);
  let nuevoV; try { nuevoV = fn(fases, video, id, { fecha: hoy(), nota: typeof opt("nota") === "string" ? opt("nota") : undefined }); } catch (e) { fallar(e.message); }
  doc.setIn(["estado", "fase"], nuevoV.estado.fase);
  doc.setIn(["estado", "completadas"], doc.createNode(nuevoV.estado.completadas, { flow: true }));
  doc.setIn(["estado", "historial"], doc.createNode(nuevoV.estado.historial));
  writeFileSync(f, doc.toString());
  console.log(`${verbo === "completar" ? "completada" : "reabierta"}: ${id} → fase actual: ${nuevoV.estado.fase || "ninguna (video terminado)"}`);
}

// ---------------- subtítulos ----------------
function subtitulos() {
  const { dir, video } = cargarVideo(pos[0]);
  const s = { ...(config().video?.subtitulos_estilo || {}), ...(video.subtitulos || {}) };
  if (s.modo === "ninguno") fallar("este video tiene subtitulos.modo: ninguno");
  const src = join(dir, "voz/palabras.srt");
  if (!existsSync(src)) fallar("falta voz/palabras.srt (se genera con: bash nucleo/tools/tiempos.sh <video>)");
  const bloques = agrupar(leerSrt(readFileSync(src, "utf8")), { maxCar: s.max_caracteres ?? 22, maxPalabras: s.max_palabras ?? 4, pausa: s.pausa ?? 0.35, mayusculas: !!s.mayusculas });
  const fmt = (video.formatos || ["9x16"])[0];
  const [ancho, alto] = { "9x16": [1080, 1920], "1x1": [1080, 1080], "16x9": [1920, 1080] }[fmt] || [1080, 1920];
  const salida = join(dir, "entregables/final"); mkdirSync(salida, { recursive: true });
  writeFileSync(join(salida, "subtitulos.srt"), aSrt(bloques));
  const ass = join(dir, "montaje/subtitulos.ass");
  mkdirSync(dirname(ass), { recursive: true });
  writeFileSync(ass, aAss(bloques, { ancho, alto, fuente: s.fuente || "Arial", tamano: s.tamano ?? Math.round(ancho * 0.07), margenV: s.margen_inferior ?? Math.round(alto * 0.27) }));
  console.log(`${bloques.length} bloques → entregables/final/subtitulos.srt · montaje/subtitulos.ass`);
  if (!opt("quemar")) return;
  const entrada = join(dir, opt("entrada", "montaje/out/final.mp4"));
  if (!existsSync(entrada)) fallar(`no existe ${relative(RAIZ, entrada)}`);
  const out = entrada.replace(/\.mp4$/, "_subtitulado.mp4");
  // libass necesita la ruta escapada (los dos puntos de Windows) y se ejecuta desde la carpeta del .ass
  const r = spawnSync("ffmpeg", ["-v", "error", "-y", "-i", entrada, "-vf", "subtitles=subtitulos.ass", "-c:v", "libx264", "-crf", "16", "-preset", "slow", "-pix_fmt", "yuv420p", "-c:a", "copy", out], { cwd: dirname(ass), stdio: "inherit" });
  if (r.status !== 0) fallar("ffmpeg no pudo quemar los subtítulos (¿tiene libass? → jp doctor)");
  console.log("quemados →", relative(RAIZ, out).replaceAll("\\", "/"));
}

const CMDS = { doctor, agente, catalogo, nuevo, estado: mostrarEstado, completar: () => cambiarEstado(completar, "completar"), reabrir: () => cambiarEstado(reabrir, "reabrir"), subtitulos };
if (!CMDS[cmd]) { console.log(readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").slice(1).filter((l, i, ls) => ls.slice(0, i + 1).every((x) => x.startsWith("//"))).map((l) => l.replace(/^\/\/ ?/, "")).join("\n")); process.exit(cmd ? 1 : 0); }
CMDS[cmd]();
