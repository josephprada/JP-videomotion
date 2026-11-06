# typefx (vendorizado)

Motor de tipografía cinética en Canvas 2D con 12 efectos de glifo, de **Lorena Bordonaba**.
Original: https://github.com/lorena-bordonaba-pau/typefx · commit `ca5ba9fd3538b1d2b0ce2402c186d79baff7288e` · licencia MIT (`LICENSE`).
Fuentes: Anybody y JetBrains Mono, licencia SIL Open Font License (`fuentes/OFL-*.txt`).

## Qué se trajo
| Del original | Aquí |
| --- | --- |
| `typefx/` (la biblioteca) | esta carpeta |
| `assets/fonts/` | `fuentes/` |
| `references/*.md` | `docs/` (API, efectos, dirección de arte, cómo crear un efecto) |
| `examples/typography-in-motion/` | `ejemplos/` (referencia de coreografía; sus rutas de importación son las del proyecto original) |

## Cambios frente al original
- `fonts/anybody.js` y `fonts/jetbrains-mono.js` se regeneraron con `tools/bake-font.mjs` para incluir **minúsculas, tildes, ñ,
  «comillas» y signos** (el original solo traía mayúsculas). Mismos ejes y la misma rejilla de instancias.
- `package.json` con `"type": "module"` para que Node cargue los módulos sin avisos.
- Nada más: el código de la biblioteca está intacto. Para actualizarlo, copiar de nuevo `typefx/` del original y volver a generar las fuentes.

## Cómo se usa en JP-videomotion
No se importa directamente desde una escena: se usa a través de `nucleo/kit/tipo.mjs`, que pone el reloj de la voz
(un pulso = un segundo), las palabras de `voz/palabras.srt`, el formato y la escala del render. Ver `estilos/tipografico/ESTILO.md`.
