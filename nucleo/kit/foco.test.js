const test = require("node:test");
const assert = require("node:assert/strict");
global.M = require("../lib/motion.js");
const F = require("./foco.js");
const cerca = (a, b, e = 1e-6) => Math.abs(a - b) < e;

test("estado: antes de entrar no se ve; al terminar la entrada está nítido, opaco y a escala 1", () => {
  const o = { entra: 1, dur: 0.5, blur: 20 };
  assert.equal(F.estado(0.9, o).a, 0);
  const e = F.estado(1.5, o);
  assert.ok(cerca(e.a, 1) && cerca(e.blur, 0) && cerca(e.s, 1));
});

test("estado: a mitad de la entrada está desenfocado, semitransparente y un poco más chico", () => {
  const e = F.estado(1.25, { entra: 1, dur: 0.5, blur: 20, escala: 0.06 });
  assert.ok(e.a > 0 && e.a < 1);
  assert.ok(e.blur > 0 && e.blur < 20);
  assert.ok(e.s < 1 && e.s > 0.94);
});

test("estado: la salida vuelve a desenfocar y termina invisible", () => {
  const o = { entra: 0, sale: 2, dur: 0.4, blur: 16 };
  const medio = F.estado(2.2, o);
  assert.ok(medio.a < 1 && medio.blur > 0);
  assert.equal(F.estado(2.4, o).a, 0);
  assert.equal(F.estado(5, o).a, 0);
});

test("estado: sin «sale» se queda nítido para siempre; sin «entra» ya está dentro", () => {
  assert.ok(cerca(F.estado(99, { entra: 0 }).a, 1));
  assert.ok(cerca(F.estado(0, {}).a, 1));
});

test("estado: es función pura del tiempo (mismo t, mismo resultado)", () => {
  const o = { entra: 0.3, sale: 1.4 };
  assert.deepEqual(F.estado(0.5, o), F.estado(0.5, o));
});

test("profundidad: la capa en foco no se desenfoca y el desenfoque crece con la distancia, con tope", () => {
  assert.equal(F.profundidad(1, 1), 0);
  assert.ok(F.profundidad(0.4, 1) > F.profundidad(0.8, 1));
  assert.ok(F.profundidad(2, 1) > 0);
  assert.equal(F.profundidad(-50, 1, { apertura: 20, max: 30 }), 30);
});

test("karaoke: cada palabra entra en su tiempo; las que no han llegado no se ven", () => {
  const pal = [{ texto: "Head", t: 1 }, { texto: "to", t: 1.3 }, { texto: "head", t: 1.6 }];
  const k = F.karaoke(pal, 1.35, { dur: 0.3 });
  assert.equal(k.length, 3);
  assert.ok(cerca(k[0].a, 1) && cerca(k[0].blur, 0));
  assert.ok(k[1].a > 0 && k[1].a < 1 && k[1].blur > 0);
  assert.equal(k[2].a, 0);
  assert.equal(k[2].texto, "head");
});

test("karaoke: la salida del bloque desenfoca todas las palabras a la vez", () => {
  const pal = [{ texto: "a", t: 0 }, { texto: "b", t: 0.2 }];
  const k = F.karaoke(pal, 3.2, { sale: 3, dur: 0.4 });
  assert.ok(k.every((p) => p.a < 1 && p.blur > 0));
});
