# JP-videomotion · instrucciones para agentes

Harness para producir videos con un agente de IA: guion, voz, diseño, animación en código, sonido, subtítulos y entrega,
con fases y compuertas de aprobación. Funciona con cualquier agente que lea `AGENTS.md`; Claude tiene soporte extra en `CLAUDE.md`.

## Primera acción (obligatoria)
- **Si no existe `jp.config.yaml` en la raíz** → el repo no está configurado: seguir `flujos/bootstrap.md` antes de cualquier otra cosa.
- Si te pasaron solo el enlace del repo: clonarlo donde la persona diga y seguir `flujos/bootstrap.md` desde el paso 0.
- Si ya está configurado y la persona quiere un video → `flujos/nuevo-video.md`; para seguir uno → `flujos/producir.md`.

## Flujos
| Cuando la persona… | Seguir |
| --- | --- |
| clona el repo o pide configurarlo | `flujos/bootstrap.md` |
| quiere un video nuevo, ideas para un video o «empezar» | `flujos/nuevo-video.md` |
| quiere seguir, retomar o avanzar un video | `flujos/producir.md` |
| quiere usar o importar su marca / sistema de diseño | `flujos/sistema-diseno.md` |
| quiere un estilo visual nuevo | `estilos/_nuevo/LEEME.md` |

## Mapa
```
AGENTS.md            este archivo (todos los agentes) · CLAUDE.md: soporte extra para Claude
jp.config.yaml       configuración de esta instalación (la crea el bootstrap; se versiona)
config/defecto.yaml  valores por defecto (no se edita)
.jp/local.yaml       datos locales de la máquina (agente detectado); no se versiona
flujos/              procedimientos paso a paso (bootstrap, entrevista, producción, sistema de diseño)
nucleo/              motor genérico: CONTRATO.md, TRAMPAS.md, CLI jp.mjs, render, lib/, kit/, tools/, prompts/, vendor/typefx (tipografía cinética, MIT)
perfiles/            QUÉ tipo de video: fases, compuertas y estructura (libre, historia-narrada, explicador, promo-lanzamiento, tutorial)
metodos/             CÓMO se produce cada fase (canvas estable · hyperframes y generativo experimentales)
estilos/             CÓMO se ve (plano, comic, tipografico; _nuevo/ para crear uno)
sistemas-diseno/     la MARCA: colores, tipografías, logos (importables desde Claude Design, Figma, manuales)
universos/           personajes y escenarios compartidos entre videos (_ejemplo/ trae uno completo)
videos/              UNA CARPETA POR VIDEO con estructura fija (ver videos/LEEME.md); _plantilla/ es la base
DECISIONES.md        decisiones que afectan a todo el repo, con fecha y razón
```

## Precedencia de reglas (cada regla vive en un solo lugar)
`nucleo/CONTRATO.md` (inviolable) → `jp.config.yaml` → perfil → método → estilo → sistema de diseño → `video.yaml` y `LEEME.md` del video.
Lo de la derecha sobrescribe a lo de la izquierda, **salvo el contrato**. Si dos reglas chocan y no está claro cuál manda, preguntar.

## Reglas de trabajo
1. **Compuertas**: en cada ⛔ se muestra el resultado y se **espera** la aprobación. Nunca adelantar la fase siguiente.
2. **Preguntas**: una o un bloque corto a la vez, con opciones concretas y una recomendada; esperar la respuesta. Nunca suponerla.
3. **Mirar antes de mostrar**: ningún cuadro, hoja o video se le muestra a la persona sin haberlo visto y criticado antes (`nucleo/prompts/critica.txt`).
4. **Estado en el manifiesto**: la fase de cada video vive en su `video.yaml`; se cambia solo con `node nucleo/jp.mjs completar|reabrir`.
5. **Datos**: si el video afirma hechos reales, cada dato con fuente; lo no verificable no entra.
6. **Marcas de terceros**: permitidas por defecto con uso nominativo (sin sugerir patrocinio; retirarlas si la marca lo pide). Cada uso se registra en `DECISIONES.md`.
7. **Código del núcleo**: cambio en `nucleo/lib/` o `nucleo/kit/` → test primero (`cd nucleo && npm test`).
8. **Git**: commits convencionales (`feat(007): …`, `fix(nucleo): …`, `docs: …`). Push solo cuando la persona lo pida.
9. **Idioma**: hablar con la persona en `idioma_conversacion`. La estructura del repo (carpetas, archivos, claves YAML) está en español y no se traduce; el contenido de cada video va en su `idioma`.

## CLI
```bash
node nucleo/jp.mjs doctor                 # requisitos, con cómo instalar lo que falte en este sistema operativo
node nucleo/jp.mjs agente [--id <agente>] # detecta o declara el agente → .jp/local.yaml
node nucleo/jp.mjs catalogo [--json]      # perfiles, estilos, métodos, sistemas de diseño, universos y videos
node nucleo/jp.mjs nuevo <slug> [--perfil … --estilo … --metodo … ...]   # crea videos/NNN-slug
node nucleo/jp.mjs estado <video>         # fases, la actual y qué leer
node nucleo/jp.mjs completar <video> <fase> [--nota "…"]
node nucleo/jp.mjs reabrir <video> <fase> [--nota "…"]
node nucleo/jp.mjs subtitulos <video> [--quemar] [--entrada <mp4>]
node nucleo/jp.mjs servir [--puerto 5180]  # vista previa en vivo de las escenas
```
Render y herramientas del método canvas: `metodos/canvas/METODO.md`.

## Detección del agente
`node nucleo/jp.mjs agente` lee `AI_AGENT` (convención emergente) y `CLAUDECODE`. Si tu entorno no los define,
declárate con `--id`. No se pregunta a la persona salvo que no sepas qué agente eres.
