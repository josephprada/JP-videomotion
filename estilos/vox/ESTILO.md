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
  Las imágenes viven en `<video>/recursos/` (con su origen en su `LEEME.md`) y se cargan con `ESCENA.crear({ cargar })`.
  Para crearlas: la skill **jp-skill-image** (abajo).
- **Marcador amarillo** detrás de la cifra o la palabra que importa (`COLLAGE.rotulo`): titular en Anton, tinta negra.
  El amarillo es el acento: lo que la voz señala se vuelve amarillo; lo que pesa se vuelve tinta negra.
- **Lápiz rojo** para señalar (`COLLAGE.circulo`): un círculo a mano que se pasa de una vuelta, una vez por idea.
- **Etiquetas mono** en mayúsculas, subrayadas, con línea guía hacia lo que nombran (`COLLAGE.etiqueta`). Datos exactos, sin adornos.
- **Mapas** con retícula de Mercator (`COLLAGE.reticula`), mar gris verdoso y tierra beige. Siluetas reales: SVG o GeoJSON del
  video convertidos a `Path2D` (con fuente y licencia en `<video>/recursos/`), nunca formas inventadas en un video publicado.
- **Texto de archivo** en IM Fell English (fechas, citas en latín, títulos de época).
- **Color por roles** en `ESTILO.color` (papel, tinta, marcador, lapiz, mar, tierra, lineas, recorte); el video lo cambia con
  `Object.assign(ESTILO.color, { … })`. Nunca hex en la escena.

## Imágenes con jp-skill-image (recomendado)
Vox vive de imágenes de archivo: grabados, retratos, barcos, instrumentos. Para las que **ilustran** (no las que prueban un hecho),
la skill **jp-skill-image** genera cada imagen con Flux (Cloudflare Workers AI) desde una descripción.

1. **¿Está instalada?** Existe `~/.claude/skills/jp-skill-image/SKILL.md`. Si no, **ofrécele a la persona instalarla** y, si acepta, instálala tú:
   - macOS, Linux o Git Bash:
     `d=$(mktemp -d) && curl -fsSL https://jpdeveloper.lavalex.co/jp-skill-image.zip -o "$d/s.zip" && mkdir -p ~/.claude/skills && unzip -oq "$d/s.zip" -d ~/.claude/skills && rm -rf "$d"`
   - Windows (PowerShell):
     `$z="$env:TEMP\jp-skill-image.zip"; Invoke-WebRequest https://jpdeveloper.lavalex.co/jp-skill-image.zip -OutFile $z; Expand-Archive $z "$HOME\.claude\skills" -Force; Remove-Item $z`
   - Requiere Python 3.8+ (sin dependencias). En Claude Code, si la skill no aparece en la lista, reinicia la sesión.
2. **Credenciales**: `CF_ACCOUNT_ID` y `CF_API_TOKEN` de Cloudflare, en el `.env` de la raíz del repo (está en `.gitignore`)
   o en `~/.claude/skills/jp-skill-image/.env`. Si faltan, la skill explica en 3 pasos cómo obtenerlas: no generes sin ellas.
3. **Generar** cada imagen en `<video>/recursos/` (otros agentes, sin skills, ejecutan el script directo):
   `python3 ~/.claude/skills/jp-skill-image/generate.py "<prompt en inglés>" -o videos/<id>/recursos/<nombre>.jpg --steps 8`
4. **Prompt para el look de archivo**: sujeto aislado sobre fondo liso, y el medio de época:
   *«19th-century copper engraving of a three-masted sailing ship, fine cross-hatching, sepia ink on aged paper, museum archive
   scan, isolated on plain background, no text»*. Nunca pidas texto dentro de la imagen (Flux no lo dibuja bien): los rótulos los
   pone la escena. `COLLAGE.archivo(img)` unifica el tono de todas las imágenes del video.
5. **Registrar** cada imagen en `<video>/recursos/LEEME.md` con su prompt. Una imagen generada es una ilustración, nunca un
   documento histórico: un mapa, retrato o foto que **prueba** algo sale de una fuente real con licencia.

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
