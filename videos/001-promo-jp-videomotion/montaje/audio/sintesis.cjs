// Música y efectos del video, sintetizados en código (sin muestras de terceros).
// Los tiempos son segundos de la narración (voz/narracion-completa.mp3), los mismos de las tablas T de cada escena:
// los cortes caen en cuadros exactos, así que el tiempo global del video = tiempo de la voz.
// Música: pulso electrónico de promo a 120 BPM, anclado al golpe del logo (6,84 s).
//   node sintesis.cjs  →  musica.wav + sfx.wav  (48 kHz, 16 bit, estéreo). Lo corre nucleo/tools/mezcla.sh.
const fs = require("fs"), path = require("path");
const DUR = 48.6; // = último corte de escena (fin de la última escena), no la duración de la voz
const SR = 48000, N = Math.ceil(SR * DUR);
const BPM = 120, B = 60 / BPM;

function pista() { return { L: new Float32Array(N), R: new Float32Array(N) }; }
const MUS = pista(), SFX = pista();
let seed = 2002;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const ruido = () => rnd() * 2 - 1;
const sen = (ph) => Math.sin(2 * Math.PI * ph);
class LP { constructor(fc) { this.a = 1 - Math.exp((-2 * Math.PI * fc) / SR); this.y = 0; } p(x) { return (this.y += this.a * (x - this.y)); } }
class HP { constructor(fc) { this.lp = new LP(fc); } p(x) { return x - this.lp.p(x); } }
class BP { constructor(fc) { this.h = new HP(fc / 1.4); this.l = new LP(fc * 1.4); } p(x) { return this.l.p(this.h.p(x)); } }
function add(P, t0, dur, gain, pan, fn) {
  const i0 = Math.floor(t0 * SR), n = Math.floor(dur * SR);
  const gl = gain * Math.cos(((pan + 1) * Math.PI) / 4), gr = gain * Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < n; i++) { const j = i0 + i; if (j < 0 || j >= N) continue; const v = fn(i / SR, i / n); P.L[j] += v * gl; P.R[j] += v * gr; }
}
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

// ---------------- instrumentos ----------------
// cuerda pulsada (Karplus-Strong): ruido filtrado en una línea de retardo que se promedia a sí misma
function cuerda(t0, midi, g, pan, dur = 1.6, brillo = 0.5, decae = 0.996) {
  const L = Math.max(2, Math.round(SR / hz(midi))), buf = new Float32Array(L), lp = new LP(1500 + 5000 * brillo);
  for (let i = 0; i < L; i++) buf[i] = lp.p(ruido());
  let k = 0;
  add(MUS, t0, dur, g, pan, (t, u) => { const a = buf[k], b = buf[(k + 1) % L], y = decae * 0.5 * (a + b); buf[k] = y; k = (k + 1) % L; return a * Math.min(1, (1 - u) * 8); });
}
const rasgueo = (t0, notas, g, pan = 0.15, arriba = false) => (arriba ? [...notas].reverse() : notas).forEach((m, i) => cuerda(t0 + i * 0.014, m, g * (1 - i * 0.08), pan + (i - 1.5) * 0.08, 1.1, arriba ? 0.75 : 0.55));
function bajo(t0, midi, g, d = B * 1.8) { let p = 0; const f = hz(midi); add(MUS, t0, d, g, -0.1, (t, u) => { p += f / SR; return (sen(p) + 0.3 * sen(p * 2) + 0.08 * sen(p * 3)) * Math.min(1, t * 300) * Math.exp(-2.4 * t) * Math.min(1, (1 - u) * 10); }); }
function maraca(t0, g) { const hp = new HP(5500); add(MUS, t0, 0.09, g, 0.35, (t) => hp.p(ruido()) * Math.exp(-35 * t) * (1 - Math.exp(-900 * t))); }
function colchon(t0, d, notas, g) { notas.forEach((m, k) => { let p = 0; const f = hz(m), lp = new LP(900); add(MUS, t0, d, g, -0.4 + k * 0.27, (t, u) => { p += f / SR; const saw = 2 * (p % 1) - 1; return lp.p(saw) * Math.min(1, t / 1.2, (1 - u) * d / 0.8) * (0.85 + 0.15 * Math.sin(t * 2.1 + k)); }); }); }
const platillo = (t0, g = 0.2, d = 1.8) => { const hp = new HP(4500); add(MUS, t0, d, g, 0.2, (t) => hp.p(ruido()) * Math.exp(-2.2 * t)); };
const bombo = (t0, g = 0.5) => { let p = 0; add(MUS, t0, 0.5, g, 0, (t) => { p += (55 + 90 * Math.exp(-30 * t)) / SR; return sen(p) * Math.exp(-7 * t); }); };

