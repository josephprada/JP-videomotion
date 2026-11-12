const test = require("node:test");
const assert = require("node:assert/strict");
global.M = require("../lib/motion.js");
const C = require("./collage.js");

test("bordeRasgado: rodea el rectángulo sin alejarse más que amp y es el mismo para la misma semilla", () => {
  const a = C.bordeRasgado(7, 100, 200, 400, 300, { paso: 20, amp: 6 });
  assert.ok(a.length >= (2 * (400 + 300)) / 20 - 4);
  for (const [x, y] of a) {
    assert.ok(x >= 94 && x <= 506, `x fuera: ${x}`);
    assert.ok(y >= 194 && y <= 506, `y fuera: ${y}`);
  }
  assert.deepEqual(a, C.bordeRasgado(7, 100, 200, 400, 300, { paso: 20, amp: 6 }));
  assert.notDeepEqual(a, C.bordeRasgado(8, 100, 200, 400, 300, { paso: 20, amp: 6 }));
});

test("trazoMano: con k = 0 no hay trazo; con k = 1 da más de una vuelta (el círculo a mano se pasa de largo)", () => {
  assert.ok(C.trazoMano(0, 0, 100, 60, 0).length <= 1);
  const p = C.trazoMano(0, 0, 100, 60, 1, { vueltas: 1.15 });
  const ang = p.map(([x, y]) => Math.atan2(y / 60, x / 100));
  let total = 0;
  for (let i = 1; i < ang.length; i++) { let d = ang[i] - ang[i - 1]; if (d < -Math.PI) d += 2 * Math.PI; if (d > Math.PI) d -= 2 * Math.PI; total += d; }
  assert.ok(Math.abs(total) > 2 * Math.PI, `giro total ${total}`);
});

test("trazoMano: crece con k y es determinista", () => {
  assert.ok(C.trazoMano(0, 0, 100, 60, 0.3).length < C.trazoMano(0, 0, 100, 60, 0.9).length);
  assert.deepEqual(C.trazoMano(5, 5, 80, 80, 0.7, { semilla: 3 }), C.trazoMano(5, 5, 80, 80, 0.7, { semilla: 3 }));
});

test("tonoArchivo: pasa a monocromo sepia con contraste: lo claro queda claro, lo oscuro oscuro y el tono es cálido", () => {
  const claro = C.tonoArchivo(240, 240, 240), oscuro = C.tonoArchivo(20, 20, 20);
  assert.ok(claro[0] > 200 && oscuro[0] < 60);
  const m = C.tonoArchivo(30, 140, 200);
  assert.ok(m[0] >= m[1] && m[1] >= m[2], `no es cálido: ${m}`);
  assert.ok(m.every((v) => v >= 0 && v <= 255 && Number.isInteger(v)));
});
