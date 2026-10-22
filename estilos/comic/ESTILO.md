# Estilo · Cómic en movimiento

Probado en producción (tres videos seguidos). Referencia de lenguaje: el cómic moderno animado («Un nuevo universo»).
El look sale de la **gramática del cómic**, no de un filtro: tinta, trama, viñetas, letras y animación «en dos».

## Gramática
- **Tinta** `#1A1226` o `#120A1E` (negro violeta, nunca negro puro). Silueta exterior gruesa (6–8 px a 1080 de ancho) y línea interior fina (2–3 px), mismo grosor en pantalla sin importar la escala.
- Trazos de pincel afinados en las puntas para pelo, pliegues y líneas de acción (`COMIC.pincel`). Salpicaduras (`COMIC.manchas`) solo en los golpes, nunca de adorno.
- **Sombra de dos tonos duros**, sin degradados en los personajes. **Trama Ben-Day** en las sombras medias (pasada global `COMIC.semitono`) y tramado en lo más hondo.
- **Luz de borde de color** del lado contrario a la luz principal (`COMIC.luzBorde`); el color de esa luz puede cambiar por acto.
- **El color cuenta la historia**: una paleta por acto (luz, sombra, acento) en la guía del video. El objeto protagonista es siempre el color más saturado del cuadro.
- **Personajes «en dos»** (12 fps) con la cámara a 60: `pj(t)` del arranque.
- **Viñetas**: borde de tinta de 10 px y calle de 18 px; diagonales en la acción, horizontales anchas en lo de época, página completa solo para el golpe mayor. Algo rompe el borde al menos una vez por escena. Viñetas de forma libre con `COMIC.vinetaPoligono`.
- **Letras**: Bangers para onomatopeyas y cajas de narrador; cajas amarillas con borde de tinta; globos blancos con cola. Nada de texto sobre una cara.

## Personajes
Proporciones semirrealistas, no caricatura: cabeza 1/7 del alto en adultos y 1/5 en niños. Ojos con blanco, iris y párpado;
cejas de pincel; nariz con plano de sombra. Personas reales: inspiradas en, nunca retratos (o solo silueta).

## Trampas del estilo
- **Bangers**: la L parece una I en el celular; evitar onomatopeyas con L.
- **Bordes de viñeta con `g.stroke()` a secas** trazan el último trazado del contenido: usar `COMIC.vinetaPoligono`, que traza su propio `Path2D`.
- El semitono global «hierve» en zonas quietas si algo debajo cambia 1 px: revisar `tira.png` en planos fijos.
- No intentar igualar pincel pintado: el código dibuja para poder animar; la pintura cuadro a cuadro no se anima.
