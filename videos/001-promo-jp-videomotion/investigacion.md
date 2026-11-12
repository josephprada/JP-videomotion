# Brief de producto y marca

Datos verificados en el propio repo el 2026-11-12 (rama `feat/video-promo`, base `main` en `f87950b`).
Todo lo que el video afirma sale de esta tabla; lo demás no entra.

## Producto
| Campo | Valor |
| --- | --- |
| Nombre | JP-videomotion |
| Qué es | «Un estudio de video que manejas conversando con tu agente de IA» (`README.md`) |
| Para quién | Creadores que ya trabajan con un agente de IA (Claude Code u otro que lea `AGENTS.md`) |
| Beneficio único | Una idea, cualquier estilo: el mismo flujo y el mismo motor visten la historia del estilo que pidas |
| Llamada a la acción | `github.com/josephprada/JP-videomotion` (remoto `origin` del repo) |
| Licencia | MIT (`README.md § Licencia`) |

## Pruebas que puede mostrar el video
| Afirmación en pantalla | Dato | Fuente |
| --- | --- | --- |
| «6 estilos» | `tipografico`, `tarjetas`, `vox`, `comic`, `capas`, `plano` (+ `_nuevo/` para crear uno propio) | `estilos/` |
| «5 tipos de video» | `libre`, `historia-narrada`, `explicador`, `promo-lanzamiento`, `tutorial` | `perfiles/` |
| «3 métodos» | `canvas` (estable), `hyperframes` y `generativo` (experimentales) | `metodos/`, `AGENTS.md § Mapa` |
| «14 fases, tú apruebas en 9» | brief → investigación → guion → voz → tiempos → diseño → storyboard → animatic → producción → sonido → render → subtítulos → entrega → ajustes; compuertas en brief, investigación, guion, voz, diseño, storyboard, animatic, entrega y ajustes | `node nucleo/jp.mjs estado 001` |
| «Kit de animación en código» | 13 módulos en `nucleo/kit/`: foco, ui, collage, capas, cámara, luz, cómic, rig, dibujo, armazón, acabado, fuentes, svgctx | `nucleo/kit/` |
| «Render reproducible» | Cuadro a cuadro con `window.seek(t)`, Playwright y ffmpeg; `--raster software` da el mismo resultado entre procesos | `nucleo/render.mjs`, `nucleo/lib/raster.mjs` |
| «91 pruebas en verde» | `cd nucleo && npm test` → 91 pass, 0 fail | ejecución del 2026-11-12 |
| «16:9 y 9:16» | `formatos` en `video.yaml` | `videos/_plantilla/video.yaml` |
| «Tu marca» | Sistemas de diseño importables desde Claude Design, Figma, un manual o a mano | `flujos/sistema-diseno.md` |
| «Empieza con una frase» | «nuevo video» / `/jp-nuevo-video` | `README.md § Empezar`, `.claude/skills/` |

Comandos reales que puede escribir la terminal en pantalla: `/jp-nuevo-video`, `/jp-producir`,
`node nucleo/jp.mjs estado 001`, `node nucleo/render.mjs …`.

## Lo que el video NO afirma
- Que funciona con «cualquier» agente: se dice «tu agente de IA»; el soporte probado es Claude Code y los agentes que leen `AGENTS.md`.
- Que es «automático» sin persona: el valor es que tú decides en cada compuerta (el modo automático existe, pero no es el mensaje).
- Tiempos de producción («un video en X minutos»): no hay una medición que lo respalde.
- `hyperframes` y `generativo` como estables: se nombran, no se presentan como el camino principal.

## Marca
- Sistema `sistemas-diseno/jp`: ink `#0b0b0c`, papel `#f2efe9`, un solo rojo `#e63329` (`#f53d31` en texto pequeño);
  Anton en MAYÚSCULAS para títulos, Geist para texto, Geist Mono en MAYÚSCULAS para etiquetas, Mrs Saint Delafield ≥ 44 px.
- Logo: `logo-jp-rojo.svg` / `logo-jp-papel.svg`; firma en movimiento de 2,3 s dibujada desde `trazos-firma.ts`.
- Los otros estilos rompen la paleta a propósito dentro de la ronda de estilos; apertura, rótulos de bloque y cierre son JP.
- Sin retratos, clip de gestos ni mp4 de la firma (activos personales que no se publican).
