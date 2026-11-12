# Estilo · Tarjetas (escenario continuo y foco)

Lenguaje de interfaz para **comparativas, tutoriales, explicadores de producto y resultados**: tarjetas que entran y salen
enfocándose sobre un escenario que nunca se corta. Gramática medida en un video de referencia de comparativas de modelos
(se toma el oficio, nunca sus marcas ni su paleta). Kit: `nucleo/kit/foco.js` y `nucleo/kit/ui.js`.

## Gramática
- **Un solo escenario continuo.** Degradado + halo + rayos de luz que derivan muy lento + rejilla al 4 % (`ESTILO.escenario`).
  El fondo NUNCA se corta: lo que cambia son las tarjetas. El ojo descansa porque el mundo no salta.
- **La transición es un cambio de foco, no un fundido.** Lo que entra se enfoca (desenfoque + opacidad + escala 0,94 → 1);
  lo que sale se desenfoca. Entradas 0,35–0,5 s, escalonadas 0,1–0,35 s entre elementos (`FOCO.estado`, `FOCO.dibujar`).
- **Títulos karaoke**: el título se escribe palabra por palabra con la voz; cada palabra entra enfocándose (`FOCO.texto`).
  Sans (Inter 600) para el cuerpo y **la palabra clave en serif itálica** (Instrument Serif). Una palabra clave por título.
- **Tarjetas** blancas, esquinas 26, sombra azul profunda y suave (nunca gris), contenido recortado a las esquinas.
  La elegida gana un **borde con brillo** (`borde` del color) y una **onda** sobre su insignia (`UI.dibujarOnda`).
- **Insignias tipo píldora** con un punto de color para nombrar quién es quién (`UI.insignia`).
- **Cifras con odómetro** (`UI.digitos` + `UI.contador`): cada dígito rueda en su cajita; la cifra se lee aunque esté en movimiento.
- **Conectores punteados que se dibujan** con un punto brillante en la punta (`UI.conector`): llevan el ojo de la prueba al veredicto.
- **Capítulos en tarjeta crema**: una tarjeta crema entra enfocándose y CRECE hasta llenar el cuadro (continuidad: el siguiente
  plano ya estaba en el anterior). Frase con jerarquía mezclada: serif itálica pequeña + sans + una palabra enorme en el acento.
- **Color por roles** en `ESTILO.color` (cieloA/B, luz, tarjeta, tinta, suave, acento, borde, crema, tintaCrema, acentoCrema).
  El video lo cambia desde su sistema de diseño: `Object.assign(ESTILO.color, { … })` en `<video>/js/escena.js`, nunca hex en la escena.
- **Acento una vez por plano**, en el golpe.

## Sincronía con la voz
- Cada palabra del título karaoke y cada entrada de tarjeta se ancla a una palabra de `voz/palabras.srt` (tiempos globales en `T`).
- Los contadores empiezan cuando la voz dice la cifra y terminan antes de que la frase acabe.

## Acabado
Grano muy fino (3,5 %), sin papel, viñeta azul profunda. Mientras una tarjeta crema llena el cuadro, la escena sube
`ESTILO.limpio` (0..1) para que la viñeta no ensucie la crema; se reinicia a 0 al principio de cada cuadro.

## Trampas del estilo
- **Desenfoque costoso**: `FOCO.dibujar` sin `caja` desenfoca el cuadro entero. Pasa siempre `caja` con margen para sombras,
  insignias y ondas (lo que sobresale de la caja se recorta mientras está desenfocado).
- **Estado global por cuadro** (`ESTILO.limpio`): reinícialo al principio de cada `seek`; si no, ir hacia atrás en el tiempo
  arrastra el valor del último cuadro.
- Las insignias van sobre el borde superior de la tarjeta (mitad dentro, mitad fuera): dibújalas dentro del mismo `FOCO.dibujar`
  de su tarjeta para que entren y salgan juntas.
