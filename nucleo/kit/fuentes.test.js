const test = require("node:test");
const assert = require("node:assert/strict");
const F = require("./fuentes.js");

test("rutaCss: resuelve el css de @fontsource desde la carpeta del estilo hasta nucleo/node_modules", () => {
  const base = "file:///C:/repo/estilos/plano/estilo.js";
  assert.equal(F.rutaCss(base, "montserrat/800.css"), "file:///C:/repo/nucleo/node_modules/@fontsource/montserrat/800.css");
});

test("rutaCss: acepta un paquete sin peso (usa index.css)", () => {
  assert.equal(F.rutaCss("file:///r/estilos/comic/estilo.js", "bangers"), "file:///r/nucleo/node_modules/@fontsource/bangers/index.css");
});
