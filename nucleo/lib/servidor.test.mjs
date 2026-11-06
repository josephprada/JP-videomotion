import test from "node:test";
import assert from "node:assert/strict";
import { join, resolve } from "node:path";
import { rutaSegura, tipoMime } from "./servidor.mjs";

const RAIZ = resolve("/repo");

test("rutaSegura: resuelve rutas dentro de la raíz y decodifica la URL", () => {
  assert.equal(rutaSegura(RAIZ, "/videos/001-x/escenas/escena1/index.html"), join(RAIZ, "videos/001-x/escenas/escena1/index.html"));
  assert.equal(rutaSegura(RAIZ, "/nucleo/vendor/typefx/fuentes/Anybody%5Bwdth,wght%5D.ttf"), join(RAIZ, "nucleo/vendor/typefx/fuentes/Anybody[wdth,wght].ttf"));
  assert.equal(rutaSegura(RAIZ, "/a/b.js?render=1&fmt=9x16"), join(RAIZ, "a/b.js"), "ignora la query");
});

test("rutaSegura: rechaza todo lo que sale de la raíz", () => {
  assert.equal(rutaSegura(RAIZ, "/../secreto.txt"), null);
  assert.equal(rutaSegura(RAIZ, "/videos/../../etc/passwd"), null);
  assert.equal(rutaSegura(RAIZ, "/%2e%2e/%2e%2e/etc/passwd"), null);
  assert.equal(rutaSegura(RAIZ, "/a%00b"), null, "bytes nulos");
});

test("tipoMime: los módulos ES necesitan text/javascript", () => {
  assert.equal(tipoMime("a/escena.js"), "text/javascript; charset=utf-8");
  assert.equal(tipoMime("a/tipo.mjs"), "text/javascript; charset=utf-8");
  assert.equal(tipoMime("a/index.html"), "text/html; charset=utf-8");
  assert.equal(tipoMime("a/palabras.srt"), "text/plain; charset=utf-8");
  assert.equal(tipoMime("a/f.woff2"), "font/woff2");
  assert.equal(tipoMime("a/raro.xyz"), "application/octet-stream");
});
