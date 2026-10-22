import test from "node:test";
import assert from "node:assert/strict";
import { resolverPerfil, aplica, esCompuerta, estado, completar, reabrir } from "./fases.mjs";

const PERFILES = {
  libre: {
    nombre: "Libre",
    fases: [
      { id: "brief", compuerta: true },
      { id: "investigacion", solo_si: { datos_reales: true } },
      { id: "guion", compuerta: true },
      { id: "voz", compuerta: "siempre", saltar_si: { voz: "ninguna" } },
      { id: "diseno", compuerta: true },
      { id: "render" },
      { id: "entrega", compuerta: "siempre" },
    ],
  },
  promo: {
    hereda: "libre",
    quitar: ["investigacion"],
    cambiar: { guion: { nombre: "Guion corto" } },
    agregar: [{ id: "producto", compuerta: true, despues: "brief" }],
  },
  nieto: { hereda: "promo", agregar: [{ id: "captura", despues: "guion" }] },
  ciclo: { hereda: "ciclo" },
};
const leer = (n) => { if (!PERFILES[n]) throw new Error("no existe " + n); return PERFILES[n]; };
const ids = (fs) => fs.map((f) => f.id);

test("resolverPerfil: el perfil raíz devuelve sus fases tal cual", () => {
  assert.deepEqual(ids(resolverPerfil("libre", leer)), ["brief", "investigacion", "guion", "voz", "diseno", "render", "entrega"]);
});

test("resolverPerfil: un perfil hijo quita, cambia y agrega sobre el padre", () => {
  const fs = resolverPerfil("promo", leer);
  assert.deepEqual(ids(fs), ["brief", "producto", "guion", "voz", "diseno", "render", "entrega"]);
  assert.equal(fs.find((f) => f.id === "guion").nombre, "Guion corto");
  assert.equal(fs.find((f) => f.id === "guion").compuerta, true, "cambiar mezcla, no reemplaza");
  assert.equal(fs.find((f) => f.id === "producto").despues, undefined, "despues no se filtra a la fase");
});

test("resolverPerfil: la herencia es transitiva", () => {
  assert.deepEqual(ids(resolverPerfil("nieto", leer)), ["brief", "producto", "guion", "captura", "voz", "diseno", "render", "entrega"]);
});

test("resolverPerfil: detecta herencia circular y fases ancla inexistentes", () => {
  assert.throws(() => resolverPerfil("ciclo", leer), /circular/);
  const malo = { hereda: "libre", agregar: [{ id: "x", despues: "nada" }] };
  assert.throws(() => resolverPerfil("malo", (n) => (n === "malo" ? malo : leer(n))), /nada/);
});

test("aplica: saltar_si y solo_si contra los campos del video (con listas y rutas con punto)", () => {
  assert.equal(aplica({ id: "voz", saltar_si: { voz: "ninguna" } }, { voz: "ninguna" }), false);
  assert.equal(aplica({ id: "voz", saltar_si: { voz: "ninguna" } }, { voz: "tts" }), true);
  assert.equal(aplica({ id: "i", solo_si: { datos_reales: true } }, { datos_reales: false }), false);
  assert.equal(aplica({ id: "i", solo_si: { datos_reales: true } }, {}), false);
  assert.equal(aplica({ id: "x", saltar_si: { metodo: ["generativo", "hyperframes"] } }, { metodo: "hyperframes" }), false);
  assert.equal(aplica({ id: "d", saltar_si: { "reutiliza.diseno": true } }, { reutiliza: { diseno: true } }), false);
  assert.equal(aplica({ id: "libre" }, {}), true);
});

test("esCompuerta: 'siempre' para en ambos modos; true solo en modo interactivo", () => {
  assert.equal(esCompuerta({ compuerta: true }, "interactivo"), true);
  assert.equal(esCompuerta({ compuerta: true }, "automatico"), false);
  assert.equal(esCompuerta({ compuerta: "siempre" }, "automatico"), true);
  assert.equal(esCompuerta({}, "interactivo"), false);
  assert.equal(esCompuerta({ compuerta: true }, undefined), true, "sin modo = interactivo");
});

const VIDEO = { voz: "tts", datos_reales: false, modo: "interactivo", estado: { completadas: ["brief"] } };

test("estado: marca completadas, saltadas, la actual y las pendientes", () => {
  const e = estado(resolverPerfil("libre", leer), VIDEO);
  assert.equal(e.actual, "guion");
  assert.deepEqual(e.fases.map((f) => [f.id, f.estado]), [
    ["brief", "completada"], ["investigacion", "saltada"], ["guion", "actual"], ["voz", "pendiente"],
    ["diseno", "pendiente"], ["render", "pendiente"], ["entrega", "pendiente"],
  ]);
  assert.equal(e.fases.find((f) => f.id === "guion").para, true);
  assert.equal(e.terminado, false);
});

test("estado: con todo completado no hay fase actual", () => {
  const fs = resolverPerfil("libre", leer);
  const e = estado(fs, { ...VIDEO, estado: { completadas: ids(fs) } });
  assert.equal(e.actual, null);
  assert.equal(e.terminado, true);
});

test("completar: solo la fase actual; avanza y deja historial", () => {
  const fs = resolverPerfil("libre", leer);
  assert.throws(() => completar(fs, VIDEO, "voz", { fecha: "2026-10-22" }), /actual es «guion»/);
  const v = completar(fs, VIDEO, "guion", { fecha: "2026-10-22", nota: "aprobado" });
  assert.deepEqual(v.estado.completadas, ["brief", "guion"]);
  assert.equal(v.estado.fase, "voz");
  assert.deepEqual(v.estado.historial.at(-1), { fecha: "2026-10-22", fase: "guion", accion: "completada", nota: "aprobado" });
  assert.deepEqual(VIDEO.estado.completadas, ["brief"], "no muta la entrada");
});

test("reabrir: vuelve a una fase y descompleta todo lo que venía después", () => {
  const fs = resolverPerfil("libre", leer);
  const v0 = { ...VIDEO, estado: { completadas: ["brief", "guion", "voz", "diseno"] } };
  const v = reabrir(fs, v0, "guion", { fecha: "2026-10-22", nota: "cambia el gancho" });
  assert.deepEqual(v.estado.completadas, ["brief"]);
  assert.equal(v.estado.fase, "guion");
  assert.equal(v.estado.historial.at(-1).accion, "reabierta");
});
