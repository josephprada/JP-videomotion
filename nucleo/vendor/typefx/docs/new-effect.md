# Cómo añadir un efecto a typefx

## 1. Crea el módulo

`lib/typefx/effects/mi-efecto/index.js`:

```js
// 13 · MI EFECTO: qué hace, en una línea.

import { defineEffect, glyphProgress } from '../../engine/effect.js';
import { getEase } from '../../engine/ease.js';
import { mapGlyphs, transformGlyph } from '../../geometry/glyphset.js';
import { mat } from '../../geometry/path.js';

export default defineEffect({
  id: 'mi-efecto',
  name: 'Mi Efecto',
  index: 13,
  params: {
    lift: { type: 'number', min: 0, max: 600, step: 1, default: 120, doc: 'Subida máxima (px)' },
  },
  transform(gs, p) {
    const n = gs.glyphs.length;
    return mapGlyphs(gs, (g, k) => {
      const u = getEase(p.easing)(glyphProgress(p, k, n));
      return transformGlyph(g, mat.translate(0, -p.lift * u * p.intensity));
    });
  },
  demo: { text: 'LIFT', cap: 300, params: { lift: 200, stagger: 0.1 } },
});
```

Usa el gancho que corresponda a la etapa del efecto:

- `source(spec, p, env)`: cambia atributos de cada glifo antes de medir (`spec.per`: peso, anchura, tracking, morph…).
- `transform(gs, p, env)`: cambia la geometría y devuelve un `GlyphSet` nuevo.
- `render(ctx, next, p, env)`: envuelve el pintado. Llama a `next.draw({ t, matrix, style })` las veces que necesites. Usa `next.glyphsAt(t)` si necesitas la geometría.
- `compose(ctx, layers, p, env)`: pinta varias capas.

## 2. Respeta las reglas de pureza

- Calcula todo a partir de `p` (ya resuelto para este instante: `p.b` es el pulso local, `p.u` el progreso lineal y `p.e` el progreso con curva).
- No guardes estado entre llamadas. Una caché solo puede memorizar resultados puros: la misma entrada da la misma salida.
- Nada de `Math.random`: usa `hash(seed, i, j)` o `mulberry32(seed)` de `engine/rng.js`.
- No mutes el `GlyphSet` de entrada.
- Colores solo por rol (`'ink'`, `'surfaceA'`…), nunca en hex.
- Declara cada parámetro con `type`, rango, `default` y `doc`. La preview genera sus controles a partir de ese esquema, y `gen-docs` escribe la referencia.

Tipos de parámetro: `number`, `int`, `beats`, `angle`, `enum`, `bool`, `text`, `role`, `ease`, `vec2`, `list`, `object`, `rect`, `fn`.

## 3. Regístralo

Añade una línea en `lib/typefx/effects/index.js`:

```js
export { default as miEfecto } from './mi-efecto/index.js';
```

## 4. Compruébalo

1. `node serve.mjs 5180` y abre la `preview.html` de tu composición. En «Efecto suelto», tu efecto aparece en «Añadir» con su demo y sus controles.
2. Combínalo con otros efectos en la pila y exporta el preset si merece la pena guardarlo.
3. `http://127.0.0.1:5180/lib/typefx/tools/gallery.html?t=0.6` muestra la demo de todos los efectos a la vez.
4. `node lib/typefx/tools/gen-docs.mjs` actualiza `docs/typefx-efectos.md`.
5. Comprueba la pureza: `seek(5)` seguido de `seek(4)` tiene que dar el mismo fotograma que `seek(4)` solo.