// ---------------- música: pulso electrónico de promo (120 BPM) ----------------
// Sin música en el gancho; tensión con tics que se aceleran en el problema; silencio antes de «Ahora sí»; subida hasta el
// logo (6,84 s) y desde ahí la banda completa con el compás anclado al golpe del logo. En «código» se filtra; antes de
// «estilos» redoble; remate en el cierre y cola de colchón con la URL.
const T0 = 6.84;                                   // primer tiempo fuerte = el logo se cierra
const sierra = (ph) => 2 * (ph % 1) - 1;
function bajoSynth(t0, midi, d, g, fc = 700) { let p = 0; const f = hz(midi), lp = new LP(fc); add(MUS, t0, d, g, 0, (t, u) => { p += f / SR; return lp.p(sierra(p) * 0.7 + sen(p * 0.5) * 0.5) * Math.min(1, t * 200, (1 - u) * 12); }); }
function pluck(t0, midi, g, pan) { let p = 0; const f = hz(midi), lp = new LP(2600); add(MUS, t0, 0.35, g, pan, (t) => { p += f / SR; return lp.p(sierra(p)) * Math.exp(-11 * t); }); }
const hat = (t0, g = 0.06, pan = 0.25) => { const hp = new HP(7000); add(MUS, t0, 0.05, g, pan, (t) => hp.p(ruido()) * Math.exp(-70 * t)); };
const caja = (t0, g = 0.22) => { const bp = new BP(1800); let p = 0; add(MUS, t0, 0.22, g, -0.05, (t) => { p += 190 / SR; return (bp.p(ruido()) * 1.6 + sen(p) * 0.5) * Math.exp(-16 * t); }); };
const subida = (t0, d, g = 0.22) => { const hp = new HP(800); add(MUS, t0, d, g, 0, (t, u) => hp.p(ruido()) * u * u); let p = 0; add(MUS, t0, d, g * 0.5, 0, (t, u) => { p += (120 + 900 * u * u) / SR; return sen(p) * u; }); };

const ACORDES = [[41, [65, 69, 72, 77]], [48, [64, 67, 72, 76]], [43, [62, 67, 71, 74]], [45, [64, 69, 72, 76]]];   // F C G Am
// tensión (problema): tic cada vez más seguido + dron grave
for (let t = 1.55, d = 0.42; t < 5.1; t += d, d = Math.max(0.09, d * 0.86)) hat(t, 0.07, (t * 7) % 2 - 1);
colchon(1.5, 3.7, [33, 40], 0.06);
subida(5.95, 0.9, 0.2);                            // «Ahora sí» → el logo
// banda completa desde el logo hasta el cierre
const FIN_BANDA = 42.68, FILTRO = [36.2, 40.27];
for (let k = 0; T0 + k * B < FIN_BANDA; k++) {
  const t = T0 + k * B, comp = Math.floor(k / 4), [raiz, notas] = ACORDES[comp % 4], filtrado = t >= FILTRO[0] && t < FILTRO[1];
  bombo(t, filtrado ? 0.32 : 0.5);
  if (k % 4 === 0) { bajoSynth(t, raiz, B * 4, 0.16, filtrado ? 300 : 700); colchon(t, B * 4, notas.map((m) => m - 12), filtrado ? 0.02 : 0.035); }
  if (!filtrado && k % 2 === 1) caja(t, 0.18);
  hat(t + B / 2, filtrado ? 0.03 : 0.06);
  if (!filtrado) [0, 0.25, 0.5, 0.75].forEach((f, i) => pluck(t + f * B, notas[(k * 4 + i) % 4] + (i === 3 ? 12 : 0), 0.05, (i - 1.5) * 0.3));
}
// redoble hacia «estilos» y remate
for (let t = 40.36, d = 0.25; t < 42.05; t += d, d = Math.max(0.06, d * 0.85)) caja(t, 0.12 + (t - 40.3) * 0.06);
subida(41.3, 0.78, 0.18);
platillo(42.08, 0.25, 2.2); bombo(42.08, 0.6);
// cierre: acorde que resuelve, golpe con el logo y cola de colchón hasta el final
bombo(42.8, 0.55); platillo(42.8, 0.18, 2.5);
colchon(42.7, 5.9, [53, 60, 65, 69, 72], 0.045);
bajoSynth(42.7, 41, 5.5, 0.14, 500);

