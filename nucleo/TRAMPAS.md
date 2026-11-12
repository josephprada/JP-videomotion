# Trampas conocidas

Cada una ya costó un error en producción. Léelas antes de la fase de producción y **agrega aquí** cada trampa nueva
que no dependa de un estilo (las de un estilo van en su `ESTILO.md`).

## Render y canvas
- **Contextos de canvas reusados** guardan TODO su estado entre `seek()`. Al reusar un lienzo auxiliar hay que reiniciar `globalCompositeOperation`, `globalAlpha` y `filter`. `determinismo.sh` NO lo detecta (renderiza dos veces el mismo instante y las dos salen igual de mal): se detecta con stills seguidos de la misma escena (`--stills 0.3,1.5,2.6`).
- **Desenfoque costoso**: `ctx.filter = "blur()"` sobre el cuadro entero cuesta mucho por cuadro. `FOCO.dibujar` acepta `caja`
  para desenfocar solo esa zona; úsala siempre que el elemento no ocupe todo el cuadro. Y todo lienzo auxiliar reusado
  reinicia `filter` (ver la trampa anterior).
- **Bordes con `g.stroke()` a secas** trazan el ÚLTIMO trazado que dejó el contenido (un brillo, una burbuja), no el polígono: aparecen puntos y anillos negros. Cada borde traza su propio `Path2D`.
- **Transparencia sobre grupos** (`globalAlpha` a un público, por ejemplo): cada figura se transparenta y se encima. Para apagar algo, se dibuja opaco y se pone una capa oscura encima.
- **Imágenes en el canvas** (fotos, capturas): abiertas por `file://` (doble clic), Chrome «contamina» el lienzo y `toDataURL` falla con *Tainted canvases may not be exported*. Por eso `render.mjs` sirve las escenas por HTTP local (mismo origen) y la vista previa con imágenes se abre con `node nucleo/jp.mjs servir`. Las imágenes se esperan antes de `ready` (`ESCENA.crear({ cargar })`).
- **Cortar un `video.sh` a medias** no detiene los `render.mjs` que ya lanzó, y el script sigue arrancando las escenas pendientes con el código que haya en ese momento. Si cambias una escena durante un render, detén cada proceso `render.mjs` (no solo el script), borra los `out/final.mp4` afectados y rerenderiza solo esas escenas.
- **Raster por GPU no es exacto entre procesos**: con el lienzo acelerado (por defecto, rápido), el texto grande bajo ciertas
  transformaciones (rotado, con zoom de cámara) puede salir 1 nivel distinto en algún píxel de un render a otro. No se ve, pero
  cambia el hash. `determinismo.sh` y `video.sh final` usan `--raster software` (exacto, ~45–70 % más lento); animatics, stills y
  storyboard van por GPU. Si comparas dos renders a mano, usa `--raster software` en ambos.
- **Fuentes**: si `window.film.ready` se pone en `true` antes de que la hoja de estilos de la fuente cargue, el primer cuadro sale con la fuente de respaldo. Los estilos cargan sus fuentes con una promesa (`ESTILO.listo`) que el armazón espera.

## Tiempo y voz
- **Whisper** marca las palabras ~0,1 s tarde: el golpe visual va un pelo antes que la palabra.
- **Confirmar de oído** las palabras que whisper transcribió distinto al guion (cifras, nombres propios) antes de usarlas en subtítulos.

## Personajes (rig)
- **Mano arriba del hombro** (saludar, quitarse el sombrero): `codoAbajo: true`. Con `false` el codo sube y la mano queda por debajo: se lee como un brazo quebrado.
- **Brazo que sostiene algo frente al cuerpo**: con la mano cerca del hombro el IK saca el codo horizontal o lo cruza sobre el pecho. Lo natural: codo colgando bajo el hombro y antebrazo hacia arriba y afuera → mano en (hombro.x ± ~90, hombro.y + ~80) con `codoAbajo: true`. El objeto se pinta DESPUÉS del personaje.

## Composición
- Nunca un título o un estallido sobre la cara del personaje; nada que se salga del marco que lo contiene (espejo, valla, ventana).
- **Zona segura en redes (9:16)**: el 15 % de arriba y el 25 % de abajo los tapan la interfaz de la plataforma y los subtítulos. Lo clave va en el centro.

## Sonido
- **Medir la música por RMS** sobreestima los graves: un tramo «tranquilo» con notas sostenidas puede medir más que la banda completa. Medir, ajustar y que el usuario apruebe de oído.

## Repo
- **Finales de línea**: el repo usa LF (`.gitattributes`). Un `.sh` con CRLF falla en macOS y Linux.
