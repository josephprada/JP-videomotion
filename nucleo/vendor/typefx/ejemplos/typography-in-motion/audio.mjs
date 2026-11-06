// Sintetiza la pista de «Typography in Motion» (24 s, 120 BPM, la menor, 12 compases).
// Uso: node clips/typography-in-motion/audio.mjs
// Escribe build/mix.wav (mezcla) y build/kick.wav (bombo solo, para medir la rejilla).
//
// Cada efecto tiene su firma sonora, colocada en los mismos pulsos que su golpe visual
// (t = 2·escena + 0,5·pulso local; ver composition.js).

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SR = 48000;
const DUR = 24;
const BPM = 120;
const P = 60 / BPM;
const N = SR * DUR;
const b = (k) => k * P;
const at = (scene, beat) => scene * 2 + beat * P;

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(55);
const noise = () => rnd() * 2 - 1;

const L = new Float32Array(N);
const R = new Float32Array(N);
const kickStem = new Float32Array(N);

function put(i, v, pan = 0) {
  if (i < 0 || i >= N) return;
  const a = ((pan + 1) * Math.PI) / 4;
  L[i] += v * Math.cos(a);
  R[i] += v * Math.sin(a);
}

const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
const clamp = (x, a = 0, c = 1) => Math.min(c, Math.max(a, x));
const prog = (t, s, d) => clamp((t - s) / d);
const outCubic = (x) => 1 - Math.pow(1 - x, 3);

// ---------- instrumentos ----------

const kicks = [];
function kick(t0, gain = 1) {
  kicks.push(t0);
  const s0 = Math.round(t0 * SR);
  let ph = 0;
  for (let n = 0; n < SR * 0.45; n++) {
    const tt = n / SR;
    const f = 44 + 110 * Math.exp(-tt * 32);
    ph += (2 * Math.PI * f) / SR;
    const v = (Math.sin(ph) * Math.exp(-tt * 8) + noise() * Math.exp(-tt * 700) * 0.18) * gain * 0.95;
    put(s0 + n, v);
    if (s0 + n < N) kickStem[s0 + n] += v;
  }
}

// Ducking tipo sidechain: baja bajo y pad justo después de cada bombo.
function duck(t) {
  let last = -10;
  for (const k of kicks) if (k <= t && k > last) last = k;
  return 1 - 0.75 * Math.exp(-(t - last) * 10);
}

function hat(t0, gain = 0.18, pan = 0.25) {
  const s0 = Math.round(t0 * SR);
  let lp = 0;
  for (let n = 0; n < SR * 0.07; n++) {
    const x = noise();
    lp += 0.35 * (x - lp);
    put(s0 + n, (x - lp) * Math.exp(-(n / SR) * 80) * gain, pan);
  }
}

// Filtro de estado variable (Chamberlin), para palmas y barridos.
function svf() {
  let low = 0, band = 0;
  return (x, f, q = 0.7) => {
    const F = 2 * Math.sin((Math.PI * Math.min(f, SR / 6)) / SR);
    low += F * band;
    const high = x - low - q * band;
    band += F * high;
    return { low, band, high };
  };
}

function clap(t0, gain = 0.32) {
  const s0 = Math.round(t0 * SR);
  const f = svf();
  for (let n = 0; n < SR * 0.25; n++) {
    const tt = n / SR;
    const bursts = [0, 0.011, 0.022].reduce((a, o) => a + (tt >= o ? Math.exp(-(tt - o) * 140) : 0), 0);
    const env = bursts * 0.5 + Math.exp(-tt * 18) * 0.6;
    put(s0 + n, f(noise(), 1400, 0.9).band * env * gain, -0.1);
  }
}

