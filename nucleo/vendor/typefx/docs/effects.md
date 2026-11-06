# typefx: referencia de efectos

Generado por `lib/typefx/tools/gen-docs.mjs` a partir del código. No editar a mano.

## Parámetros comunes

Todos los efectos los aceptan.

| Parámetro | Tipo | Rango | Por defecto | Qué hace |
|---|---|---|---|---|
| `intensity` | number | 0 … 2 | 1 | Multiplicador global del efecto |
| `start` | beats | 0 … 16 | 0 | Pulso de inicio, relativo a la capa |
| `duration` | beats | 0.25 … 16 | 4 | Duración en pulsos |
| `easing` | ease |  | outExpo | Curva del progreso |
| `direction` | angle | -180 … 180 | 0 | Dirección del movimiento (grados) |
| `speed` | number | -4 … 4 | 1 | Velocidad (ciclos por pulso) |
| `stagger` | beats | 0 … 1 | 0 | Retardo entre glifos (pulsos) |
| `sync` | enum | beat · bar · free | beat | Cuantización al pulso |
| `seed` | int | 1 … 9999 | 1 | Semilla del azar |

## 01 · Stretch / Squash · `stretch-squash`

Etapa: transform. Módulo: `lib/typefx/effects/stretch-squash/index.js`.

| Parámetro | Tipo | Rango | Por defecto | Qué hace |
|---|---|---|---|---|
| `axis` | enum | y · x | y | Eje del estiramiento |
| `from` | number | 0.01 … 20 | 1 | Factor inicial |
| `amount` | number | 0.01 … 20 | 3 | Factor final (1 = sin cambio) |
| `volume` | number | 0 … 1 | 0.5 | Conservación de volumen (el otro eje se compensa) |
| `elastic` | number | 0 … 1 | 0 | Rebote de muelle al llegar |
| `anchor` | enum | baseline · center · cap | baseline | Punto fijo del estiramiento |
| `wave` | number | 0 … 1 | 0 | Variación ondulada entre glifos |
| `waveFreq` | number | 0 … 3 | 0.8 | Frecuencia de la onda (rad por glifo) |
| `maxSpread` | number | 1 … 20 | 6 | Límite del ensanchado compensatorio (×) |
| `reflow` | enum | none · left · center | center | Recolocar al cambiar la anchura |
| `per` | fn |  | — | Función (k, n, p) => factor extra por glifo |

Demo: `{"amount":3.2,"volume":0.6,"elastic":0.7,"stagger":0.2,"duration":2}` sobre «STRETCH».

## 02 · Warp / Distort · `warp-distort`

Etapa: transform. Módulo: `lib/typefx/effects/warp-distort/index.js`.

| Parámetro | Tipo | Rango | Por defecto | Qué hace |
|---|---|---|---|---|
| `field` | enum | sine · noise · twist · bulge · shear | sine | Tipo de campo de deformación |
| `amplitude` | number | 0 … 600 | 80 | Amplitud (px; grados en twist; fuerza ×100 en bulge) |
| `frequency` | number | 0 … 12 | 2 | Ciclos por 1000 px |
| `center` | vec2 |  | pista de claves | Centro del campo (px) |
| `radius` | number | 10 … 2000 | 520 | Radio de influencia (twist, bulge) |
| `density` | number | 2 … 40 | 6 | Longitud máxima de tramo antes de deformar (px) |

Demo: `{"field":"sine","amplitude":60,"frequency":2.2,"direction":0,"speed":0.5}` sobre «WARP / WARP / WARP».

## 03 · Glyph Morphing · `glyph-morph`

Etapa: source. Módulo: `lib/typefx/effects/glyph-morph/index.js`.

| Parámetro | Tipo | Rango | Por defecto | Qué hace |
|---|---|---|---|---|
| `to` | text |  |  | Texto destino, carácter a carácter (modo par) |
| `sequence` | text |  |  | Cadena de letras por la que pasa cada glifo (modo cadena) |
| `progress` | number | 0 … 1 | — | Progreso manual (si es nulo, se usa el tiempo) |
| `perStep` | beats | 0.125 … 4 | 0.5 | Pulsos por paso en modo cadena |
| `hold` | number | 0 … 0.9 | 0.35 | Fracción de cada paso que la letra se queda quieta |
| `weightDip` | number | -800 … 800 | 0 | Cambio de peso en mitad de la transformación |

Demo: `{"sequence":"AMORPH","perStep":0.5,"easing":"inOutCubic"}` sobre «A».

## 04 · Split / Fragment · `split-fragment`

Etapa: transform. Módulo: `lib/typefx/effects/split-fragment/index.js`.

