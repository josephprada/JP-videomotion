// typefx: motor tipográfico modular. Punto de entrada único.
//
//   import { createEnv, createLayer, effect } from '../../lib/typefx/index.js';
//
// Capas independientes:
//   engine/    motor (tiempo, azar, curvas, renderizador con desenfoque de movimiento, núcleo de efectos)
//   geometry/  fuente variable, contornos, morphing, GlyphSet
//   effects/   los 12 efectos (un módulo cada uno)
//   compose/   rejilla, capas, máscaras, pintado
//   color/     paletas y roles
//   timeline/  escenas en pulsos y sincronía musical
//   presets/   combinaciones reutilizables

import './effects/index.js';
import { createFont } from './geometry/font.js';
import { createPalette } from './color/roles.js';
import { createClock } from './engine/clock.js';
import { createGrid } from './compose/grid.js';

export * from './engine/ease.js';
export * from './engine/rng.js';
export * from './engine/noise.js';
export * from './engine/clock.js';
export * from './engine/renderer.js';
export * from './engine/effect.js';
export * from './geometry/path.js';
export * from './geometry/glyphset.js';
export * from './geometry/morph.js';
export * from './compose/grid.js';
export * from './compose/draw.js';
export * from './compose/mask.js';
export * from './compose/layer.js';
export * from './color/roles.js';
export * from './timeline/timeline.js';
export * from './timeline/sync.js';
export { createFont };
export { PATHS, pathFor } from './effects/path-flow/index.js';
export { applyPreset, loadPreset } from './presets/index.js';

// Entorno que reciben todos los efectos: fuente, paleta, reloj, rejilla y tamaño del lienzo.
export function createEnv({ fontData, palette = 'mono', width = 1920, height = 1080, bpm = 120, offset = 0 } = {}) {
  const clock = createClock({ bpm, offset });
  return {
    font: createFont(fontData),
    palette: createPalette(palette),
    width, height,
    clock, period: clock.period,
    grid: createGrid({ width, height }),
  };
}