function bassNote(t0, dur, midi, gain = 0.32) {
  const s0 = Math.round(t0 * SR);
  const f0 = hz(midi);
  let p1 = 0, p2 = 0, lp = 0;
  for (let n = 0; n < SR * (dur + 0.05); n++) {
    const tt = n / SR;
    p1 = (p1 + f0 / SR) % 1;
    p2 = (p2 + (f0 * 1.006) / SR) % 1;
    const saw = (p1 * 2 - 1) * 0.6 + (p2 * 2 - 1) * 0.4;
    const cut = 180 + 900 * Math.exp(-tt * 14);
    lp += (1 - Math.exp((-2 * Math.PI * cut) / SR)) * (saw - lp);
    const env = Math.min(1, tt / 0.004) * (tt < dur ? 1 : Math.exp(-(tt - dur) * 120));
    put(s0 + n, (lp + Math.sin(2 * Math.PI * f0 * tt) * 0.5) * env * gain * duck(t0 + tt));
  }
}

// Karplus-Strong con ruido sembrado: cuerda pulsada.
function pluck(t0, midi, gain = 0.22, pan = 0, decay = 0.996) {
  const s0 = Math.round(t0 * SR);
  const len = Math.max(2, Math.round(SR / hz(midi)));
  const buf = new Float32Array(len);
  for (let i = 0; i < len; i++) buf[i] = noise();
  let idx = 0;
  let lp = 0;
  for (let n = 0; n < SR * 1.6; n++) {
    const a = buf[idx];
    const c = buf[(idx + 1) % len];
    buf[idx] = ((a + c) / 2) * decay;
    idx = (idx + 1) % len;
    lp += 0.5 * (a - lp);
    put(s0 + n, lp * gain * Math.min(1, n / 40), pan);
  }
}

function pad(t0, dur, midis, gain = 0.05) {
  const s0 = Math.round(t0 * SR);
  midis.forEach((m, vi) => {
    const f0 = hz(m);
    let ph = rnd(), lp = 0;
    const pan = (vi / Math.max(1, midis.length - 1)) * 1.2 - 0.6;
    for (let n = 0; n < SR * (dur + 0.3); n++) {
      const tt = n / SR;
      ph = (ph + (f0 * (1 + 0.002 * Math.sin(tt * 3 + vi))) / SR) % 1;
      lp += 0.06 * (ph * 2 - 1 - lp);
      const env = Math.min(1, tt / 0.12) * (tt < dur ? 1 : Math.exp(-(tt - dur) * 12));
      put(s0 + n, lp * env * gain * duck(t0 + tt), pan);
    }
  });
}

function whoosh(t0, t1, f0, f1, pan0 = 0, pan1 = 0, gain = 0.5) {
  const s0 = Math.round(t0 * SR);
  const len = Math.round((t1 - t0 + 0.12) * SR);
  const f = svf();
  for (let n = 0; n < len; n++) {
    const x = n / ((t1 - t0) * SR);
    const k = Math.min(1, x);
    const fc = f0 * Math.pow(f1 / f0, k);
    const env = x <= 1 ? Math.pow(k, 2.2) : Math.exp(-(x - 1) * 25);
    put(s0 + n, f(noise(), fc, 0.45).band * env * gain, pan0 + (pan1 - pan0) * k);
  }
}

function impact(t0, gain = 0.8) {
  const s0 = Math.round(t0 * SR);
  let ph = 0, lp = 0;
  for (let n = 0; n < SR * 1.2; n++) {
    const tt = n / SR;
    ph += (2 * Math.PI * (38 + 30 * Math.exp(-tt * 6))) / SR;
    lp += 0.08 * (noise() - lp);
    put(s0 + n, (Math.sin(ph) * Math.exp(-tt * 3.2) + lp * Math.exp(-tt * 9) * 1.4) * gain);
  }
}

function tick(t0, f = 3200, gain = 0.09, pan = 0) {
  const s0 = Math.round(t0 * SR);
  for (let n = 0; n < SR * 0.02; n++) {
    const tt = n / SR;
    put(s0 + n, (Math.sin(2 * Math.PI * f * tt) * 0.7 + noise() * 0.3) * Math.exp(-tt * 380) * gain, pan);
  }
}


