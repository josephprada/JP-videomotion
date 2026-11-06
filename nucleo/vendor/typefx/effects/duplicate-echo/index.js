// 05 · DUPLICATE / ECHO: copias desplazadas en el espacio y en el tiempo.
// La copia k pinta el estado de la capa en t − k·delay: el eco es una función pura del tiempo.

import { defineEffect } from '../../engine/effect.js';
import { mat } from '../../geometry/path.js';

export default defineEffect({
  id: 'duplicate-echo',
  name: 'Duplicate / Echo',
  index: 5,
  params: {
    copies: { type: 'number', min: 0, max: 24, step: 1, default: 6, doc: 'Número de copias (admite fracción para animarlo)' },
    delay: { type: 'beats', min: 0, max: 2, step: 0.01, default: 0.125, doc: 'Retardo entre copias (pulsos)' },
    offset: { type: 'vec2', default: [0, 0], doc: 'Desplazamiento por copia (px)' },
    scale: { type: 'number', min: 0.5, max: 2, step: 0.01, default: 1, doc: 'Escala por copia' },
    rotate: { type: 'number', min: -45, max: 45, step: 0.5, default: 0, doc: 'Giro por copia (grados)' },
    pivot: { type: 'vec2', default: [960, 540], doc: 'Pivote de escala y giro (px)' },
    mode: { type: 'enum', options: ['fill', 'outline', 'alternate', 'front-outline'], default: 'outline', doc: 'Cómo se pintan las copias' },
    stroke: { type: 'number', min: 0.5, max: 12, step: 0.5, default: 2.5, doc: 'Grosor del contorno de las copias' },
    copyRole: { type: 'role', default: null, doc: 'Rol de color de las copias (por defecto, el de la capa)' },
    roles: { type: 'list', default: null, doc: 'Roles alternos por copia' },
  },
  render(ctx, next, p, env) {
    const n = Math.floor(p.copies * p.intensity + 1e-6);
    const period = env.period ?? 0.5;
    for (let k = n; k >= 1; k--) {
      const m = mat.around(p.pivot[0], p.pivot[1], mat.chain(
        mat.translate(p.offset[0] * k, p.offset[1] * k),
        mat.rotate((p.rotate * k * Math.PI) / 180),
        mat.scale(Math.pow(p.scale, k)),
      ));
      const outline = p.mode === 'outline' || (p.mode === 'alternate' && k % 2 === 1) ? p.stroke : p.mode === 'front-outline' ? 0 : 0;
      const role = p.roles ? p.roles[(k - 1) % p.roles.length] : p.copyRole;
      next.draw({ t: next.t - k * p.delay * period, matrix: m, style: { outline, ...(role ? { role } : {}) } });
    }
    next.draw(p.mode === 'front-outline' ? { style: { outline: p.stroke } } : {});
  },
  demo: { text: 'ECHO', cap: 300, params: { copies: 7, delay: 0.12, offset: [0, 110], mode: 'outline' } },
});
