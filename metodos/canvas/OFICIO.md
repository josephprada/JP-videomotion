# Oficio de escena (canvas)

Cómo se construye una escena buena. Lo obligatorio está en `nucleo/CONTRATO.md`; esto es el oficio.

## Anatomía de una escena
```
<v>/escenas/escenaN/index.html   carga el núcleo, el estilo, el js/ del video y escena.js (rutas relativas)
<v>/escenas/escenaN/escena.js    la escena: tabla T, planos y una función por plano
<v>/js/escena.js                 arranque común: ESCENA.crear({ t0, dur }) → { P, g, v, pj, estilo }
```
- `t0` = segundo de la voz donde empieza la escena; `dur` = siguiente corte − `t0`.
- `T` = palabras clave en segundos de la voz (de `voz/palabras.srt`). Todo golpe visual se ancla a una de ellas con `v(T.x)`.
- `P.planos([[desde, hasta, fn], …])`: un plano por idea; cada 2–4 s pasa algo nuevo.
- `P.dis(() => …)` dibuja en el espacio de diseño (1080 de ancho) sin importar la escala del render.
- `P.capa(cam, p, fn)`: capas con parallax (`p < 1` lejos, `p > 1` cerca).
- `pj(t)`: tiempo de los personajes (el estilo cómic los anima «en dos», a 12 fps).

## Movimiento
- Cosas con masa: `M.spring(t - inicio, ...M.S.<preset>)`. Valores que cambian de objetivo varias veces: `M.track`.
- Animación limitada: `M.held` mantiene poses; no todo tiene que moverse todo el tiempo.
- Cámara: punch-in en el golpe, deriva lenta en lo emocional, sacudida (`M.shake`) solo en impactos.

## Composición en 9:16
- La cara del personaje y el texto clave en el tercio central. Nada clave en el 15 % de arriba ni el 25 % de abajo
  (interfaz de la plataforma y subtítulos).
- Texto cinético grande cuando ES el mensaje; texto pequeño solo si se lee a 360 px.

## Personajes
- Fuente única: su código (`<v>/js/personajes.js` o `universos/<u>/js/`). Las hojas de modelo se renderizan desde ese código.
- Bloqueo de identidad: proporciones, paleta y rasgos que nunca cambian, escritos en la guía de estilo.
- Los personajes actúan con cuerpo y expresión (`RIG.EXPR_P`: neutro, feliz, sorpresa, preocupada, duda, habla, seria).

## Delegar en paralelo
Si el agente puede repartir escenas entre subagentes: primero `diseno/guia-animacion.md` (convenciones de código, paleta,
presets de resorte, cómo se nombran los planos) para que todos programen igual, y una escena por subagente.
