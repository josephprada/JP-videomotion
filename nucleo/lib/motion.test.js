// node --test lib/
const test = require("node:test");
const assert = require("node:assert/strict");
const M = require("./motion.js");

test("spring: 0 antes de empezar, se asienta en 1", () => {
  assert.equal(M.spring(-1), 0);
  assert.equal(M.spring(0), 0);
  assert.ok(Math.abs(M.spring(3) - 1) < 1e-3);
});

test("spring: sobrepaso con amortiguación baja, ninguno con crítica", () => {
  const max = (k, d) => Math.max(...Array.from({ length: 300 }, (_, i) => M.spring(i / 100, k, d)));
  assert.ok(max(200, 14) > 1.05, "playful debe pasarse");
  assert.ok(max(100, 20) <= 1 + 1e-9, "z >= 1 no sobrepasa");
});

test("track: arranca en el primer valor y llega al último", () => {
  const keys = [[0, 10], [1, 50], [2, -20]];
  assert.equal(M.track(0, keys), 10);
  assert.ok(Math.abs(M.track(6, keys) - -20) < 1e-2);
});

test("track: es continuo cuando cambia de objetivo (sin saltos)", () => {
  const keys = [[0, 0], [0.5, 100], [0.8, 300]];
  for (let t = 0; t < 3; t += 1 / 240) {
    const d = Math.abs(M.track(t + 1 / 240, keys) - M.track(t, keys));
    assert.ok(d < 15, `salto de ${d.toFixed(2)} en t=${t.toFixed(3)}`);
  }
});

test("rng: misma semilla, misma secuencia; distinta semilla, distinta", () => {
  const a = M.rng(7), b = M.rng(7), c = M.rng(8);
  const sa = [a(), a(), a()], sb = [b(), b(), b()];
  assert.deepEqual(sa, sb);
  assert.notDeepEqual(sa, [c(), c(), c()]);
  for (const v of sa) assert.ok(v >= 0 && v < 1);
});

test("noise: determinista y suave", () => {
  assert.equal(M.noise(3, 1.234), M.noise(3, 1.234));
  for (let t = 0; t < 4; t += 0.01) assert.ok(Math.abs(M.noise(3, t + 0.01) - M.noise(3, t)) < 0.1);
});

test("held: retiene el dibujo n cuadros (animación limitada)", () => {
  assert.equal(M.held(0.00, 12), 0);
  assert.equal(M.held(0.08, 12), 0);
  assert.ok(Math.abs(M.held(0.09, 12) - 1 / 12) < 1e-9);
});

test("shake: cero antes del golpe, decae a cero", () => {
  assert.deepEqual(M.shake(0.9, 1, 20), [0, 0]);
  const [x, y] = M.shake(4, 1, 20);
  assert.ok(Math.abs(x) < 0.5 && Math.abs(y) < 0.5);
});

test("beat: rejilla de tiempo", () => {
  assert.equal(M.beat(4, 120), 2);
  assert.equal(M.beat(4, 120, 0.25), 2.25);
});