| Parámetro | Tipo | Rango | Por defecto | Qué hace |
|---|---|---|---|---|
| `mode` | enum | slices · columns · shards | slices | Forma del corte |
| `count` | int | 2 … 60 | 9 | Número de piezas |
| `spread` | number | 0 … 1 | 1 | Separación (0 = entero, 1 = máxima) |
| `offset` | number | 0 … 1200 | 220 | Desplazamiento máximo (px) |
| `rotation` | number | 0 … 180 | 0 | Giro máximo de cada pieza (grados) |
| `bounds` | rect |  | — | Zona de corte (por defecto, la caja del texto) |
| `pattern` | enum | alternate · random · radial | alternate | Reparto del desplazamiento |
| `roles` | list |  | — | Roles de color alternos por pieza |
| `rebel` | object |  | — | Pieza que no vuelve: { cell, dx, dy, role } |

Demo: `{"mode":"slices","count":9,"spread":{"keys":[[0,0],[1,1,"outExpo"],[3,1],[4,0,"inOutExpo"]]},"offset":260}` sobre «SPLIT».

## 05 · Duplicate / Echo · `duplicate-echo`

Etapa: render. Módulo: `lib/typefx/effects/duplicate-echo/index.js`.

| Parámetro | Tipo | Rango | Por defecto | Qué hace |
|---|---|---|---|---|
| `copies` | number | 0 … 24 | 6 | Número de copias (admite fracción para animarlo) |
| `delay` | beats | 0 … 2 | 0.125 | Retardo entre copias (pulsos) |
| `offset` | vec2 |  | pista de claves | Desplazamiento por copia (px) |
| `scale` | number | 0.5 … 2 | 1 | Escala por copia |
| `rotate` | number | -45 … 45 | 0 | Giro por copia (grados) |
| `pivot` | vec2 |  | pista de claves | Pivote de escala y giro (px) |
| `mode` | enum | fill · outline · alternate · front-outline | outline | Cómo se pintan las copias |
| `stroke` | number | 0.5 … 12 | 2.5 | Grosor del contorno de las copias |
| `copyRole` | role |  | — | Rol de color de las copias (por defecto, el de la capa) |
| `roles` | list |  | — | Roles alternos por copia |

Demo: `{"copies":7,"delay":0.12,"offset":[0,110],"mode":"outline"}` sobre «ECHO».

## 06 · Variable Weight · `variable-weight`

Etapa: source. Módulo: `lib/typefx/effects/variable-weight/index.js`.

| Parámetro | Tipo | Rango | Por defecto | Qué hace |
|---|---|---|---|---|
| `mode` | enum | tween · wave · ramp | tween | tween: de un valor a otro · wave: onda por glifo · ramp: gradiente por línea o glifo |
| `wghtFrom` | number | 100 … 900 | 100 | Peso inicial / mínimo |
| `wghtTo` | number | 100 … 900 | 900 | Peso final / máximo |
| `wdthFrom` | number | 50 … 150 | — | Anchura inicial / mínima (nulo = no tocar) |
| `wdthTo` | number | 50 … 150 | — | Anchura final / máxima |
| `waveLength` | number | 1 … 30 | 6 | Glifos por ciclo de onda |
| `rampBy` | enum | line · glyph | line | Qué recorre la rampa |

Demo: `{"mode":"wave","waveLength":6,"speed":0.5}` sobre «WEIGHT».

## 07 · Rotation / Spin · `rotation-spin`

Etapa: transform. Módulo: `lib/typefx/effects/rotation-spin/index.js`.

| Parámetro | Tipo | Rango | Por defecto | Qué hace |
|---|---|---|---|---|
| `mode` | enum | rotate · sync · flip · set | rotate | rotate: hasta un ángulo · sync: vueltas alineadas al pulso · flip: giro de tarjeta en plano · set: todo el bloque |
| `angle` | number | -720 … 720 | 90 | Ángulo final (grados) |
| `turns` | int | 1 … 4 | 1 | Vueltas por pulso en modo sync (se suma una por glifo alterno) |
| `pivot` | enum | center · baseline-left · baseline-right · baseline-center · cap-left | center | Pivote de cada glifo |
| `spin` | enum | cw · ccw · alternate | cw | Sentido |
| `origin` | vec2 |  | — | Pivote del modo set (por defecto, el centro del bloque) |
| `per` | fn |  | — | Función (k, n, p) => grados extra por glifo |

Demo: `{"mode":"sync","turns":1,"stagger":0.05,"easing":"inOutQuart"}` sobre «SPIN».

## 08 · Mask / Reveal · `mask-reveal`

Etapa: render. Módulo: `lib/typefx/effects/mask-reveal/index.js`.

