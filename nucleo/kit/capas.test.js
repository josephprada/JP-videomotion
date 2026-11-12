const test = require("node:test");
const assert = require("node:assert/strict");
global.M = require("../lib/motion.js");
const K = require("./capas.js");
const cerca = (a, b, e = 1e-9) => Math.abs(a - b) < e;

test("paralaje: con la cámara en reposo todas las capas coinciden con el cuadro de diseño", () => {
  for (const p of [0.1, 0.5, 1, 1.4]) {
    const t = K.paralaje({ x: 0, y: 0, z: 1 }, p, 1080, 1920);
    assert.ok(cerca(t.s, 1) && cerca(t.tx, 0) && cerca(t.ty, 0), `p=${p}`);
  }
});

test("paralaje: lo cercano se mueve y se agranda más que lo lejano; lo lejano casi no se mueve", () => {
  const cam = { x: 100, y: 0, z: 1.2 };
  const lejos = K.paralaje(cam, 0.1, 1080, 1920), cerca1 = K.paralaje(cam, 1.3, 1080, 1920);
  assert.ok(Math.abs(cerca1.tx) > Math.abs(lejos.tx));
  assert.ok(cerca1.s > lejos.s && lejos.s > 1);
  assert.ok(lejos.s < 1.03);
});

test("perfil: cubre de x0 a x1, queda dentro de base ± amp y es el mismo para la misma semilla", () => {
  const p = K.perfil(3, -100, 1200, 800, 150, { paso: 10 });
  assert.equal(p[0][0], -100);
  assert.ok(p[p.length - 1][0] >= 1200);
  assert.ok(p.every(([, y]) => y >= 650 - 1e-9 && y <= 950 + 1e-9));
  assert.deepEqual(p, K.perfil(3, -100, 1200, 800, 150, { paso: 10 }));
  assert.notDeepEqual(p, K.perfil(4, -100, 1200, 800, 150, { paso: 10 }));
});

test("atmosfera: a distancia 0 es el color, a 1 es la niebla y en medio queda entre los dos", () => {
  assert.equal(K.atmosfera("#204060", "#A0C0E0", 0), "rgb(32,64,96)");
  assert.equal(K.atmosfera("#204060", "#A0C0E0", 1), "rgb(160,192,224)");
  assert.equal(K.atmosfera("#204060", "#A0C0E0", 0.5), "rgb(96,128,160)");
});

test("vaiven: oscila dentro de ±amp, distinto en cada x y es función pura del tiempo", () => {
  for (let t = 0; t < 5; t += 0.37) assert.ok(Math.abs(K.vaiven(t, 300, { amp: 8 })) <= 8);
  assert.notEqual(K.vaiven(1, 100), K.vaiven(1, 400));
  assert.equal(K.vaiven(2.5, 250), K.vaiven(2.5, 250));
});
