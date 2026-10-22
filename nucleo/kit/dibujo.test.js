const test = require("node:test");
const assert = require("node:assert/strict");
const D = require("./dibujo.js");
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

test("ik: respeta los largos de los huesos y alcanza un objetivo alcanzable", () => {
  const [e, f] = D.ik([0, 0], [100, 120], 100, 90, 1);
  assert.ok(Math.abs(dist([0, 0], e) - 100) < 1e-6);
  assert.ok(Math.abs(dist(e, f) - 90) < 1e-6);
  assert.ok(dist(f, [100, 120]) < 1e-3);
});

test("ik: el signo elige el lado del codo", () => {
  const [e1] = D.ik([0, 0], [0, 150], 100, 100, 1);
  const [e2] = D.ik([0, 0], [0, 150], 100, 100, -1);
  assert.ok(Math.sign(e1[0]) === -Math.sign(e2[0]) && e1[0] !== 0);
});

test("ik: objetivo fuera de alcance → brazo estirado hacia él", () => {
  const [, f] = D.ik([0, 0], [0, 500], 100, 100, 1);
  assert.ok(Math.abs(f[1] - 200) < 0.1 && Math.abs(f[0]) < 0.5);
});

test("mezcla: extremos y punto medio", () => {
  assert.equal(D.mezcla("#000000", "#ffffff", 0), "#000000");
  assert.equal(D.mezcla("#000000", "#ffffff", 1), "#ffffff");
  assert.equal(D.mezcla("#000000", "#fefefe", 0.5), "#7f7f7f");
});

test("forma: sin tinta por defecto (el video 001 no cambia); con D.cfg.tinta traza el contorno", () => {
  globalThis.Path2D ??= class { constructor(d) { this.d = d; } }; // en Node no hay Path2D; SVGCtx solo lee __d
  require("./svgctx.js");
  const SVGCtx = globalThis.SVGCtx, d = "M 0 0 L 10 0 L 10 10 Z";
  const sin = new SVGCtx(20, 20); D.forma(sin, d, { b: "#ABCDEF" }); assert.doesNotMatch(sin.toString(), /stroke="#/);
  D.cfg.tinta = 3; D.cfg.colorTinta = "#111111";
  const con = new SVGCtx(20, 20); D.forma(con, d, { b: "#ABCDEF", s: "#123456" });
  D.cfg.tinta = 0;
  assert.match(con.toString(), /stroke="#111111"/);
});

test("forma: con D.cfg.trama los puntos van solo en la sombra (sombra → trama → luz, en ese orden)", () => {
  const usados = [];
  const ctx = { save() {}, restore() {}, clip() {}, translate() {}, stroke() {}, fill() { usados.push(this.fillStyle); }, fillStyle: null };
  globalThis.Path2D ??= class { constructor(d) { this.d = d; } };
  const TRAMA = { patron: true };
  D.cfg.trama = TRAMA;
  D.forma(ctx, "M 0 0 L 10 0 L 10 10 Z", { b: "#BBBBBB", s: "#555555" });
  D.cfg.trama = null;
  assert.deepEqual(usados, ["#555555", TRAMA, "#BBBBBB"]);
  usados.length = 0;
  D.forma(ctx, "M 0 0 L 10 0 L 10 10 Z", { b: "#BBBBBB", s: "#555555" });
  assert.deepEqual(usados, ["#555555", "#BBBBBB"]);   // sin trama: el look de siempre
});
