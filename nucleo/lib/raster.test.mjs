import test from "node:test";
import assert from "node:assert/strict";
import { argsNavegador } from "./raster.mjs";

test("argsNavegador: gpu (por defecto) deja el lienzo acelerado, como siempre", () => {
  assert.deepEqual(argsNavegador(), ["--disable-gpu-vsync", "--font-render-hinting=none"]);
  assert.deepEqual(argsNavegador("gpu"), ["--disable-gpu-vsync", "--font-render-hinting=none"]);
});

test("argsNavegador: software desactiva el lienzo acelerado (render exacto entre procesos)", () => {
  const a = argsNavegador("software");
  assert.ok(a.includes("--disable-accelerated-2d-canvas") && a.includes("--disable-gpu"));
  assert.ok(a.includes("--font-render-hinting=none"));
});

test("argsNavegador: un modo desconocido falla con un mensaje que dice los válidos", () => {
  assert.throws(() => argsNavegador("rapido"), /raster.*gpu.*software/);
});
