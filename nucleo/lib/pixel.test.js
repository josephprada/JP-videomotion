const test = require("node:test");
const assert = require("node:assert/strict");
const X = require("./pixel.js");

test("parsePal: #RGB de 12 bits a tripletes de 8 bits", () => {
  assert.deepEqual(X.parsePal(["#F00", "#08f"]), [[255, 0, 0], [0, 136, 255]]);
});

test("bayer4: 16 umbrales distintos en [0,1)", () => {
  const s = new Set();
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) s.add(X.bayer4(x, y));
  assert.equal(s.size, 16);
  for (const v of s) assert.ok(v >= 0 && v < 1);
});

test("quantize: todo píxel sale con un color de la paleta", () => {
  const pal = X.parsePal(["#000", "#FFF", "#F80", "#048"]);
  const w = 8, h = 8, d = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) d.set([i * 4, 255 - i * 3, (i * 7) % 255, 255], i * 4);
  X.quantize(d, w, h, pal, 0.5);
  const ok = new Set(pal.map((c) => c.join()));
  for (let i = 0; i < w * h; i++) assert.ok(ok.has([d[i * 4], d[i * 4 + 1], d[i * 4 + 2]].join()));
});

test("quantize: un gris medio entre negro y blanco se trama mitad y mitad", () => {
  const pal = X.parsePal(["#000", "#FFF"]);
  const w = 4, h = 4, d = new Uint8ClampedArray(w * h * 4).fill(128);
  X.quantize(d, w, h, pal, 1);
  let blancos = 0;
  for (let i = 0; i < 16; i++) blancos += d[i * 4] === 255;
  assert.equal(blancos, 8);
});

test("quantize: es determinista", () => {
  const pal = X.parsePal(["#000", "#FFF", "#F00"]);
  const mk = () => { const d = new Uint8ClampedArray(64 * 4); for (let i = 0; i < 64; i++) d.set([i * 3, i * 2, 200 - i, 255], i * 4); return d; };
  const a = mk(), b = mk();
  X.quantize(a, 8, 8, pal, 0.6); X.quantize(b, 8, 8, pal, 0.6);
  assert.deepEqual(a, b);
});

test("quantize: un color que ya está en la paleta queda plano (sin tramado)", () => {
  const pal = X.parsePal(["#000", "#FFF", "#E96", "#C74"]);
  const w = 8, h = 8, d = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) d.set([0xEE, 0x99, 0x66, 255], i * 4);
  X.quantize(d, w, h, pal, 0.8);
  for (let i = 0; i < w * h; i++) assert.deepEqual([d[i * 4], d[i * 4 + 1], d[i * 4 + 2]], [0xEE, 0x99, 0x66]);
});