// Oscilador con barrido de tono: el «muelle» de STRETCH.
function boing(t0, f0, f1, dur, gain = 0.3, pan = 0) {
  const s0 = Math.round(t0 * SR);
  let ph = 0;
  for (let n = 0; n < SR * dur; n++) {
    const tt = n / SR, x = tt / dur;
    const f = f0 * Math.pow(f1 / f0, 1 - Math.exp(-x * 5)) * (1 + 0.08 * Math.exp(-x * 3) * Math.sin(tt * 2 * Math.PI * 11));
    ph += (2 * Math.PI * f) / SR;
    put(s0 + n, Math.sin(ph) * Math.exp(-x * 3.5) * Math.min(1, n / 60) * gain, pan);
  }
}

// Bajo con LFO de filtro: el temblor de WARP.
function wobble(t0, dur, midi, rate, gain = 0.3) {
  const s0 = Math.round(t0 * SR);
  const f0 = hz(midi);
  let p1 = 0, lp = 0;
  for (let n = 0; n < SR * dur; n++) {
    const tt = n / SR;
    p1 = (p1 + f0 / SR) % 1;
    const saw = p1 * 2 - 1;
    const cut = 140 + 1500 * (0.5 + 0.5 * Math.sin(2 * Math.PI * rate * tt - Math.PI / 2));
    lp += (1 - Math.exp((-2 * Math.PI * cut) / SR)) * (saw - lp);
    const env = Math.min(1, tt / 0.01) * Math.min(1, (dur - tt) / 0.03);
    put(s0 + n, (lp * 0.8 + Math.sin(2 * Math.PI * f0 * tt) * 0.4) * env * gain * duck(t0 + tt));
  }
}

// Onda de pulso con anchura variable: el peso de VARIABLE.
function pwm(t0, dur, midis, gain = 0.06) {
  const s0 = Math.round(t0 * SR);
  midis.forEach((m, vi) => {
    const f0 = hz(m);
    let ph = vi * 0.3, lp = 0;
    for (let n = 0; n < SR * dur; n++) {
      const tt = n / SR, x = tt / dur;
      ph = (ph + f0 / SR) % 1;
      const width = 0.08 + 0.42 * x;
      lp += 0.12 * ((ph < width ? 1 : -1) - lp);
      const env = Math.min(1, tt / 0.05) * Math.min(1, (dur - tt) / 0.05);
      put(s0 + n, lp * env * gain * (0.4 + x), -0.4 + vi * 0.4);
    }
  });
}

// Ráfaga de ruido filtrado en bloques: cristal para SPLIT.
function shatter(t0, gain = 0.4) {
  for (let k = 0; k < 9; k++) {
    const t = t0 + k * 0.012 + rnd() * 0.01;
    const f = svf();
    const s0 = Math.round(t * SR);
    const fc = 2500 + rnd() * 6000;
    const pan = rnd() * 1.6 - 0.8;
    for (let n = 0; n < SR * 0.18; n++) put(s0 + n, f(noise(), fc, 0.15).band * Math.exp(-(n / SR) * (28 + k * 3)) * gain * (1 - k / 11), pan);
  }
}

// Pad con puerta rítmica (semicorcheas): las persianas de MASK.
function gatedPad(t0, dur, midis, pattern, gain = 0.06) {
  const s0 = Math.round(t0 * SR);
  midis.forEach((m, vi) => {
    const f0 = hz(m);
    let ph = rnd(), lp = 0, g = 0;
    for (let n = 0; n < SR * dur; n++) {
      const tt = n / SR;
      ph = (ph + f0 / SR) % 1;
      lp += 0.09 * (ph * 2 - 1 - lp);
      const step = Math.floor(tt / (P / 4));
      const target = pattern[step % pattern.length] ? 1 : 0;
      g += (target - g) * 0.004;
      put(s0 + n, lp * g * gain, -0.5 + vi * 0.5);
    }
  });
}

// Eco: repeticiones a corchea con caída, como las copias de ECHO.
function echoPluck(t0, midi, repeats = 5, gain = 0.22) {
  for (let r = 0; r <= repeats; r++) pluck(t0 + r * (P / 4), midi, gain * Math.pow(0.62, r), r % 2 ? 0.45 : -0.45);
}

