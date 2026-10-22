const test = require("node:test");
const assert = require("node:assert/strict");
const C = require("./comic.js");

test("aDos: cuantiza el tiempo a 12 fps (animación «en dos») y es estable dentro de cada paso", () => {
  assert.equal(C.aDos(0), 0);
  assert.equal(C.aDos(0.05), 0);
  assert.ok(Math.abs(C.aDos(0.09) - 1 / 12) < 1e-9);
  assert.equal(C.aDos(0.1), C.aDos(0.16));
  assert.ok(Math.abs(C.aDos(1.0, 8) - 1) < 1e-9);
});

test("luminancia: blanco 1, negro 0, el verde pesa más que el azul", () => {
  assert.ok(Math.abs(C.luminancia(255, 255, 255) - 1) < 1e-9);
  assert.equal(C.luminancia(0, 0, 0), 0);
  assert.ok(C.luminancia(0, 255, 0) > C.luminancia(0, 0, 255));
});

test("radioPunto: sin punto en las luces, crece con la sombra y nunca pasa del tope de la celda", () => {
  const celda = 10;
  assert.equal(C.radioPunto(0.9, celda), 0);
  assert.equal(C.radioPunto(0.62, celda), 0);
  const medio = C.radioPunto(0.4, celda), oscuro = C.radioPunto(0.1, celda);
  assert.ok(medio > 0 && oscuro > medio);
  assert.ok(C.radioPunto(0, celda) <= celda * 0.6);
});

test("desfase: sin separación en el plano de foco, crece con la distancia y se topa en max", () => {
  assert.equal(C.desfase(0, 10), 0);
  assert.ok(C.desfase(0.5, 10) > 0 && C.desfase(1, 10) > C.desfase(0.5, 10));
  assert.equal(C.desfase(3, 10), 10);
  assert.equal(C.desfase(-1, 10), 10);
});

test("pincelPoligono: trazo afinado en las puntas que sigue la línea y engorda en el centro", () => {
  const pts = [[0, 0], [50, 0], [100, 0]];
  const poli = C.pincelPoligono(pts, 10);
  assert.equal(poli.length, pts.length * 2);           // un lado de ida y otro de vuelta
  const ancho = (i) => Math.abs(poli[i][1] - poli[poli.length - 1 - i][1]);
  assert.ok(ancho(0) < 1.5 && ancho(2) < 1.5);        // puntas casi cero
  assert.ok(Math.abs(ancho(1) - 10) < 1e-6);          // ancho completo en el centro
  assert.ok(poli.every(([x]) => x >= -1e-9 && x <= 100 + 1e-9));
});

test("salpicadura: gotas deterministas por semilla, dentro del radio y con una mancha central mayor", () => {
  const a = C.salpicadura(7, 30, 100), b = C.salpicadura(7, 30, 100), c = C.salpicadura(8, 30, 100);
  assert.deepEqual(a, b);
  assert.notDeepEqual(a, c);
  assert.equal(a.length, 30);
  assert.ok(a.every(([x, y]) => Math.hypot(x, y) <= 100 + 1e-9));
  assert.ok(a[0][2] === Math.max(...a.map((g) => g[2])));
});

test("vinetaPoligono: el borde se traza con su propio Path2D, no con el trazado que dejó el contenido", () => {
  globalThis.Path2D ??= class { constructor() { this.ops = []; } moveTo(...a) { this.ops.push(["M", ...a]); } lineTo(...a) { this.ops.push(["L", ...a]); } closePath() { this.ops.push(["Z"]); } };
  const trazados = [];
  const ctx = { save() {}, restore() {}, clip() {}, beginPath() {}, ellipse() {}, fill() {}, stroke(p) { trazados.push(p); } };
  C.vinetaPoligono(ctx, [[0, 0], [100, 0], [100, 80]], (g) => { g.beginPath(); g.ellipse(50, 40, 3, 3, 0, 0, 7); g.fill(); });
  assert.equal(trazados.length, 1);
  assert.ok(trazados[0] instanceof Path2D, "el borde tiene que trazarse con el polígono, no con el trazado actual");
});
