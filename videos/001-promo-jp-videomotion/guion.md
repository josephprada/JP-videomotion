# 001 · JP-videomotion: una idea, todos los estilos

| Campo | Valor |
| --- | --- |
| Producto | JP-videomotion |
| Para quién | Creadores que ya trabajan con un agente de IA |
| El beneficio (uno) | Una idea, cualquier estilo |
| Llamada a la acción | Clónalo: `github.com/josephprada/JP-videomotion` |
| Formato | 16:9 + 9:16 · 55–58 s (decisión del video: más largo que los 15–45 s del perfil) |

**La idea en una frase:** el punto rojo de JP es «la idea»; el video lo viste seis veces con estilos distintos y nunca
deja de ser la misma idea.

**El ángulo:** crees que cambiar de estilo es rehacer el video; aquí es la misma idea con otra piel.

**Motivo conductor (corte por coincidencia):** el punto rojo pasa de un estilo al siguiente ocupando el mismo lugar del
cuadro: punto final de «IDEA.» → insignia de la tarjeta → marcador del mapa → pelota del cómic → sol del paisaje →
globo del personaje → punto final otra vez. Cada cambio de piel es una transición de foco (desenfoque + escala).

---

## Texto

Unas 115 palabras, a ritmo de promo (≈ 2,2 palabras/s con pausas). Las etiquetas de emoción (ElevenLabs v4) van entre
corchetes antes de la frase y siguen activas hasta la siguiente.

> **[PROBLEMA]**
> `[intimate, curious]` Tienes una idea.
> `[wry, a little tired]` Pero no tienes un estudio. Ni un editor. `[dry]` Ni semanas.
>
> **[PRODUCTO]**
> `[bright, confident]` … Ahora sí: JP-videomotion *(en inglés: «Jay-Pee Video Motion»)*.
> `[warm, proud]` Tu agente de IA, convertido en estudio de video.
> `[playful, building up]` Le dices «nuevo video»… `[excited]` y arranca.
>
> **[PRUEBA]**
> `[energetic, rhythmic]` La misma idea… en tarjetas.
> `[intrigued, documentary tone]` En collage, como un documental.
> `[punchy, playful]` En cómic.
> `[slower, awed, airy]` En capas, con profundidad.
> `[cheerful, light]` Con personajes.
> `[soft, almost a whisper]` O solo con letra y voz.
> `[crisp, fast, matter-of-fact]` Guion, voz, diseño, animación, render. `[firm, reassuring]` Tú apruebas cada paso.
> `[confident]` Del mismo proyecto, horizontal y vertical.
> `[proud, deliberate]` Todo dibujado en código: el mismo resultado, cuadro a cuadro.
>
> **[LLAMADA A LA ACCIÓN]**
> `[slow, emphatic]` Una idea. Todos los estilos.
> `[warm, inviting, smiling]` JP-videomotion. Código abierto en GitHub.

---

## Voz
ElevenLabs v4; la persona genera el mp3. Prompt listo para pegar, voz y ajustes en `voz/elevenlabs-v4.md`.

---

## Guion técnico

