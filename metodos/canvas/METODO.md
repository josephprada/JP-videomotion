# Método · Canvas en código

El método probado en producción. Contrato en `nucleo/CONTRATO.md`; oficio de escena en `metodos/canvas/OFICIO.md`.
Cada sección dice **cómo** se hace la fase del mismo nombre (`perfiles/libre/FASES.md` dice **qué**).
Los comandos se ejecutan desde la raíz del repo; `<v>` es la carpeta del video (`videos/007-slug`).

## brief · investigacion · guion · voz
Sin herramientas propias del método: ver `perfiles/libre/FASES.md`.

## tiempos
```bash
bash nucleo/tools/tiempos.sh <v>     # palabras.srt, frases.srt, silencios.txt (idioma de video.yaml)
```
Elegir los cortes de escena en las pausas de `silencios.txt` (columna `corte=`) y listar las escenas en `montaje/escenas.txt`.

## diseno
- Código compartido por las escenas en `<v>/js/`: `escena.js` (arranque; ya viene), `personajes.js`, `escenarios.js`, `marca.js`.
- Personajes sobre `nucleo/kit/rig.js` (ejemplo completo: `universos/_ejemplo/js/persona.js`). Si se reutiliza un universo,
  se carga su `js/` con una ruta relativa, no se copia.
- Hoja de modelo en `<v>/diseno/personajes.html` (copia `universos/_ejemplo/hoja.html` como base) y render:
  `node nucleo/render.mjs --film <v>/diseno --page personajes --stills 0`.
- Sistema de diseño: los colores y tipografías de `sistemas-diseno/<id>/sistema.yaml` se pasan a la paleta de `js/marca.js`.

## storyboard
1. Una carpeta por escena: copia `<v>/escenas/escena1/` como `escenaN/` y ajusta `t0` y `dur` en su `escena.js`.
2. ~3 cuadros por escena en `<v>/storyboard/cuadros.tsv` (segundo global · número de escena · frase).
3. `bash nucleo/tools/storyboard.sh <v>` → `storyboard-N.jpg`. Míralas y critica antes de mostrar.

## animatic
```bash
bash nucleo/tools/video.sh <v> animatic        # media resolución, 30 fps (con mezcla.wav = voz sola si aún no hay música)
bash nucleo/tools/critica.sh <v>/montaje/out/animatic.mp4
```

## produccion
- Antes de animar: `nucleo/TRAMPAS.md` y las trampas del estilo (`estilos/<estilo>/ESTILO.md`).
- Por escena: `node nucleo/render.mjs --film <v>/escenas/escenaN --stills 0.5,1.5,2.5` → mirar → arreglar.
- Bucle de crítica (`nucleo/prompts/critica.txt`) hasta 8+, registrado en `<v>/critica.md`.
- Vista previa en vivo: abrir `<v>/escenas/escenaN/index.html` en Chrome.

## sonido
`<v>/montaje/audio/sintesis.cjs` (música por tramos + efectos sobre las palabras, en segundos de la voz) y:
```bash
bash nucleo/tools/mezcla.sh <v>                 # → montaje/audio/mezcla.wav a −14 LUFS
```

## render
```bash
bash nucleo/tools/determinismo.sh <v>/escenas/escena2 2.5     # en 2 escenas, más stills seguidos
bash nucleo/tools/video.sh <v> final                          # en segundo plano (puede tardar 30+ min)
bash nucleo/tools/video.sh <v> final 16x9                     # otro formato, si está en video.yaml
```
Rerender de escenas sueltas (ajustes):
```bash
node nucleo/render.mjs --film <v>/escenas/escena3 --fps 60 --sub 4 --out final
```
y volver a unir con `video.sh` (las escenas ya renderizadas se pueden saltar comentándolas en una copia de `escenas.txt`).

## subtitulos
```bash
node nucleo/jp.mjs subtitulos <v> --quemar     # .srt + .ass y montaje/out/final_subtitulado.mp4
```
Estilo en `video.yaml → subtitulos` (fuente, tamaño, mayúsculas, margen). La fuente debe estar instalada en el sistema
(libass no lee las woff2 de `node_modules`).

## entrega
```bash
mkdir -p <v>/entregables/final
cp <v>/montaje/out/final.mp4 <v>/entregables/final/final_9x16.mp4          # o final_subtitulado.mp4
bash nucleo/tools/critica.sh <v>/entregables/final/final_9x16.mp4          # contacto.png
node nucleo/render.mjs --film <v>/escenas/escenaN --stills T              # poster.png: el cuadro que resume el video
```
`.mp4` de `entregables/` va por Git LFS.

## ajustes
Diagnosticar con stills seguidos de la escena (no solo un cuadro), corregir, rerenderizar solo lo tocado, unir y volver a entregar.
