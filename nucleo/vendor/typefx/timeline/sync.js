// Utilidades de sincronía musical sobre pulsos fraccionarios.

import { fract } from '../engine/ease.js';

// Envolvente que salta a 1 en cada pulso y cae exponencialmente: para golpes y bombeos.
export const pulse = (b, decay = 6, every = 1) => (b < 0 ? 0 : Math.exp(-fract(b / every) * every * decay));

// Pulso entero más reciente y fracción dentro de él.
export const beatIndex = (b, every = 1) => Math.floor(b / every);
export const beatPhase = (b, every = 1) => fract(b / every);

// Cuantiza un pulso a la subdivisión dada (1 = negra, 0.5 = corchea…).
export const quantize = (b, step = 1) => Math.round(b / step) * step;

// Escalón: el valor de la lista que corresponde al pulso actual (cambia en seco en cada golpe).
export const stepped = (b, values, every = 1) => values[Math.max(0, Math.min(values.length - 1, Math.floor(b / every)))];
