// Rasteriza un SVG a PNG con el Chrome instalado:  node tools/svg2png.mjs in.svg out.png [ancho]
import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";
import { lanzar } from "../navegador.mjs";
const [, , inp, out, w = "600"] = process.argv;
const b = await lanzar(chromium);
const p = await b.newPage({ viewport: { width: +w, height: +w } });
await p.setContent(`<body style="margin:0;background:#888"><img id="i" style="width:${w}px" src="data:image/svg+xml;base64,${readFileSync(inp).toString("base64")}"></body>`);
await p.locator("#i").screenshot({ path: out });
await b.close();
