# Estilo · Vox (collage de archivo)

Periodismo visual: **papel envejecido, mapas, recortes de archivo, marcador amarillo, etiquetas mono y lápiz rojo**.
Para historia, geografía, datos explicados y «por qué el mundo es así». Se toma el oficio del explicador tipo Vox,
nunca sus gráficos ni su marca. Kit: `nucleo/kit/collage.js` (+ `UI.contador` para cifras).

## Gramática
- **La mesa es el papel.** El fondo es papel envejecido (`COLLAGE.papel`) que no se mueve ni se corta; la cámara empuja
  muy lento sobre él. Todo lo demás son **recortes pegados** encima (`COLLAGE.recorte`): borde rasgado, sombra, una leve rotación.
- **Los recortes se mueven en stop motion** (`pj` = 12 fps): suben, giran y se asientan con un resorte suave (~0,6 s).
  El lápiz, el marcador y la cámara van a 60 fps: son la mano del narrador, no papel.
- **Imágenes de archivo** en monocromo sepia con contraste (`COLLAGE.archivo(img)`), siempre dentro de un recorte.
  Las fotos se cargan con `ESCENA.crear({ cargar })` y se revisa su licencia en `recursos/`.
- **Marcador amarillo** detrás de la cifra o la palabra que importa (`COLLAGE.rotulo`): titular en Anton, tinta negra.
  El amarillo es el acento: lo que la voz señala se vuelve amarillo; lo que pesa se vuelve tinta negra.
- **Lápiz rojo** para señalar (`COLLAGE.circulo`): un círculo a mano que se pasa de una vuelta, una vez por idea.
- **Etiquetas mono** en mayúsculas, subrayadas, con línea guía hacia lo que nombran (`COLLAGE.etiqueta`). Datos exactos, sin adornos.
- **Mapas** con retícula de Mercator (`COLLAGE.reticula`), mar gris verdoso y tierra beige. Siluetas reales: SVG o GeoJSON del
  video convertidos a `Path2D` (con fuente y licencia en `recursos/`), nunca formas inventadas en un video publicado.
- **Texto de archivo** en IM Fell English (fechas, citas en latín, títulos de época).
- **Color por roles** en `ESTILO.color` (papel, tinta, marcador, lapiz, mar, tierra, lineas, recorte); el video lo cambia con
  `Object.assign(ESTILO.color, { … })`. Nunca hex en la escena.

## Sincronía con la voz
- El amarillo, la tinta y el lápiz caen en la palabra que nombra la cosa (tiempos globales en `T`, de `voz/palabras.srt`).
- Las cifras cuentan mientras la voz las dice y se detienen en el número exacto del guion.

## Acabado
Grano de película marcado (11 %), papel multiplicado, viñeta tostada suave.

## Trampas del estilo
- **Resorte rígido en stop motion**: a 12 fps un resorte de interfaz (`S.snappy`) aterriza en 2 cuadros y se lee como un salto.
  Usa un resorte suave (`spring(t, 120, 21)`) para ver el recorrido.
- **Tostado y viñeta juntos** ensucian las esquinas: si el papel se ve gris, baja `tostado` antes que la viñeta.
- Las etiquetas van fuera de las siluetas y dentro del recorte del mapa; la guía nunca cruza su propio texto.