| # | Tiempo (s) | Texto (voz) | Visual | Texto en pantalla | Sonido |
| --- | --- | --- | --- | --- | --- |
| 1 | 0–3,5 | Tienes una idea. | JP tipográfico. Ink. Un punto rojo cae del borde y rebota al centro; «TIENES UNA IDEA» entra palabra a palabra (karaoke) y el punto queda como punto final. | TIENES UNA IDEA. | Golpe grave al caer el punto; tic por palabra |
| 2 | 3,5–9 | Pero no tienes un estudio. Ni un editor. Ni semanas. | Una línea de tiempo de editor (pistas, clips, cursor) se llena de clips, se enreda y se desarma en líneas finas. Tachones rojos sobre «ESTUDIO», «EDITOR», «SEMANAS». | ~~ESTUDIO~~ ~~EDITOR~~ ~~SEMANAS~~ | Clics que se aceleran; corte seco al desarmarse |
| 3 | 9–12 | Ahora sí: JP-videomotion *(en inglés: «Jay-Pee Video Motion»)*. | Silencio de medio segundo; la firma JP en movimiento (2,3 s) se escribe y despliega; debajo, JP-VIDEOMOTION en Anton. | JP-VIDEOMOTION | Barrido ascendente y golpe al abrirse el logo |
| 4 | 12–15,5 | Tu agente de IA, convertido en estudio de video. Le dices «nuevo video»… y arranca. | Terminal en Geist Mono escribe `/jp-nuevo-video`; aparecen las preguntas de la entrevista como tarjetas finas; el punto rojo salta fuera de la terminal. | /jp-nuevo-video | Tecleo; «enter» con chispa |
| 5 | 15,5–19,5 | La misma idea… en tarjetas. | Estilo `tarjetas`: el punto se vuelve la insignia de una tarjeta crema; contador y odómetro suben; rayos suaves. | TARJETAS | Pulso de bajo y tics del odómetro |
| 6 | 19,5–23,5 | En collage, como un documental. | Estilo `vox`: papel, retícula de Mercator, recortes rasgados; el punto es el marcador que traza una ruta a mano y la rodea con un círculo. | VOX · COLLAGE | Papel que se rasga; rotulador |
| 7 | 23,5–27 | En cómic. | Estilo `comic`: viñetas que se arman; el punto es una pelota que golpea y suelta una onomatopeya. | ¡POW! · CÓMIC | Golpe con eco |
| 8 | 27–31 | En capas, con profundidad. | Estilo `capas`: el punto sube y se vuelve el sol; cordilleras con paralaje, niebla y rayos; cámara que avanza. | CAPAS | Pad abierto, aire |
| 9 | 31–34,5 | Con personajes. | Estilo `plano`: un personaje plano sostiene el punto como un globo y camina por una escena plana. | PLANO | Pasos con rebote |
| 10 | 34,5–38 | O solo con letra y voz. | Vuelta a `tipografico` (JP): palabras gigantes en karaoke; el punto vuelve a ser el punto final. | SOLO LETRA Y VOZ. | Tics por palabra |
| 11 | 38–43 | Guion, voz, diseño, animación, render. Tú apruebas cada paso. | Las fases como fichas en línea; cada una se enciende al nombrarla y una compuerta roja se cierra con ✓. Destellos de cada estilo dentro de las fichas. | GUION · VOZ · DISEÑO · ANIMACIÓN · RENDER · ✓ TÚ APRUEBAS | Un tic por ficha; «clac» en cada ✓ |
| 12 | 43–47,5 | Del mismo proyecto, horizontal y vertical. | El cuadro se parte: 16:9 y 9:16 lado a lado con la misma escena; los dos se mueven igual. | 16:9 · 9:16 | Barrido estéreo |
| 13 | 47,5–51 | Todo dibujado en código: el mismo resultado, cuadro a cuadro. | Una escena se descompone en su tira de fotogramas y vuelve a armarse idéntica; contador `91/91 ✓` en una esquina. | CÓDIGO · CUADRO A CUADRO · 91/91 PRUEBAS ✓ | Tic de reloj por cuadro |
| 14 | 51–54,5 | Una idea. Todos los estilos. | Mosaico rápido de las seis pieles con el punto rojo en el mismo lugar; colapsan en un solo punto. | UNA IDEA. TODOS LOS ESTILOS. | Acorde que resuelve |
| 15 | 54,5–58 | JP-videomotion. Código abierto en GitHub. | Firma JP cerrada; JP-VIDEOMOTION y la URL en Geist Mono; queda fija ≥ 1,5 s. | github.com/josephprada/JP-videomotion | Golpe final y cola |

---

## Títulos candidatos
1. Una idea, todos los estilos: tu agente de IA ahora hace videos
2. Convertí a mi agente de IA en un estudio de motion graphics
3. JP-videomotion: de «nuevo video» a video terminado, en el estilo que quieras
