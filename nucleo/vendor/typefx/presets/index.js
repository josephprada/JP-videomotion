// Presets: combinaciones de efectos guardadas como datos (JSON). Se aplican sobre cualquier texto.
//
//   const layer = applyPreset(preset, { text: 'HOLA', cap: 300, x: 960, y: 700, align: 'center' });

import { createLayer } from '../compose/layer.js';

export function applyPreset(preset, source, overrides = {}) {
  const stack = preset.stack.map(([id, params]) => [id, { ...params, ...(overrides[id] || {}) }]);
  return createLayer({ source: { ...preset.source, ...source }, stack });
}

export async function loadPreset(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo cargar el preset ${url}`);
  return res.json();
}