// ---------------- efectos ----------------
const pop = (t0, f = 520, g = 0.25, pan = 0) => { let p = 0; add(SFX, t0, 0.22, g, pan, (t) => { p += (f * Math.exp(-9 * t) + f * 0.27) / SR; return sen(p) * Math.exp(-12 * t); }); };
const zumb = (t0, d = 0.35, g = 0.2, fc = 1500, pan = 0) => { const bp = new BP(fc); add(SFX, t0, d, g, pan, (t, u) => bp.p(ruido()) * Math.sin(Math.PI * u) * 1.5); };
const golpe = (t0, g = 0.7, f = 60) => { let p = 0; add(SFX, t0, 0.9, g, 0, (t) => { p += (f * Math.exp(-3 * t) + f * 0.55) / SR; return sen(p) * Math.exp(-4.5 * t) * 1.2; }); const lp = new LP(800); add(SFX, t0, 0.5, g * 0.6, 0, (t) => lp.p(ruido()) * Math.exp(-8 * t) * 2); };
const click = (t0, g = 0.25, fc = 2600, pan = 0) => { const bp = new BP(fc); add(SFX, t0, 0.05, g, pan, (t) => bp.p(ruido()) * Math.exp(-90 * t) * 2.5); };
const ding = (t0, m, g = 0.12, pan = 0) => { let p = 0; const f = hz(m); add(SFX, t0, 0.8, g, pan, (t) => { p += f / SR; return (sen(p) + 0.3 * sen(p * 2.76)) * Math.exp(-5 * t); }); };
const papel = (t0, d = 0.2, g = 0.2, fc = 3200, pan = 0) => { const bp = new BP(fc); add(SFX, t0, d, g, pan, (t, u) => bp.p(ruido()) * (1 - u) * 1.6); };
const rasgado = (t0, d, g = 0.3) => { const bp = new BP(2800); add(SFX, t0, d, g, 0.2, (t, u) => bp.p(ruido()) * (0.3 + 0.7 * (rnd() < 0.35 ? 1 : 0.2)) * Math.min(1, u * 10, (1 - u) * 5) * 1.8); };
const marcador = (t0, d, g = 0.14) => { const bp = new BP(1900); add(SFX, t0, d, g, -0.1, (t, u) => bp.p(ruido()) * (0.6 + 0.4 * Math.sin(t * 90)) * Math.min(1, u * 12, (1 - u) * 12) * 1.6); };
const silbido = (t0, d, g = 0.3, baja = false) => { let p = 0; const bp = new BP(1200); add(SFX, t0, d, g, 0.2, (t, u) => { const k = baja ? 1 - u : u; p += (300 + 1700 * k * k) / SR; return (sen(p) * 0.5 + bp.p(ruido()) * 0.8) * Math.min(1, u * 3, (1 - u) * 6); }); };
const viento = (t0, d, g = 0.1) => { const lp = new LP(420); add(SFX, t0, d, g, 0, (t, u) => lp.p(ruido()) * 2.4 * (0.6 + 0.4 * Math.sin(t * 0.9)) * Math.min(1, t / 0.3, (1 - u) * 4)); };
const boing = (t0, g = 0.16, pan = -0.2) => { let p = 0; add(SFX, t0, 0.4, g, pan, (t, u) => { p += (220 + 380 * Math.sin(Math.PI * u)) / SR; return sen(p) * Math.exp(-4 * t); }); };
const sello = (t0, g = 0.5) => { golpe(t0, g, 95); click(t0, g * 0.6, 1200); };
const tecla = (t0, g = 0.16) => { click(t0, g, 3000 + rnd() * 800, 0.2); const lp = new LP(600); add(SFX, t0, 0.06, g * 0.8, 0.2, (t) => lp.p(ruido()) * Math.exp(-60 * t) * 3); };
const casco = (t0, g = 0.16, pan = -0.4) => { const bp = new BP(650); add(SFX, t0, 0.09, g, pan, (t) => bp.p(ruido()) * Math.exp(-45 * t) * 3); };
const candado = (t0, g = 0.4) => { click(t0, g, 2200, 0); click(t0 + 0.05, g * 0.8, 3400, 0); [2093, 3136, 4186].forEach((f, i) => { let p = 0; add(SFX, t0 + 0.04, 0.6, g * 0.18 / (i + 1), 0, (t) => { p += f / SR; return sen(p) * Math.exp(-9 * t); }); }); golpe(t0, g * 0.5, 120); };
const murmullo = (t0, d, g = 0.08) => { const voces = [new BP(380), new BP(620), new BP(950)]; add(SFX, t0, d, g, 0, (t, u) => voces.reduce((s, f, i) => s + f.p(ruido()) * (0.6 + 0.4 * Math.sin(t * (3.1 + i * 1.7) + i)), 0) * 2.2 * Math.min(1, t / 0.8, (1 - u) * 3)); };

