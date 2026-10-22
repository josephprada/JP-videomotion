// Música y efectos del video, sintetizados en código (sin muestras de terceros).
// Los tiempos son segundos de la narración (voz/narracion-completa.mp3), los mismos de las tablas T de cada escena:
// los cortes caen en cuadros exactos, así que el tiempo global del video = tiempo de la voz.
// Música: elegir un género que sirva al tema; esta plantilla trae un vals de cuerdas pulsadas en 3/4 como punto de partida.
//   node sintesis.cjs  →  musica.wav + sfx.wav  (48 kHz, 16 bit, estéreo). Lo corre nucleo/tools/mezcla.sh.
const fs = require("fs"), path = require("path");
const DUR = 60; // = último corte de escena (fin de la última escena), no la duración de la voz
const SR = 48000, N = Math.ceil(SR * DUR);
const BPM = 96, B = 60 / BPM, COMPAS = 3 * B;

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

// ---------------- armonía y tramos ----------------
// La música sigue el relato: cada tramo es [desde, hasta, modo] en segundos de la voz. Fuera de los tramos, silencio
// (un silencio antes del golpe principal vale más que cualquier efecto). Ejemplo: misterio → silencio en el
// gancho → punteo suave → nota en vilo en el giro → banda completa en la revelación → solo bajo en el problema → remate.
const MENOR = [[45, [57, 60, 64, 69]], [41, [57, 60, 65, 69]], [43, [55, 59, 62, 67]], [40, [56, 59, 64, 68]]];  // Am F G E
const MAYOR = [[48, [60, 64, 67, 72]], [43, [59, 62, 67, 71]], [45, [60, 64, 69, 72]], [41, [60, 65, 69, 72]]];  // C G Am F
const TRAMOS = [
  [0, 3, "colchon"], [3.5, 30, "suave"], [30, DUR - 2, "lleno"],
];
const modoEn = (t) => { for (const [a, b, m] of TRAMOS) if (t >= a && t < b) return m; return null; };
const nComp = Math.ceil(DUR / COMPAS);
for (let c = 0; c < nComp; c++) {
  for (let pulso = 0; pulso < 6; pulso++) {
    const t0 = c * COMPAS + pulso * (B / 2), modo = modoEn(t0); if (!modo || modo === "colchon") continue;
    const acordes = modo === "lleno" ? MAYOR : MENOR, [raiz, notas] = acordes[c % 4];
    if (modo === "flaco") { if (pulso === 0) bajo(t0, raiz, 0.2); if (pulso === 3) bajo(t0, raiz + 7, 0.13); continue; }
    if (modo === "solo") { if (pulso % 3 === 0) cuerda(t0, notas[(c * 2 + pulso / 3) % 4] + 12, 0.16, 0.25, 2.2, 0.45, 0.998); continue; }
    if (pulso === 0) bajo(t0, raiz, modo === "lleno" ? 0.36 : 0.26);
    if (modo === "suave") cuerda(t0, notas[[0, 2, 1, 3, 2, 1][pulso]] + (pulso === 3 ? 12 : 0), 0.15, ((pulso % 3) - 1) * 0.3, 1.4, 0.4);
    else {
      if (pulso === 2 || pulso === 4) rasgueo(t0, notas, 0.16, 0.15, false);
      if (pulso === 5) rasgueo(t0, notas, 0.11, 0.15, true);
      maraca(t0, pulso % 2 ? 0.05 : 0.08);
      if (pulso === 1) cuerda(t0, notas[3] + 12, 0.09, 0.35, 0.9, 0.7);
    }
  }
}
colchon(0, 3.05, [45, 52, 57, 60], 0.05);
// golpes de la revelación y remate final: platillo(t), bombo(t), rasgueo(t, acorde, g)…

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
// Un bloque por escena, con los mismos instantes de su tabla T (segundos de la voz). Ejemplo:
// 1 · gancho
pop(0.4, 520, 0.24);                                         // entra el título

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
