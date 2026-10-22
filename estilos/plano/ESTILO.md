# Estilo · Plano (sin contorno)

Probado en producción. Gramática medida en referencias de motion plano (Kurzgesagt): se toma el oficio, nunca sus
personajes ni sus paletas. La paleta concreta la decide cada video en `diseno/guia-estilo.md` (o su sistema de diseño).

## Gramática
- **Sin contorno.** Cada forma se separa por **contraste de valor**: sujeto claro sobre fondo oscuro o al revés, nunca dos valores medios juntos.
- **Sombra de celda**: la misma forma, el mismo tono más oscuro y un poco más frío, borde duro, del lado contrario a la luz. Luz de borde fina y cálida del lado de la luz (`D.forma(g, d, { b, s, l })`).
- **Profundidad atmosférica**: lo lejano pierde saturación y contraste y se tiñe del color del cielo; lo cercano se satura.
- **Luz**: resplandores radiales suaves (sol, ventanas, polvo a contraluz). Degradados solo en cielo, luz y atmósfera; nunca en objetos. Luz práctica por momentos con `kit/luz.js`.
- **Sombras del mundo** de color (violeta, azul profundo), nunca gris ni negro.
- **Cámara**: casi no corta seco; cambia de escala con movimiento continuo (empujes, zoom a través de objetos, barridos).
- **Texto**: rótulos en cajas sólidas de color plano, tipografía geométrica gruesa (Montserrat 800). Entra con resorte, no con fundido.

## Personajes
- Rig de `nucleo/kit/rig.js`, ~4,4 cabezas, ojos de punto con brillo, cejas gruesas, sin contorno.
- Bloqueo de identidad escrito en la guía del video (3–6 rasgos que nunca cambian).

## Acabado
Grano fino determinista al 6–9 %, papel suave, viñeta de color (`ACABADO.con`). Desenfoque de movimiento real en el final (`--sub 4`).

## Trampas del estilo
- Dos valores medios juntos desaparecen a 360 px: si en `telefono.png` no se lee la silueta, sube el contraste de valor, no agregues contorno.
- La sombra de celda se calcula con la dirección de luz del mundo (`RIG.R.luz`); si una escena cambia la luz, cámbiala ahí, no por personaje.
