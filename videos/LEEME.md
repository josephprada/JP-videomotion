# Videos

Una carpeta por video: `videos/NNN-slug/` (número de 3 cifras + slug en minúsculas con guiones). La crea
`node nucleo/jp.mjs nuevo <slug>` copiando `_plantilla/`. **La estructura es la misma en todos los videos**; si una carpeta
no aplica (p. ej. `voz/` en un video sin voz), se queda vacía, no se renombra.

```
videos/NNN-slug/
  video.yaml           manifiesto: perfil, estilo, método, sistema, idioma, formatos, voz, subtítulos, reutiliza, estado de fases
  LEEME.md             ficha humana: decisiones con su razón, checklist antes de publicar, métricas
  brief.md             resultado de la entrevista
  investigacion.md     fuentes y datos descartados (si datos_reales)
  guion.md             guion con la plantilla del perfil (+ prompt de voz)
  critica.md           rondas de crítica (puntuaciones y problemas)
  voz/                 narracion-completa.mp3 · frases.srt · palabras.srt · silencios.txt
  diseno/              guia-estilo.md · personajes.html · referencias aprobadas
  js/                  código compartido por las escenas: escena.js (arranque), personajes.js, escenarios.js, marca.js
  escenas/escenaN/     index.html + escena.js (out/ no se versiona)
  storyboard/          cuadros.tsv · storyboard.md · storyboard-N.jpg
  montaje/             escenas.txt · audio/sintesis.cjs · subtitulos.ass · out/ (no se versiona)
  entregables/final/   final_9x16.mp4 (LFS) · poster.png · contacto.png · subtitulos.srt · publicacion.md · NOTAS.md
  refs/                referencias externas (no se versiona)
```
Carpetas que solo aparecen con ciertos perfiles o métodos: `captura/` (tutorial), `hyperframes/` (método hyperframes),
`generado/` (método generativo).

Nombres de archivo: en español, minúsculas, sin espacios. El idioma del **contenido** lo fija `video.yaml → idioma`.
