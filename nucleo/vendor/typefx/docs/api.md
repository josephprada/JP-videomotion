# typefx: guía de uso

`typefx` es el motor tipográfico de *Typography in Motion*. Vive en `lib/typefx/` y no depende de la composición: cualquier clip puede importarlo.

```js
import fontData from '../../lib/typefx/fonts/anybody.js';
import { createEnv, createLayer, createRenderer } from '../../lib/typefx/index.js';

const env = createEnv({ fontData, palette: 'color' });       // fuente, paleta, reloj (120 BPM) y rejilla
const layer = createLayer({
  source: { text: 'HOLA', cap: 300, x: 960, y: 690, align: 'center', wght: 900, wdth: 100 },
  stack: [
    ['warp-distort', { field: 'sine', amplitude: 60 }],
    ['duplicate-echo', { copies: 6, delay: 0.1, offset: [0, 90] }],
  ],
});
const r = createRenderer(canvas, { fps: 60, subframes: 8 });
window.seek = (t) => r.frame(t, (ctx, tt) => {
  ctx.fillStyle = env.palette.c('paper');
  ctx.fillRect(0, 0, 1920, 1080);
  layer.draw(ctx, tt, env);
});
```

Las composiciones con módulos ES se sirven por HTTP: `node serve.mjs 5180`, o `--http` en `render.mjs` y `contact-sheet.mjs`.

## Las cinco capas

| Capa | Carpeta | Qué contiene |
|---|---|---|
| Motor de animación | `engine/` | Tiempo y pulsos (`clock.js`), azar con semilla (`rng.js`, mulberry32), ruido (`noise.js`), curvas y pistas de claves (`ease.js`), renderizador con desenfoque de movimiento (`renderer.js`) y núcleo de efectos (`effect.js`). |
| Efectos tipográficos | `effects/` | Los 12 efectos, un módulo cada uno. Referencia de parámetros: [effects.md](effects.md). |
| Sistema de composición | `compose/`, `geometry/` | Capas y pilas (`layer.js`), rejilla de 12 columnas (`grid.js`), máscaras (`mask.js`) y pintado (`draw.js`). En `geometry/`: fuente variable, contornos, morphing y `GlyphSet`. |
| Sistema de color | `color/` | Paletas en JSON y roles semánticos (`roles.js`). |
| Timeline y sincronía | `timeline/` | Escenas colocadas en pulsos (`timeline.js`) y utilidades de golpe (`sync.js`). |

## GlyphSet: el formato común

`layout(font, spec)` convierte texto en un `GlyphSet`: `{ glyphs, size, lineHeight }`. Cada glifo lleva sus contornos ya en píxeles (polígonos `Float64Array` planos), su origen en la línea base, su avance, su peso y anchura, su rol de color y si se pinta relleno o en contorno.

Los efectos reciben un `GlyphSet` y devuelven otro nuevo, sin mutar el de entrada. Por eso se pueden encadenar en cualquier orden.

## API común de un efecto

```js
const fx = effect('stretch-squash', { amount: 3, volume: 0.6 });
fx.init(env);                 // precálculo inmutable
fx.set({ elastic: 0.8 });     // cambiar parámetros sin tocar el módulo
fx.update(time, params);      // resuelve los parámetros de ese instante (solo a partir de time)
fx.render(ctx, specOGlyphSet); // pinta el texto con el efecto aplicado
fx.destroy();
```

Dentro de una capa no hace falta llamar a nada de esto: `createLayer` lo hace en cada fotograma.

### Etapas

| Gancho | Etapa | Efectos |
|---|---|---|
| `source(spec, p, env)` | Antes de medir el texto | variable-weight, glyph-morph, tracking-spacing |
| `transform(gs, p, env)` | Geometría | stretch-squash, warp-distort, split-fragment, rotation-spin, tracking-spacing (grid), path-flow |
| `render(ctx, next, p, env)` | Composición (envuelve el pintado) | duplicate-echo, mask-reveal, scale-cropping |
| `compose(ctx, layers, p, env)` | Varias capas a la vez | layer-compose |

En una pila, `source` y `transform` se aplican en orden. Los `render` se anidan: el último de la pila es el más exterior. Por ejemplo, `[warp, echo, mask]` aplica la máscara al eco de un texto deformado.

### Parámetros animables

Cualquier parámetro acepta tres formas:

- Un valor fijo: `amplitude: 60`.
- Una pista de claves en pulsos: `amplitude: { keys: [[0, 0], [0.5, 72, 'outExpo'], [3, 0]] }`. Cada clave es `[pulso, valor, curva hacia este valor]`.
- Una función del pulso local: `center: (b) => [lerp(-300, 2220, b / 4), 540]`.

Los parámetros de tipo `fn` (como `per` en stretch-squash) son funciones por glifo y no se evalúan como tiempo.

Todos los efectos comparten los parámetros comunes: `intensity`, `start`, `duration`, `easing`, `direction`, `speed`, `stagger`, `sync` y `seed`.

## Reutilizar

- **Cambiar palabras:** cambia `source.text`. Los efectos no dependen del texto.
- **Cambiar tipografías:** genera los contornos con `node lib/typefx/tools/bake-font.mjs assets/fonts/MiFuente.ttf lib/typefx/fonts/mi-fuente.js` (necesita `fontkit`) y pasa el resultado a `createEnv({ fontData })`, o a una sola capa con `createLayer({ font: createFont(data) })`. Las fuentes variables conservan sus ejes; para una fuente sin eje de anchura, usa `--wdth 100,100,2`.
- **Modificar colores:** edita `lib/typefx/color/palettes/*.json` y ejecuta `node lib/typefx/tools/sync-palettes.mjs`. Las escenas solo nombran roles (`paper`, `ink`, `surfaceA`, `accent`…), así que una paleta nueva recolorea todo.
- **Exportar con otra paleta:** `?edition=mono|color` en la composición. Para una paleta nueva, añade su JSON y regístrala en `roles.js`.
- **Ajustar duración e intensidad:** `duration` (en pulsos) e `intensity` en cualquier efecto. El tempo sale de `beats.json` o de `createEnv({ bpm })`.
- **Coreografía propia:** `inline({ transform(gs, p) { … } })` crea un efecto sin registrar que entra en la misma pila.

## Presets

`lib/typefx/presets/*.json` guarda combinaciones de efectos como datos:

```js
import { applyPreset, loadPreset } from '../../lib/typefx/index.js';
const preset = await loadPreset('../../lib/typefx/presets/liquid-echo.json');
const layer = applyPreset(preset, { text: 'OTRA', x: 960, y: 600 });
```

| Preset | Pila |
|---|---|
| `barcode` | stretch-squash + tracking-spacing |
| `liquid-echo` | warp-distort + duplicate-echo |
| `shatter-grid` | split-fragment (fragmentos que vuelven) |
| `weight-wave` | variable-weight + path-flow |
| `spin-window` | rotation-spin + mask-reveal |
| `crop-morph` | glyph-morph + scale-cropping |

La preview de cada composición (`preview.html`) exporta como JSON de preset la pila que estés editando.

## Determinismo

- `seek(t)` pinta el fotograma `t` desde cero. Ningún efecto guarda el fotograma anterior: el eco evalúa la capa en `t − k·delay`.
- Las cachés (contornos, morphs, celdas de Voronoi) solo memorizan cálculos puros.
- El azar es siempre `hash`/`mulberry32` con semilla.
- El desenfoque de movimiento promedia subfotogramas dentro del obturador, cada uno pintado con su propio `seek`.
- En la preview, `requestAnimationFrame` solo avanza el reloj.
