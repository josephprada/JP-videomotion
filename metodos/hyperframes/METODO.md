# Método · HyperFrames (experimental)

HyperFrames es un framework de video en HTML con su propio CLI (`hyperframes`: init, preview, check, render) y su
propio contrato de composición (atributos `data-*`, clips, pistas). Este método **delega** en sus herramientas; JP-videomotion
aporta el flujo (fases, compuertas, guion, voz, subtítulos, entrega) y la estructura del video.

Estado: experimental. Se usa cuando el agente tiene acceso a HyperFrames (CLI instalado y, si el agente lo soporta, sus
skills: `hyperframes`, `hyperframes-core`, `hyperframes-animation`, `hyperframes-cli`…). Si no, volver a `canvas`.

## Dónde vive
`<v>/hyperframes/`: el proyecto HyperFrames del video (lo crea `hyperframes init` dentro de esa carpeta).
Todo lo demás del video (guion, voz, diseño, storyboard, entregables) sigue la estructura normal.

## brief · investigacion · guion · voz · tiempos
Igual que en `canvas` (ver `perfiles/libre/FASES.md` y `metodos/canvas/METODO.md § tiempos`).

## diseno
La guía de estilo (`diseno/guia-estilo.md`) se traduce a la especificación de diseño de HyperFrames (paleta, tipografía,
reglas de movimiento). Si hay sistema de diseño, sus tokens mandan.

## storyboard
Igual que en `canvas`, pero los cuadros salen de `hyperframes` (snapshots) en lugar de `render.mjs --stills`.

## animatic · produccion · render
Seguir el flujo del CLI de HyperFrames (preview → check → render). Los tiempos de las composiciones se escriben en segundos
de la voz, igual que en `canvas`. Antes de mostrar: hoja de contacto con `nucleo/tools/critica.sh` sobre el render.

## sonido
Si HyperFrames mezcla el audio, la voz y la música se colocan en sus pistas; si no, `nucleo/tools/mezcla.sh` y se une al final.

## subtitulos · entrega · ajustes
Igual que en `canvas`: `node nucleo/jp.mjs subtitulos <v> --quemar --entrada hyperframes/<render>.mp4`.
