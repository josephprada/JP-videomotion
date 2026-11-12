# Voz

- `narracion-completa.mp3` (o `.wav`): la toma elegida (prompt o guía en `../guion.md`).
- `frases.srt`, `palabras.srt`, `silencios.txt`: los genera `bash nucleo/tools/tiempos.sh videos/NNN-slug`.
  - `palabras.srt` da el segundo de cada palabra: tablas `T` de las escenas y subtítulos.
  - `silencios.txt` da los cortes de escena sugeridos (centro de cada pausa, en cuadros exactos de 1/60 s).
- Este video: la toma de ElevenLabs (mp3, por LFS) + 0,6 s de pausa entre los seis estilos → `narracion-completa.wav` (46,13 s).
  Los .wav no se versionan: regenerarlo con `bash voz/pausas.sh` (receta exacta, mismo archivo byte a byte).
