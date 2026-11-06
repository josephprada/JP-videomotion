import test from "node:test";
import assert from "node:assert/strict";
import { normalizar, buscarPalabra, paletaTypefx, formatoDiseno } from "./tipovoz.mjs";

const P = [
  { texto: "¿Nadie", ini: 0.3, fin: 0.7 }, { texto: "creía", ini: 0.7, fin: 1.1 }, { texto: "en", ini: 1.1, fin: 1.4 },
  { texto: "esta", ini: 1.4, fin: 1.9 }, { texto: "idea?", ini: 1.9, fin: 2.4 }, { texto: "Esta", ini: 3.0, fin: 3.3 }, { texto: "vez", ini: 3.3, fin: 3.8 },
];

test("normalizar: minúsculas, sin tildes ni puntuación", () => {
  assert.equal(normalizar("¿Creía?"), "creia");
  assert.equal(normalizar("«AÑO»,"), "ano");
});

test("buscarPalabra: encuentra una palabra o una frase sin importar tildes, mayúsculas ni signos", () => {
  assert.deepEqual(buscarPalabra(P, "creia"), { texto: "creía", ini: 0.7, fin: 1.1 });
  assert.deepEqual(buscarPalabra(P, "esta idea"), { texto: "esta idea?", ini: 1.4, fin: 2.4 });
});

test("buscarPalabra: desde un segundo dado, para palabras que se repiten", () => {
  assert.equal(buscarPalabra(P, "esta").ini, 1.4);
  assert.equal(buscarPalabra(P, "esta", { desde: 2.5 }).ini, 3.0);
});

test("buscarPalabra: si no está, falla con un mensaje útil (nunca inventa tiempos)", () => {
  assert.throws(() => buscarPalabra(P, "jamás"), /«jamás» no está en la voz.*palabras\.srt/s);
  assert.throws(() => buscarPalabra([], "hola"), /no hay palabras/);
});

test("paletaTypefx: arma la paleta por roles desde colores de marca", () => {
  const p = paletaTypefx({ id: "marca", fondo: "#101820", tinta: "#F2EBDD", acento: "#FF5A36" });
  assert.equal(p.id, "marca");
  assert.equal(p.swatches[p.roles.paper], "#101820");
  assert.equal(p.swatches[p.roles.ink], "#F2EBDD");
  assert.equal(p.swatches[p.roles.accent], "#FF5A36");
  assert.equal(p.swatches[p.roles.paperInv], "#F2EBDD", "inversión: fondo y tinta se cruzan");
  assert.equal(p.swatches[p.roles.inkInv], "#101820");
  for (const rol of ["paper", "ink", "paperInv", "inkInv", "surfaceA", "onSurfaceA", "surfaceB", "onSurfaceB", "accent", "onAccent"]) assert.ok(p.swatches[p.roles[rol]], rol);
});

test("formatoDiseno: espacio de diseño por formato (1080 en el lado corto)", () => {
  assert.deepEqual(formatoDiseno("9x16"), [1080, 1920]);
  assert.deepEqual(formatoDiseno("16x9"), [1920, 1080]);
  assert.deepEqual(formatoDiseno("1x1"), [1080, 1080]);
  assert.deepEqual(formatoDiseno("raro"), [1080, 1920]);
});
