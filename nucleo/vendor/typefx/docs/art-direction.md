# Dirección de arte y coreografía con typefx

Lo que hizo funcionar *Typography in Motion* (`examples/typography-in-motion/`). Úsalo como criterio, no como receta.

## Contenido

1. La letra es el material
2. Transiciones por geometría
3. Ritmo: un compás por idea
4. Color por roles
5. La línea de parámetros
6. Errores que ya cometimos
7. Revisión

## 1. La letra es el material

- La palabra de cada escena puede ser el nombre de lo que hace (STRETCH se estira): así el título es la demostración y no compite con ella.
- Trabaja con glifos sueltos, contornos y contraformas, no solo con palabras enteras. Por ejemplo: aislar la «A» de un mosaico, rellenar la contraforma de la O o hacer zoom hasta el interior de una letra.
- Usa contrastes de escala extremos: un texto de más de 900 px junto a una línea de 32 px.
- Anybody tiene ejes extremos (`wdth` 50–150, `wght` 100–900). A `wdth` 50 y `wght` 100, una letra mide unos 0,05 em de ancho. Úsalo para hacer barras, códigos de barras o filetes.

## 2. Transiciones por geometría

La salida de una escena es la geometría con la que arranca la siguiente. Ninguna transición es un fundido ni una plantilla. Mecanismos que funcionaron:

| De → a | Mecanismo |
|---|---|
| estirar → deformar | Las letras estiradas ×14 son barras; la escena siguiente arranca con el mismo estiramiento y lo deshace mientras la onda curva las barras. |
| deformar → morph | Un glifo del mosaico viaja y escala hasta la celda del morph (efecto `inline` con interpolación logarítmica de escala). |
| morph → cortar | La última letra se corta en láminas que salen volando. |
| eco → peso | El peso del texto principal sube rápido. Las copias con retardo muestran pesos anteriores y forman una rampa sin código extra. |
| giro → máscara | El bloque que gira se convierte en la ventana de la máscara siguiente. |
| espaciado → escala | Zoom ×16 a la contraforma de una letra (foco en el centroide del contorno interior). |
| escala → trayectoria | Con `path-flow` sobre `line` y el `offset` calculado, la trayectoria no cambia nada; después se transforma en curva. |
| final → inicio | El cierre se aplasta en la barra del fotograma 0 y el vídeo hace bucle. |

No repitas el mismo mecanismo dos escenas seguidas.

## 3. Ritmo: un compás por idea

- Cada escena dura 4 pulsos y en cada pulso cambia algo: un nuevo modo del efecto, una inversión de fondo o un cambio de palabra.
- Los movimientos llegan en el pulso (`outExpo`, `outBack`, `outElastic` durante 0,3–0,6 pulsos) y después respiran.
- El primer fotograma ya es tensión: la barra que estalla en letras en 0,2 s.
- Para escalas, interpola en logaritmo (`lg(a, b, t)`): ×1 → ×20 se ve uniforme.

## 4. Color por roles

- Las escenas solo nombran roles. Los que se usan son `paper`/`ink` (base), `paperInv`/`inkInv` (inversión), `surfaceA`/`onSurfaceA` y `surfaceB`/`onSurfaceB` (planos grandes), y `accent`/`onAccent`.
- Usa el acento una vez por escena como mucho, y solo en el golpe.
- Una misma escena puede elegir roles distintos por edición (`env.palette.is('mono')`). Por ejemplo, en mono los dos planos son blancos y hay que invertir de otra forma.
- Los solapes se resuelven con `overlap: 'xor'` o con máscaras, nunca con modos de fusión: así no aparecen colores fuera de la paleta.
- Para crear una paleta nueva, añade su JSON en `lib/typefx/color/palettes/`, ejecuta `node lib/typefx/tools/sync-palettes.mjs` y regístrala en `roles.js`.

## 5. La línea de parámetros

Es una línea monoespaciada con el efecto y sus valores en vivo (`02  warp-distort   field:twist   amp:320°`). Hace de ficha de biblioteca y de elemento gráfico.

- Colócala pegada a la composición: bajo la palabra, en el plano de color o como franja que corta el encuadre. No la pongas como etiqueta de esquina.
- Su posición salta por pulso, no por fotograma. Si se mueve continuamente, el desenfoque de movimiento la emborrona.

## 6. Errores que ya cometimos

- **Conservación de volumen sin límite:** al aplastar ×0,01, `volume` ensancha ×14 y `reflow` echa del encuadre a las letras visibles. Usa `maxSpread` (≈2).
- **Medir una capa dentro de sus propios parámetros:** una función de parámetro que llama a `layer.glyphsAt` de la misma capa entra en recursión. Mide con una capa gemela sin ese efecto.
- **`intensity: 0` en `variable-weight`:** mezcla hacia el peso que trae el glifo. Si quieres apagar el efecto, pon `intensity` a 0, no `wghtFrom`.
- **Eco con retardo al cambiar de fase:** las copias evalúan el pasado, así que muestran el estado de la fase anterior. Haz que posición y tamaño sean continuos entre fases.
- **Parámetros función:** los de tipo `fn` (por ejemplo `per`) son por glifo y no se evalúan como tiempo. Si inventas uno nuevo, decláralo con `type: 'fn'`.
- **Espirales cerradas:** el texto se apelotona si el radio interior es menor que unas 3 alturas de mayúscula.
- **Zoom extremo:** pasa `tol` bajo (0,04–0,1) en el spec para que las curvas no se vean facetadas.

## 7. Revisión

1. Haz una hoja de contactos de un fotograma por pulso (`contact-sheet.mjs --http 1 --query edition=…`) para cada edición y mírala.
2. Puntúa de 1 a 10: gancho en los 2 primeros segundos, legibilidad en móvil, calidad del movimiento, variedad, fidelidad a la marca y sincronía del sonido.
3. Corrige los tres peores problemas y repite hasta que todo esté en 8 o más.
4. Para ver un instante concreto, captura `seek(t)` con `subframes=1` (`?subframes=1`).
5. Comprueba la pureza: `seek(a)`, después `seek(b)` y luego `seek(a)` otra vez tienen que dar el mismo fotograma.
