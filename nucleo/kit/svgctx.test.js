const test = require("node:test");
const assert = require("node:assert/strict");
require("./svgctx.js");
const SVGCtx = globalThis.SVGCtx;

const texto = (font) => { const s = new SVGCtx(100, 100); s.font = font; s.fillText("Texto", 0, 0); return s.toString(); };

test("fillText: fuente sin peso conserva el tamaño completo", () => {
  const svg = texto("300px 'Kaushan Script'");
  assert.match(svg, /font-size="300"/);
  assert.match(svg, /font-weight="400"/);
  assert.match(svg, /font-family="Kaushan Script"/);
});

test("fillText: fuente con peso separa peso y tamaño", () => {
  const svg = texto("800 150px Montserrat");
  assert.match(svg, /font-size="150"/);
  assert.match(svg, /font-weight="800"/);
});
