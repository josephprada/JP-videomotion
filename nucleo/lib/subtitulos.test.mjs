import test from "node:test";
import assert from "node:assert/strict";
import { leerSrt, agrupar, aSrt, aAss, tiempoSrt } from "./subtitulos.mjs";

const SRT = `1
00:00:00,100 --> 00:00:00,400
Nadie

2
00:00:00,400 --> 00:00:00,700
creía

3
00:00:00,700 --> 00:00:01,000
en
4
00:00:01,000 --> 00:00:01,500
ella.

5
00:00:02,200 --> 00:00:02,600
Hasta

6
00:00:02,600 --> 00:00:03,000
hoy
`;

test("leerSrt: lee bloques con o sin línea en blanco y CRLF", () => {
  const p = leerSrt(SRT.replace(/\n/g, "\r\n"));
  assert.equal(p.length, 6);
  assert.deepEqual(p[0], { ini: 0.1, fin: 0.4, texto: "Nadie" });
  assert.deepEqual(p[3], { ini: 1, fin: 1.5, texto: "ella." });
});

test("agrupar: corta en puntuación final, en pausas largas y por largo máximo", () => {
  const b = agrupar(leerSrt(SRT), { maxCar: 20, maxPalabras: 4, pausa: 0.4 });
  assert.deepEqual(b.map((x) => x.texto), ["Nadie creía en ella.", "Hasta hoy"]);
  assert.equal(b[0].ini, 0.1); assert.equal(b[0].fin, 1.5);
  const corto = agrupar(leerSrt(SRT), { maxCar: 10, maxPalabras: 4, pausa: 0.4 });
  assert.deepEqual(corto.map((x) => x.texto), ["Nadie", "creía", "en ella.", "Hasta hoy"]);
});

test("agrupar: no deja huérfana la última palabra de una frase (se lleva una palabra con ella)", () => {
  const p = [["Nadie", 0.3, 0.7], ["creía", 0.7, 1.1], ["en", 1.1, 1.4], ["esta", 1.4, 1.9], ["idea.", 1.9, 2.4]].map(([texto, ini, fin]) => ({ texto, ini, fin }));
  const b = agrupar(p, { maxCar: 22, maxPalabras: 4, pausa: 0.35 });
  assert.deepEqual(b.map((x) => x.texto), ["Nadie creía en", "esta idea."]);
  assert.equal(b[0].fin, 1.4); assert.equal(b[1].ini, 1.4);
});

test("agrupar: mayúsculas opcionales para redes", () => {
  const b = agrupar(leerSrt(SRT), { maxCar: 30, mayusculas: true });
  assert.equal(b[0].texto, "NADIE CREÍA EN ELLA.");
});

test("tiempoSrt y aSrt: formato estándar numerado", () => {
  assert.equal(tiempoSrt(3661.0456), "01:01:01,046");
  assert.equal(aSrt([{ ini: 0.1, fin: 1.5, texto: "Hola" }]), "1\n00:00:00,100 --> 00:00:01,500\nHola\n");
});

test("aAss: cabecera con la resolución y el estilo, y un evento por bloque", () => {
  const ass = aAss([{ ini: 0.1, fin: 1.5, texto: "Hola, mundo" }], { ancho: 1080, alto: 1920, fuente: "Montserrat", tamano: 78, margenV: 520 });
  assert.match(ass, /PlayResX: 1080/);
  assert.match(ass, /PlayResY: 1920/);
  assert.match(ass, /Style: JP,Montserrat,78,/);
  assert.match(ass, /,520,1$/m, "margen vertical del estilo");
  assert.match(ass, /Dialogue: 0,0:00:00\.10,0:00:01\.50,JP,,0,0,0,,Hola, mundo/);
});