// ---------- arreglo ----------
// La menor: Am F C G (dos veces), Am F G Am.
const ROOTS = [33, 29, 36, 31, 33, 29, 36, 31, 33, 29, 31, 33];
const CHORDS = {
  33: [57, 60, 64], 29: [57, 60, 65], 36: [55, 60, 64], 31: [55, 59, 62],
};

for (let k = 0; k < 48; k++) kick(b(k), k % 4 === 0 ? 1.08 : 0.92);
for (let k = 0; k < 48; k++) if (k % 2 === 1) clap(b(k), 0.26);
for (let k = 0; k < 96; k++) if (k % 2 === 1) hat(k * P / 2, 0.14, 0.25);
for (let k = 0; k < 96; k++) if (k % 2 === 0 && k >= 16) hat(k * P / 2 + P / 4, 0.06, -0.3);

ROOTS.forEach((root, bar) => {
  const t0 = bar * 2;
  if (bar === 1) return wobble(t0, 2, root, 4);
  for (let i = 0; i < 8; i++) bassNote(t0 + i * P / 2, P / 2 - 0.03, root + (i % 4 === 3 ? 12 : 0), 0.26);
  if (bar !== 7) pad(t0, 2, CHORDS[root], 0.032);
});

// 01 STRETCH: golpe inicial, muelle al estirarse, golpe sordo al aplastar y cremallera hacia arriba.
impact(0, 0.7);
boing(0, 55, 330, 0.55, 0.32);
boing(at(0, 1), 120, 520, 0.4, 0.18, 0.2);
impact(at(0, 2), 0.45);
whoosh(at(0, 3), at(0, 3) + 0.28, 400, 9000, -0.3, 0.3, 0.45);

// 02 WARP: la lente cruza de izquierda a derecha y el remolino gira hacia abajo.
whoosh(at(1, 1), at(1, 2.2), 600, 3000, -0.9, 0.9, 0.35);
whoosh(at(1, 2), at(1, 2.5), 5000, 300, 0.4, -0.4, 0.4);
whoosh(at(1, 3.3), at(1, 3.95), 300, 4000, 0, 0, 0.35);

// 03 MORPH: un barrido por transformación y una nota al resolverse cada letra.
[69, 72, 76, 74, 72].forEach((m, i) => {
  const a = at(2, 0.7 * i + 0.28), z = at(2, 0.7 * (i + 1));
  whoosh(a, z, 500, 2600 + i * 400, -0.3, 0.3, 0.22);
  pluck(z, m, 0.24, -0.2 + i * 0.1);
});

// 04 SPLIT: clics de láminas, cristal al romperse, succión al recomponerse y chasquido final.
for (let i = 0; i < 11; i++) tick(at(3, 0) + i * 0.022, 2600 + (i % 3) * 600, 0.07, i % 2 ? 0.6 : -0.6);
shatter(at(3, 1));
whoosh(at(3, 2), at(3, 2.85), 6000, 400, 0.5, -0.2, 0.4);
clap(at(3, 3), 0.4);
impact(at(3, 3), 0.4);
whoosh(at(3, 3.55), at(3, 4), 800, 7000, -0.6, 0.6, 0.35);

// 05 ECHO: notas con repeticiones a semicorchea; en P4 las copias colapsan.
echoPluck(at(4, 0), 76);
echoPluck(at(4, 1), 72);
echoPluck(at(4, 2), 69, 7, 0.2);
whoosh(at(4, 3), at(4, 3.25), 5000, 500, 0, 0, 0.35);
impact(at(4, 3.25), 0.3);

// 06 VARIABLE: la onda de pulso engorda con el peso; golpe al pasar de filete a negra.
pwm(at(5, 0), 1.5, [57, 64, 69], 0.05);
impact(at(5, 3), 0.55);
boing(at(5, 3), 80, 50, 0.4, 0.25);

