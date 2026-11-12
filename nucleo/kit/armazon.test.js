const test = require("node:test");
const assert = require("node:assert/strict");
const A = require("./armazon.js");

const PLANOS = [[0, 2, "a"], [2, 5.5, "b"], [5.5, 9, "c"]];

test("planoEn: elige el plano cuyo intervalo [a, b) contiene t", () => {
  assert.equal(A.planoEn(PLANOS, 0)[2], "a");
  assert.equal(A.planoEn(PLANOS, 1.99)[2], "a");
  assert.equal(A.planoEn(PLANOS, 2)[2], "b");
  assert.equal(A.planoEn(PLANOS, 8.999)[2], "c");
});

test("planoEn: fuera de todos los planos devuelve null (el armazón pinta solo el fondo)", () => {
  assert.equal(A.planoEn(PLANOS, 9), null);
  assert.equal(A.planoEn(PLANOS, -0.1), null);
  assert.equal(A.planoEn([], 1), null);
});

test("planoEn: con planos solapados gana el primero de la lista", () => {
  assert.equal(A.planoEn([[0, 4, "x"], [3, 6, "y"]], 3.5)[2], "x");
});

test("tamano: 9x16 por defecto y los otros formatos desde la misma línea de tiempo, escalados", () => {
  assert.deepEqual(A.tamano("9x16", 1), [1080, 1920]);
  assert.deepEqual(A.tamano("1x1", 1), [1080, 1080]);
  assert.deepEqual(A.tamano("16x9", 0.5), [960, 540]);
  assert.deepEqual(A.tamano(null, 1), [1080, 1920]);
});

test("pintarFondo: un color llena el cuadro; una función recibe (g, W, H, t) y pinta el escenario", () => {
  const llamadas = [];
  const g = { setTransform() {}, fillRect: (...a) => llamadas.push(["rect", ...a]), set fillStyle(v) { llamadas.push(["color", v]); } };
  A.pintarFondo(g, 100, 200, 1.5, "#123456");
  assert.deepEqual(llamadas, [["color", "#123456"], ["rect", 0, 0, 100, 200]]);
  let recibido = null;
  A.pintarFondo(g, 100, 200, 1.5, (...a) => { recibido = a; });
  assert.deepEqual(recibido.slice(1), [100, 200, 1.5]);
});
