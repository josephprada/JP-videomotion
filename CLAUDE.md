@AGENTS.md

# Soporte especial para Claude

Todo lo de `AGENTS.md` aplica. Esto agrega lo que Claude (Claude Code y entornos con las mismas herramientas) hace mejor.

## Skills del repo
Envoltorios de los flujos (la fuente única sigue siendo `flujos/`):
| Skill | Flujo |
| --- | --- |
| `/jp-bootstrap` | `flujos/bootstrap.md` |
| `/jp-nuevo-video` | `flujos/nuevo-video.md` |
| `/jp-producir` | `flujos/producir.md` |
| `/jp-sistema-diseno` | `flujos/sistema-diseno.md` |

Las skills de `.claude/skills/` solo se cargan si la sesión se abrió **en la carpeta del repo**. Si clonaste el repo desde otra
carpeta, sigue los flujos leyendo los archivos y, al final del bootstrap, dile a la persona que abra Claude Code en la carpeta
del repo para tener las skills a mano.

## Preguntas
Usa la herramienta de preguntas con opciones (AskUserQuestion) para la entrevista y el bootstrap: hasta 4 preguntas por llamada,
la opción recomendada primero con «(Recomendado)», `multiSelect` para usos y plataformas. Un bloque de la entrevista por llamada.

## Mirar de verdad
Lee las imágenes renderizadas con la herramienta de lectura (stills, `contacto.png`, `tira.png`, `telefono.png`, storyboards)
**antes** de mostrarlas o de decir que algo quedó. Para comparar, junta cuadros con `nucleo/tools/hoja.sh`.

## Trabajo largo y en paralelo
- Renders largos (`video.sh final`) en segundo plano; seguir con otra cosa y revisar al terminar.
- Producción con muchas escenas: si la persona lo autoriza, reparte escenas entre subagentes después de escribir
  `diseno/guia-animacion.md` (`metodos/canvas/OFICIO.md § Delegar en paralelo`). Cada subagente mira sus propios cuadros.

## Sistemas de diseño de Claude Design
Si la persona tiene sus sistemas de diseño en **Claude Design** y quiere usarlos (entrevista, bloque 4, o `flujos/sistema-diseno.md`):
1. Comprueba qué tienes **en esta sesión**: una skill de diseño (p. ej. `/design`), un conector de Claude Design o ninguna.
   No supongas que existe: revisa la lista de skills y herramientas disponibles.
2. Si existe: úsala para leer el sistema (paleta, tipografías, componentes, logos) y tradúcelo a `sistemas-diseno/<id>/sistema.yaml`
   con `origen: claude-design` y el enlace o nombre del proyecto en `fuente_original`.
3. Si no existe: dilo con claridad y pide a la persona que exporte o copie desde Claude Design los colores, las tipografías y el logo;
   sigue el flujo como importación a mano.
4. La skill de diseño también sirve en la fase de diseño para explorar looks, portadas o la miniatura del video, siempre
   respetando el estilo elegido y el sistema de la marca.

## Otras capacidades que este repo aprovecha si están disponibles
- **HyperFrames** (skills `hyperframes*`): método `hyperframes` (`metodos/hyperframes/METODO.md`). Si la persona elige ese método y no tiene
  las skills, ofrecer instalarlas (`npx skills add heygen-com/hyperframes`) y avisar si pide confirmar permisos o reiniciar.
- **Tipografía cinética**: no requiere skills externas; typefx ya viene en `nucleo/vendor/typefx` (estilo `tipografico`). Su skill original
  (`github.com/lorena-bordonaba-pau/typefx`) solo hace falta para su propio formato de proyecto, no para este repo.
- **Higgsfield** u otro conector de generación: método `generativo`, voces y música generadas. Siempre confirmar el costo en créditos antes de generar.
- **Figma** (conector/MCP): importar sistemas de diseño desde archivos de Figma.
- **Memoria persistente**: si la tienes, guarda al cerrar cada fase con compuerta un resumen corto (video, fase, decisión) para retomar entre sesiones; la fuente de verdad sigue siendo `video.yaml`.

## Esfuerzo sugerido
Medio para arreglos y rerenders; alto para escenas nuevas y lookdev; máximo cuando los primeros 3 s cargan un lanzamiento.
