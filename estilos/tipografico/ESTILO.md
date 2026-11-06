# Estilo · Tipográfico (voz y tipografía)

Videos **100 % voz y tipografía**: sin imágenes ni personajes. La letra es el material y la voz es el reloj.
Motor: [typefx](../../nucleo/vendor/typefx/LEEME.md) (12 efectos de glifo, MIT) a través de `nucleo/kit/tipo.mjs`,
que lo sincroniza con las palabras de la voz (un pulso = un segundo).

## Reglas de diseño
- **Solo tipografía.** Fondo liso, una tipografía principal (Anybody, variable en peso y anchura) y **un color de acento**.
- Sin degradados, marcos, partículas ni fundidos repetidos. Ninguna transición es un fundido: la salida de una escena es la
  geometría con la que arranca la siguiente (las letras estiradas se vuelven barras, el eco se vuelve rampa de peso…).
- **El tamaño, el movimiento y las pausas acompañan la intención de la voz**: la palabra fuerte, grande y pesada; la pausa,
  quietud; la duda, peso fino o tracking abierto. Los movimientos llegan en la palabra (`outExpo`, `outBack`, 0,3–0,6 s) y después respiran.
- **Legibilidad en móvil primero**: lo que dice la voz se lee a 360 px de ancho. Contraste extremo de escalas (900 px junto a 32 px) solo cuando el texto pequeño no carga el mensaje.
- El acento, **una vez por escena** como mucho, y solo en el golpe.
- Color por **roles** (`paper`, `ink`, `paperInv`/`inkInv`, `surfaceA/B`, `accent`), nunca hex en la escena: la paleta sale del
  sistema de diseño o de `diseno/guia-estilo.md` (`paletaTypefx({ fondo, tinta, acento })`). Solapes con `overlap: 'xor'` o máscaras, nunca modos de fusión.

## Sincronía con la voz (obligatorio)
- Cada golpe se ancla a una palabra: `E.palabra("texto")` lee `voz/palabras.srt`. **Si faltan los tiempos por palabra, se obtiene la
  alineación (`bash nucleo/tools/tiempos.sh <video>`) antes de animar. Nunca se inventan.**
- La capa empieza en la palabra (`createLayer({ start: E.v(T.palabra) })`); las claves de sus efectos son segundos desde ahí.
- Whisper marca ~0,1 s tarde: el golpe visual va un pelo antes de la palabra.

## Los 12 efectos (parámetros en `nucleo/vendor/typefx/docs/effects.md`)
| Efecto | Para qué sirve con la voz |
| --- | --- |
| `stretch-squash` | golpe de entrada, palabra que «aterriza» |
| `warp-distort` | inestabilidad, duda, algo que se rompe |
| `glyph-morph` | una palabra que se convierte en otra (antes → después) |
| `split-fragment` | quiebre, ruptura, cifra que estalla |
| `duplicate-echo` | repetición, insistencia, eco de lo dicho |
| `variable-weight` | énfasis progresivo, la palabra que gana peso |
| `rotation-spin` | giro de la historia, cambio de perspectiva |
| `mask-reveal` | revelación, lo que estaba oculto |
| `tracking-spacing` | aire, pausa, apertura; justificar a un ancho |
| `scale-cropping` | zoom a una letra o una contraforma; transición |
| `path-flow` | texto que recorre una trayectoria, listas, flujo |
| `layer-compose` | cierre: capas que se recolocan en la rejilla |
Combinaciones probadas en `nucleo/vendor/typefx/presets/` y la coreografía de referencia en `nucleo/vendor/typefx/ejemplos/`.
Criterios completos de dirección de arte: `nucleo/vendor/typefx/docs/art-direction.md`.

## Revisión
1. Hoja de contacto de **un fotograma por segundo** (y uno por palabra clave) → mirarla: legibilidad, composición, variedad.
2. **Revisar la animación con el audio** (animatic con la voz): ritmo y sincronía. Un golpe que no cae en su palabra es un error, no un detalle.
3. Crítica 8+ (`nucleo/prompts/critica.txt`) antes de mostrar.
4. Pureza: `seek(a)`, `seek(b)`, `seek(a)` dan el mismo cuadro (`nucleo/tools/determinismo.sh`).

## Trampas del estilo (de typefx)
- **Conservación de volumen sin límite**: al aplastar mucho, `volume` ensancha y `reflow` saca letras del cuadro. Usa `maxSpread` ≈ 2.
- **Medir una capa dentro de sus propios parámetros** entra en recursión: mide con una capa gemela sin ese efecto.
- **Eco al cambiar de fase**: las copias muestran el pasado; posición y tamaño continuos entre fases.
- **Parámetros `fn`** (como `per`) son por glifo, no funciones del tiempo.
- **Zoom extremo**: `tol` bajo (0,04–0,1) en el spec para que las curvas no se vean facetadas.
- **Caracteres**: las fuentes incluidas traen mayúsculas, minúsculas, tildes, ñ, «comillas», cifras y signos comunes. Otro carácter
  (emoji, alfabetos no latinos) no se dibuja: regenera la fuente con `node nucleo/vendor/typefx/tools/bake-font.mjs`.
- **Otra tipografía** (la de la marca): `node nucleo/vendor/typefx/tools/bake-font.mjs <fuente.ttf|.otf|.woff|.woff2> <video>/js/fuente.js --chars "…"`,
  luego `import fuente from "../../js/fuente.js"` y `escenaTipo({ fuente })`. Acepta los `.woff2` de `nucleo/node_modules/@fontsource/<fuente>/files/`.
  - Variable sin eje de anchura: `--wdth 100,100,2`.
  - **Estática** (sin ejes, p. ej. Anton): `--wght 400,400,2 --wdth 100,100,2`. Ojo: en una estática `variable-weight` y los cambios de
    `wght`/`wdth` no hacen nada (no hay ejes); los otros 10 efectos funcionan. Para jugar con el peso, combina con Anybody.
