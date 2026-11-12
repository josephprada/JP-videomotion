# Estilo · Capas (2.5D)

Paisaje **pintado en planos** que se separan con la cámara: naturaleza, ambientes, aperturas emotivas, cuentos y fondos
para voz en off. Gramática medida en una animación de referencia «2.5D nature» (se toma el oficio, nunca sus dibujos).
Kit: `nucleo/kit/capas.js` (+ `FOCO.profundidad` para la profundidad de campo).

## Gramática
- **El cielo está en el infinito**: es el fondo (`ESTILO.cielo`) y no se mueve con la cámara. El sol vive en el cielo.
- **Planos por profundidad** con `CAPAS.capa(g, cam, p, fn)`: p ≈ 0,05 montañas lejanas, 0,2 cordillera media,
  0,4 colinas y árboles, 0,5 lago, 0,75 pradera (plano del foco), 1,3+ primer plano. En reposo todas las capas
  coinciden con el cuadro de diseño: se dibujan en las mismas coordenadas de 1080 × 1920.
- **Perspectiva atmosférica obligatoria**: cada plano lejano se tiñe del color de la niebla (`CAPAS.atmosfera(color, niebla, d)`,
  d ≈ 0,6 lejos, 0,3 medio, 0,15 colinas). Es lo que separa los planos; sin ella el paisaje se ve recortado y plano.
- **Cámara que avanza despacio** (zoom 1 → 1,1 y un desliz lateral en toda la escena). Nunca un corte dentro del paisaje.
- **La luz manda**: sol bajo detrás de una cumbre, halo amplio, **rayos** suaves entre montañas y colinas (`CAPAS.rayos`,
  a ≈ 0,08), **niebla** que deriva entre planos (`CAPAS.niebla`). La luz es atmósfera, nunca focos que cruzan el cuadro.
- **Agua con reflejo** (`CAPAS.reflejo`): refleja el cielo y las capas lejanas, ondula más hacia la orilla y se oscurece con un tinte.
- **Vida que se mece**: árboles, pasto y flores con `CAPAS.vaiven` (el viento pasa como una ola, de un lado al otro).
- **Profundidad de campo**: foco en el plano de la acción; el primer plano se desenfoca con
  `{ blur: FOCO.profundidad(p, pFoco) }` y **enmarca** los bordes (alto en los lados, bajo al centro).
- **Golpe en la palabra**: algo crece, florece o se ilumina en la palabra clave, en ola (escalonado por x), con resorte juguetón.
- **Color por roles** en `ESTILO.color` (cieloA/B, agua, sol, luz, niebla, monte, colina, pradera, pasto, copa, copaLuz, tronco,
  flores); el video lo cambia con `Object.assign(ESTILO.color, { … })`. Un amanecer, un mediodía o una noche son otra paleta, no otro código.

## Sincronía con la voz
- El avance de cámara cubre toda la escena; los golpes (florecer, encenderse, aparecer un animal) caen en palabras de `voz/palabras.srt`.

## Acabado
Papel muy leve (textura pictórica), grano fino, viñeta del color de la hora (violeta al atardecer).

## Trampas del estilo
- **El primer plano sale del cuadro al avanzar**: con zoom, lo cercano crece y se aleja del centro. Haz que nazca por debajo
  del cuadro (y > 1920) y que sea alto en los bordes, o desaparecerá a mitad de la escena.
- **Lo fino desenfocado desaparece**: un desenfoque de 15 px sobre una brizna de 18 px reparte su opacidad (queda al ~30 %).
  Lo que va desenfocado en primer plano es ancho (hojas, ramas, troncos), no líneas.
- **Reflejo de capas con cámara**: dentro de `CAPAS.reflejo`, vuelve a la transformación de diseño (`a.setTransform(D)`,
  con `D = g.getTransform()` tomado al entrar en `P.dis`) antes de dibujar las capas que se reflejan; si no, se aplica dos veces el parallax.
- **Las masas lejanas llegan hasta debajo de la línea del agua** (suelo = agua + 90): con el zoom cada plano se desplaza distinto
  y sin ese margen se ve una ranura de cielo entre la montaña y el lago.
