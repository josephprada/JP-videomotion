# Guía de estilo · 001 promo JP-videomotion

Hoja de look renderizada: `diseno/out/stills/look_9x16_0.00s.png` (`diseno/look.html`).
Código de marca: `js/marca.js` (estilo `jp` + `MARCA`) y `js/firma-datos.js` (generado desde `sistemas-diseno/jp/activos/trazos-firma.ts`).

## Dos familias de escenas
| Escenas | Estilo que carga su `index.html` | Look |
| --- | --- | --- |
| 02-problema, 03-marca, 04-terminal, 11-fases, 12-formatos, 13-codigo, 14-todos-los-estilos, 15-cierre | `js/marca.js` (estilo `jp`, sobre el armazón) | Sistema JP puro |
| 01-gancho, 10-tipografico | `tipografico` (typefx) con Anton horneada en `js/fuente-anton.js` | Sistema JP con efectos de glifo |
| 05-tarjetas, 06-vox, 07-comic, 08-capas, 09-plano | su estilo (`estilos/<id>/estilo.js`) sin cambiar su paleta | La piel del estilo; solo el punto es rojo JP |

## Paleta (sistema JP)
- Fondo ink `#0b0b0c` con un haz de luz cálido desde arriba a la izquierda; banda `#121214` para paneles.
- Texto papel `#f2efe9`; secundario `rgba(242,239,233,0.78)`; etiquetas tenues `0.52`; líneas finas `0.14` / `0.40`.
- Un solo acento: rojo `#e63329` (`#f53d31` en texto pequeño); `#a8231c` solo para brillos y sombras del rojo.
- En las pieles de otros estilos manda su paleta, **salvo el punto, que siempre es rojo JP**.

## Tipografía
- Titulares: Anton en MAYÚSCULAS (tamaño mínimo 72 px en 9:16).
- Frases: Geist 500. Etiquetas y comandos: Geist Mono 500 en MAYÚSCULAS, tracking 0,2 em, con cuadro rojo (`MARCA.rotulo`).
- Firma manuscrita (Mrs Saint Delafield) solo ≥ 44 px y solo en el cierre.

## El punto rojo («la idea»)
- `MARCA.punto(g, x, y, r)`: disco rojo con halo suave. Es el único elemento que cruza todas las escenas.
- Papel en cada piel: punto final de «IDEA.» → insignia de la tarjeta → marcador del mapa → pelota del cómic → sol →
  globo del personaje → punto final.
- **Corte por coincidencia**: cada escena de la ronda termina con el punto en el **punto de paso** (centro horizontal,
  47 % del alto, radio 28 px en 9:16 / 24 px en 16:9) y la siguiente empieza con él ahí mismo.

## Movimiento
- Cambio de piel: la escena sale con `FOCO.estado` (desenfoque 18 px + escala 6 % en 0,25 s) y la nueva entra
  enfocándose mientras el punto queda nítido encima: el ojo sigue el punto, la piel cambia detrás.
- Golpes anclados a la palabra de la voz (`voz/palabras.srt`, 0,08 s antes). Resortes del kit (`M.S.snappy` en interfaz,
  `M.S.heavy` en titulares, `M.S.playful` en pieles con personaje).
- Firma en movimiento (`MARCA.firma`): curvas y tiempos de `guia-movimiento.html` (2,3 s). En 03-marca solo el logo
  (`modo: "logo"`, 0,8 s); en 15-cierre completa con JOSEPH PRADA.
- Cámara: empujes cortos (≤ 8 %) y siempre con resorte; nada de giros.

## Formatos
- 9:16 manda el diseño; 16:9 reacomoda con `P.W/P.H` (titulares en una línea, paneles lado a lado). Zona segura en
  9:16: nada clave en los 250 px de abajo ni en los 160 de arriba (interfaz de las plataformas).

## Personajes
- Sin personajes nuevos. 09-plano reutiliza la persona de `universos/_ejemplo/js/persona.js` (cargada con ruta relativa,
  sin copiar) sosteniendo el punto como globo; el cordel se agarra con la mano cerrada (agarre por capas: cordel detrás
  de los dedos, delante de la palma).

## Prohibidos
- Otro color de marca además del rojo; esquinas redondeadas en elementos JP (radio 0); deformar el logo o moverlo
  fuera de la firma en movimiento.
- Fotos, clips, retratos o el clip de gestos del sistema JP.
- Texto en pantalla que no esté en `guion.md § Guion técnico`.
