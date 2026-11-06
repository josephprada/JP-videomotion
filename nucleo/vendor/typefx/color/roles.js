// Sistema de color por roles. Los efectos y las escenas solo nombran roles; la paleta decide el hex.
//
// Roles: paper, ink · paperInv, inkInv (inversión) · surfaceA/onSurfaceA, surfaceB/onSurfaceB (planos)
//        accent/onAccent (impacto, uno por escena).
// También se aceptan nombres de muestra («yellow») o un hex directo, por si una escena lo necesita.

import mono from './palettes/mono.js';
import color from './palettes/color.js';

export const palettes = { mono, color };

export function createPalette(def) {
  if (typeof def === 'string') def = palettes[def];
  const resolve = (name) => {
    if (!name) return def.swatches[def.roles.ink];
    if (name[0] === '#') return name;
    if (def.roles[name]) return def.swatches[def.roles[name]];
    if (def.swatches[name]) return def.swatches[name];
    throw new Error(`Rol de color desconocido: ${name}`);
  };
  // Pareja de un rol: el color que va encima (ink sobre paper, onSurfaceA sobre surfaceA…).
  const ON = { paper: 'ink', paperInv: 'inkInv', surfaceA: 'onSurfaceA', surfaceB: 'onSurfaceB', accent: 'onAccent', ink: 'paper', inkInv: 'paperInv' };
  return { id: def.id, name: def.name, def, c: resolve, on: (role) => ON[role] || 'ink', is: (id) => def.id === id };
}