// ---------------- efectos sobre las palabras ----------------
// Un bloque por escena, con los mismos instantes de su tabla T (segundos de la voz).
const whoosh = (t0, g = 0.22) => silbido(t0 - 0.18, 0.3, g, true);
// 1 · gancho: el punto cae y aterriza; tic por palabra
silbido(0.05, 1.0, 0.12, true); golpe(1.11, 0.55, 70); [0.0, 0.58, 0.91].forEach((t) => click(t, 0.12, 3200));
// 2 · problema: un clic por clip, tachones y el desarme
[2.71, 3.79, 4.78].forEach((t) => marcador(t + 0.28, 0.24, 0.16));
golpe(5.12, 0.35, 45); zumb(5.12, 0.5, 0.18, 400);
// 3 · marca: el logo se escribe y cierra
marcador(6.04, 0.8, 0.12); golpe(6.84, 0.7, 60); ding(6.84, 84, 0.08);
// 4 · terminal: estado, tecleo de /jp-nuevo-video y enter
for (let i = 0; i < 15; i++) tecla(12.19 + i * (1.0 / 15), 0.12);
click(13.53, 0.3, 1800); pop(13.6, 700, 0.2); [13.65, 13.75, 13.85].forEach((t, i) => pop(t, 900 + i * 200, 0.08, 0.3));
// cambios de piel: un barrido en cada corte por coincidencia
[14.35, 16.8, 19.4333, 21.0667, 24.1, 25.8833].forEach((t) => whoosh(t, 0.2));
// 5 · tarjetas: contador y onda
for (let i = 0; i < 6; i++) click(14.58 + i * 0.2, 0.1, 2400 + i * 200);
ding(16.29, 88, 0.1);
// 6 · vox: papel, rotulador y lápiz
rasgado(16.85, 0.3, 0.22); papel(17.0, 0.25, 0.2); marcador(17.63, 0.55, 0.12); marcador(18.18, 0.5, 0.12); rasgado(18.64, 0.28, 0.2);
// 7 · cómic: impulso y ¡POW!
silbido(19.6, 0.5, 0.14, false); golpe(20.1, 0.8, 70); sello(20.12, 0.4); boing(20.3, 0.12);
// 8 · capas: aire
viento(21.1, 2.9, 0.1); ding(22.82, 79, 0.06, -0.3); ding(22.95, 84, 0.05, 0.3);
// 9 · plano: pasos con rebote
for (let t = 24.2; t < 25.8; t += 0.3) casco(t, 0.12, t % 0.6 < 0.3 ? -0.3 : 0.3);
// 10 · tipográfico: golpes de palabra
click(26.22, 0.14, 3000); golpe(27.14, 0.4, 80); pop(27.83, 600, 0.18); golpe(27.85, 0.3, 90);
// 11 · fases: tic por ficha y ✓ por compuerta
[28.7, 29.2, 29.6, 30.36, 31.12].forEach((t) => click(t - 0.08, 0.16, 2200));
for (let i = 0; i < 5; i++) candado(31.72 + i * 0.14, 0.18);
// 12 · formatos
whoosh(34.6, 0.14); whoosh(35.48, 0.14);
// 13 · código: tecleo del código y reloj cuadro a cuadro
for (let i = 0; i < 24; i++) tecla(37.2 + i * 0.05, 0.06);
for (let i = 0; i < 5; i++) click(39.07 + i * 0.28, 0.2, 1500);
ding(38.27, 91, 0.07);
// 14 · todos los estilos: entran las miniaturas
for (let i = 0; i < 6; i++) pop(40.28 + i * 0.07, 500 + i * 60, 0.1, (i % 2 ? 0.3 : -0.3));
// 15 · cierre: el logo, «código abierto» y la URL
marcador(42.73, 0.8, 0.1); click(43.97, 0.15, 2000); ding(45.18, 84, 0.1); ding(45.3, 91, 0.07);

// ---------------- escritura ----------------
function wav(P, file) {
  const buf = Buffer.alloc(44 + N * 4);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write("WAVE", 8); buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(N * 4, 40);
  let pk = 0; for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(P.L[i]), Math.abs(P.R[i]));
  const g = pk > 0.89 ? 0.89 / pk : 1;
  for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(P.L[i] * g * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(P.R[i] * g * 32767), 46 + i * 4); }
  fs.writeFileSync(path.join(__dirname, file), buf);
  console.log(file, "pico", pk.toFixed(2), "dur", DUR.toFixed(3));
}
wav(MUS, "musica.wav");
wav(SFX, "sfx.wav");
