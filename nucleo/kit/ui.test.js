const test = require("node:test");
const assert = require("node:assert/strict");
global.M = require("../lib/motion.js");
const U = require("./ui.js");
const cerca = (a, b, e = 1e-6) => Math.abs(a - b) < e;

test("contador: va de «desde» a «hasta» en su duración y se queda en «hasta»", () => {
  assert.equal(U.contador(0, 1, 2, 3, 14), 3);
  assert.equal(U.contador(3, 1, 2, 3, 14), 14);
  const m = U.contador(2, 1, 2, 3, 14);
  assert.ok(m > 3 && m < 14);
});

test("contador: con decimales redondea a esa precisión; sin ellos da enteros", () => {
  assert.equal(U.contador(1.7, 1, 2, 0, 100) % 1, 0);
  const v = U.contador(1.7, 1, 2, 0, 10.3, { decimales: 1 });
  assert.ok(cerca(v * 10, Math.round(v * 10)));
});

test("odometro: un valor entero da cada dígito en su lugar", () => {
  assert.deepEqual(U.odometro(237, 3), [2, 3, 7]);
  assert.deepEqual(U.odometro(5, 3), [0, 0, 5]);
});

test("odometro: el dígito de las unidades rueda con la fracción y el de las decenas solo cuando las unidades pasan de 9", () => {
  const [d, u] = U.odometro(14.5, 2);
  assert.ok(cerca(d, 1) && cerca(u, 4.5));
  const [d2, u2] = U.odometro(19.5, 2);
  assert.ok(cerca(d2, 1.5) && cerca(u2, 9.5));
});

test("trazoParcial: k = 0 deja solo el primer punto, k = 1 el trazo completo y k = 0,5 corta a la mitad del largo", () => {
  const pts = [[0, 0], [100, 0], [100, 100]];
  assert.deepEqual(U.trazoParcial(pts, 0), [[0, 0]]);
  assert.deepEqual(U.trazoParcial(pts, 1), pts);
  assert.deepEqual(U.trazoParcial(pts, 0.5), [[0, 0], [100, 0]]);
  assert.deepEqual(U.trazoParcial(pts, 0.75), [[0, 0], [100, 0], [100, 50]]);
});

test("onda: antes de empezar no hay onda; crece y se apaga en su duración", () => {
  assert.equal(U.onda(0.9, 1).a, 0);
  const a = U.onda(1.1, 1, { dur: 0.8 }), b = U.onda(1.6, 1, { dur: 0.8 });
  assert.ok(a.k < b.k && a.a > b.a && a.a > 0);
  assert.equal(U.onda(1.8, 1, { dur: 0.8 }).a, 0);
});