// 07 ROTATION: un clic por letra que cae, barrido del giro y del cambio de eje.
for (let k = 0; k < 6; k++) tick(at(6, 0.45 + 0.07 * k), 1500 + k * 120, 0.12, -0.5 + k * 0.2);
whoosh(at(6, 1), at(6, 2), 300, 5000, -0.8, 0.8, 0.4);
whoosh(at(6, 2), at(6, 2.35), 4000, 600, 0.6, -0.6, 0.3);
for (let k = 0; k < 4; k++) tick(at(6, 3 + 0.07 * k), 4200, 0.08, k % 2 ? 0.4 : -0.4);

// 08 MASK: pad con puerta que se abre como las persianas; golpe al aparecer la M.
gatedPad(at(7, 0), 2, CHORDS[31], [1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1], 0.07);
impact(at(7, 1), 0.5);
whoosh(at(7, 2), at(7, 2.6), 400, 6000, 0, 0, 0.3);

// 09 TRACKING: un clic por letra que encaja en su columna; notas en la onda.
for (let k = 0; k < 8; k++) tick(at(8, 1 + 0.04 * k) + 0.05, 2200 + k * 200, 0.1, -0.7 + k * 0.2);
[69, 72, 69, 76].forEach((m, i) => pluck(at(8, 2 + i * 0.25), m, 0.14, i % 2 ? 0.3 : -0.3));
whoosh(at(8, 3), at(8, 3.4), 2000, 300, -0.5, 0.5, 0.3);

// 10 SCALE: subida hasta el zoom, caídas de ventanas, golpe del recorte y retroceso.
whoosh(at(9, 0), at(9, 0.75), 200, 8000, 0, 0, 0.45);
impact(at(9, 0.75), 0.6);
[0, 1, 2].forEach((i) => tick(at(9, 1 + i * 0.08), 900 - i * 150, 0.16, -0.6 + i * 0.6));
impact(at(9, 2), 0.45);
whoosh(at(9, 3), at(9, 3.42), 8000, 200, 0, 0, 0.45);
impact(at(9, 3.42), 0.5);

// 11 PATH: arpegio a semicorcheas que fluye como el texto.
for (let i = 0; i < 32; i++) {
  const ch = CHORDS[ROOTS[10]].concat([69, 72]);
  pluck(at(10, i * 0.25), ch[(i * 3) % ch.length] + (i >= 16 ? 12 : 0), 0.1, Math.sin(i * 0.7) * 0.6);
}

// 12 LAYER: acordes en cada cambio de disposición y golpe final; el aplastado cierra en grave.
[0, 1, 2].forEach((k) => [57, 60, 64, 69].forEach((m, i) => pluck(at(11, k) + i * 0.015, m + (k === 2 ? 2 : 0), 0.15, -0.4 + i * 0.25)));
impact(at(11, 3), 0.8);
[45, 52, 57, 60, 64, 69, 76].forEach((m, i) => pluck(at(11, 3) + i * 0.012, m, 0.2, -0.6 + i * 0.2, 0.998));
boing(at(11, 3.72), 300, 40, 0.28, 0.3);

// ---------- máster ----------

const fadeStart = DUR - 0.06;
let peak = 0;
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const g = t > fadeStart ? 1 - (t - fadeStart) / 0.06 : 1;
  L[i] = Math.tanh(L[i] * 1.1) * g;
  R[i] = Math.tanh(R[i] * 1.1) * g;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const norm = Math.pow(10, -1 / 20) / peak;

function wav(path, channels) {
  const frames = channels[0].length;
  const buf = Buffer.alloc(44 + frames * channels.length * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + frames * channels.length * 2, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(channels.length, 22); buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * channels.length * 2, 28); buf.writeUInt16LE(channels.length * 2, 32);
  buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(frames * channels.length * 2, 40);
  let o = 44;
  for (let i = 0; i < frames; i++) {
    for (const ch of channels) {
      buf.writeInt16LE(Math.round(clamp(ch[i], -1, 1) * 32767), o);
      o += 2;
    }
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, buf);
}

wav(join(HERE, 'build/mix.wav'), [L.map((v) => v * norm), R.map((v) => v * norm)]);
wav(join(HERE, 'build/kick.wav'), [kickStem]);
console.log('Escrito build/mix.wav y build/kick.wav');
