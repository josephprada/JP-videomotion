# Contrato del núcleo

Estas reglas no las cambia ningún perfil, estilo, sistema de diseño ni video. Si algo las contradice, gana este archivo.
Aplican al método `canvas`; los otros métodos declaran su propio contrato en `metodos/<método>/METODO.md`.

## Render determinista
- Toda película es una **función pura del tiempo**: `window.seek(t)` pinta el cuadro `t` (segundos). Puede ser `async` solo para esperar recursos ya cargados, nunca para «dejar pasar» tiempo.
- La página expone `window.film = { w, h, dur, ready }`. `ready = true` cuando fuentes e imágenes están cargadas.
- Prohibido en modo render (`?render=1`): transiciones o animaciones CSS, `setTimeout`, `setInterval`, `requestAnimationFrame`, estado que pase de un cuadro al siguiente, `Math.random`, `Date.now`. Ruido solo con semilla: `M.rng`, `M.noise`, `M.hash`.
- Movimiento con `lib/motion.js`: resortes de forma cerrada (`M.spring`, presets `M.S`) y `M.track` para todo valor que cambie de objetivo más de una vez. Easings (`M.ease`) solo para fundidos y barridos, no para cosas con masa.
- Formatos desde una sola línea de tiempo: la película lee `?fmt=9x16|1x1|16x9` y compone con una función de layout. Se reencuadra, no se recorta.
- Antes de un render largo: `bash nucleo/tools/determinismo.sh <escena> <t>` **y** stills seguidos de la misma escena (ver `TRAMPAS.md`).

## El tiempo es uno solo
- Si el video tiene voz, **todo tiempo se escribe en segundos de la voz** (`voz/narracion-completa.*`): tablas `T` de las escenas, `storyboard/cuadros.tsv`, `montaje/audio/sintesis.cjs` y subtítulos. Los cortes de escena caen en múltiplos de 1/60 s, así que tiempo del video = tiempo de la voz.
- Sin voz, el reloj es la rejilla de la música (`M.beat` o `tools/beats.py`).

## Dónde vive cada cosa
- `nucleo/` es genérico: no sabe de ningún video, universo, estilo ni marca. Si algo de `kit/` necesita un personaje o un logo, está en el lugar equivocado.
- **Regla de promoción**: nada sube a `universos/`, `estilos/`, `sistemas-diseno/` o `nucleo/` «por si acaso». Sube cuando el **segundo** video lo necesita de verdad, y al subir deja de depender del video de origen.
- Cambio en `nucleo/lib/` o `nucleo/kit/` → test primero (`cd nucleo && npm test`).

## Calidad antes de mostrar
1. Renderizar un cuadro por beat como hoja de contacto (`tools/critica.sh`) y **mirarla**.
2. Puntuar con `prompts/critica.txt`, arreglar los 3 peores problemas, repetir hasta 8+. Registrar cada ronda en `critica.md` del video.
3. Si el video tiene voz, revisar también **la animación con el audio** (animatic con la voz): ritmo y sincronía. Un golpe que no cae en su palabra es un error.
4. Si faltan los tiempos por palabra, se obtiene la alineación (`tools/tiempos.sh`) **antes** de animar. Nunca se inventan.
5. Solo entonces mostrar al usuario. Nunca decir «quedó» sin haber visto un cuadro renderizado después del cambio.

## Look por defecto (un estilo puede relajarlo, no ignorarlo)
- Prohibido: título centrado sobre degradado, todo entrando con fundido, etiquetas en las esquinas y marcos sin motivo, brillo sobre la interfaz, explosiones de partículas genéricas.
- Una fuente display y una de lectura. Un color de acento salvo que el estilo o el sistema de diseño digan otra cosa.
- Cada 2–4 s algo nuevo tiene que pasar en pantalla.

## Sonido
- Música y efectos sintetizados en código salvo que se entregue una pista (entonces `tools/beats.py` primero).
- Loudness final −14 LUFS (`tools/mezcla.sh`). La mezcla se mide, pero se aprueba de oído.

## Render
- `node nucleo/render.mjs --film <carpeta de la escena>` (ruta desde la raíz del repo). Sirve la escena por un servidor local (127.0.0.1), así funcionan igual las escenas clásicas y las de módulos ES. H.264 yuv420p, CRF 16. Final con `--sub 4` (desenfoque de movimiento).