| Parámetro | Tipo | Rango | Por defecto | Qué hace |
|---|---|---|---|---|
| `shape` | enum | windows · blinds · diagonal · wipe · glyph · rects · circle · poly | blinds | Forma de la máscara |
| `count` | int | 1 … 40 | 8 | Número de ventanas o lamas |
| `size` | number | 20 … 1920 | 520 | Anchura de las ventanas (px) |
| `progress` | number | 0 … 1 | — | Progreso manual (nulo = tiempo) |
| `vertical` | bool |  | false | Persianas verticales |
| `text` | text |  | M | Texto de la máscara (shape = glyph) |
| `cap` | number | 50 … 2000 | 900 | Altura de mayúscula de la máscara |
| `at` | vec2 |  | pista de claves | Línea base de la máscara (px) |
| `wght` | number | 100 … 900 | 900 | Peso de la máscara |
| `wdth` | number | 50 … 150 | 100 | Anchura de la máscara |
| `rects` | list |  | — | Rectángulos explícitos (shape = rects) |
| `radius` | number | 0 … 2400 | 400 | Radio (shape = circle; centro en at) |
| `points` | list |  | — | Vértices [[x, y], …] (shape = poly) |
| `surface` | role |  | — | Rol del plano que rellena la máscara |
| `inside` | role |  | — | Rol del texto dentro de la máscara |
| `outside` | role |  | — | Rol del texto fuera (nulo = no se ve; 'keep' = el suyo) |
| `outsideSurface` | role |  | — | Rol del fondo fuera de la máscara |

Demo: `{"shape":"blinds","count":9,"duration":2,"surface":"surfaceB","inside":"onSurfaceB","outside":"ink","easing":"inOutExpo"}` sobre «REVEAL».

## 09 · Tracking / Spacing · `tracking-spacing`

Etapa: source, transform. Módulo: `lib/typefx/effects/tracking-spacing/index.js`.

| Parámetro | Tipo | Rango | Por defecto | Qué hace |
|---|---|---|---|---|
| `mode` | enum | tween · wave · justify · grid | tween | tween · wave · justify (a una anchura) · grid (cada glifo a una columna) |
| `from` | number | -0.5 … 2 | -0.12 | Tracking inicial (em) |
| `to` | number | -0.5 … 2 | 0.6 | Tracking final (em) |
| `amplitude` | number | 0 … 1 | 0.25 | Amplitud de la onda (em) |
| `waveLength` | number | 1 … 20 | 4 | Glifos por ciclo |
| `width` | number | 100 … 4000 | 1728 | Anchura objetivo en justify (px) |
| `columns` | list |  | — | Bordes x de destino en grid (px), uno por glifo |

Demo: `{"mode":"tween","from":-0.15,"to":0.5,"stagger":0.04,"easing":"inOutExpo","duration":2}` sobre «SPACING».

## 10 · Scale / Cropping · `scale-cropping`

Etapa: render. Módulo: `lib/typefx/effects/scale-cropping/index.js`.

| Parámetro | Tipo | Rango | Por defecto | Qué hace |
|---|---|---|---|---|
| `windows` | list |  | — | Ventanas [{ x, y, w, h, zoom, focus: [x, y], surface }] (px) |
| `zoom` | number | 0.05 … 80 | 1 | Zoom de la ventana única (si no hay windows) |
| `focus` | vec2 |  | pista de claves | Punto del mundo que queda en el centro de la ventana |
| `surface` | role |  | — | Rol del fondo de cada ventana |

Demo: `{"zoom":{"keys":[[0,1],[1.5,14,"inOutExpo"],[3,14],[4,1,"inOutExpo"]]},"focus":[870,560]}` sobre «SCALE».

## 11 · Path / Flow · `path-flow`

Etapa: transform. Módulo: `lib/typefx/effects/path-flow/index.js`.

| Parámetro | Tipo | Rango | Por defecto | Qué hace |
|---|---|---|---|---|
| `path` | enum | line · s-curve · wave · arc · spiral · circle | s-curve | Trayectoria (o array de puntos propio) |
| `morphTo` | enum | line · s-curve · wave · arc · spiral · circle | — | Trayectoria hacia la que se transforma |
| `morph` | number | 0 … 1 | 0 | Progreso de la transformación de trayectoria |
| `offset` | number | -4000 … 4000 | 0 | Posición inicial sobre la trayectoria (px) |
| `flow` | number | -1000 … 1000 | 180 | Avance por pulso (px) |
| `lane` | number | -800 … 800 | 0 | Desplazamiento paralelo de la trayectoria (px) |
| `deform` | enum | bend · rigid | bend | bend: el glifo se curva · rigid: solo se coloca y gira |
| `density` | number | 2 … 40 | 8 | Longitud máxima de tramo (px) en bend |

Demo: `{"path":"s-curve","flow":220}` sobre «FLOW FLOW FLOW FLOW FLOW FLOW».

## 12 · Layer / Compose · `layer-compose`

Etapa: compose. Módulo: `lib/typefx/effects/layer-compose/index.js`.

| Parámetro | Tipo | Rango | Por defecto | Qué hace |
|---|---|---|---|---|
| `layouts` | list |  | — | Lista de disposiciones; cada una, un rectángulo por capa (px) |
| `step` | number | 0 … 16 | — | Índice de disposición (fracción = transición). Nulo = un cambio por pulso |
| `transition` | number | 0.05 … 1 | 0.35 | Fracción del pulso que dura el cambio |
| `fit` | enum | cover · contain · stretch | cover | Cómo encaja cada capa (diseñada a 1920×1080) en su ranura |
| `surfaces` | list |  | — | Rol de fondo de cada capa |

Demo: `{}` sobre «LAYER».
