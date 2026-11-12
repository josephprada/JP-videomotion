# Brief

| Campo | Valor |
| --- | --- |
| La idea en una frase | Una sola idea cambia de piel siete veces: con JP-videomotion, tu agente de IA convierte una idea en un video terminado, en el estilo que quieras. |
| Objetivo | Posicionar y dar ganas de probar: que un creador clone el repo. |
| Audiencia | Creadores que ya producen con IA (Claude Code u otros agentes) y quieren videos animados sin editor de video. |
| Qué debe sentir al final | «Esto lo puedo hacer yo, y en cualquier estilo.» Satisfacción visual: cada corte encaja. |
| Plataformas | 9:16 para TikTok, Reels y Shorts; 16:9 para YouTube y X. |
| Restricciones | 45–60 s. Sin fotos ni clips: todo se dibuja en código. Sin retratos ni clip de gestos del sistema JP. |

## Producto
- **Qué es**: un repo que convierte a tu agente de IA en un estudio de motion graphics: entrevista → guion → voz → diseño →
  storyboard → animación → render → subtítulos, con compuertas donde decide la persona.
- **Beneficio único**: *una idea, cualquier estilo*. El mismo motor y la misma historia se visten de lo que pidas.
- **Pruebas** (todas reales, salen del repo y se renderizan con él):
  - 6 estilos: `tipografico`, `tarjetas`, `vox`, `comic`, `capas`, `plano`.
  - Kit de canvas: `FOCO` (entradas por desenfoque, profundidad de campo, karaoke), `UI` (contador, odómetro, onda,
    tarjeta, insignia), `COLLAGE` (papel, recorte rasgado, marcador, retícula de Mercator), `CAPAS` (paralaje, niebla, rayos).
  - Render determinista cuadro a cuadro (`window.seek(t)` + Playwright + ffmpeg), 16:9 y 9:16 del mismo proyecto.
  - Perfiles (`historia-narrada`, `explicador`, `promo-lanzamiento`, `tutorial`), sistemas de diseño de marca y 3 métodos
    (`canvas`, `hyperframes`, `generativo`).
- **Llamada a la acción**: `github.com/josephprada/JP-videomotion`, en pantalla al menos 1,5 s, legible sin sonido.

## Concepto: misma idea, varios estilos
- **Motivo conductor**: una frase-semilla («una idea») y un punto rojo JP que la acompaña y atraviesa todo el video. En
  cada bloque el mismo motivo se redibuja con otro estilo; el cambio de piel se hace con las transiciones de foco del kit
  (desenfoque y escala), barridos y cortes por coincidencia sobre el punto rojo.
- **Estructura (problema → producto → prueba → llamada)**:
  1. **Gancho (0–4 s)**, JP tipográfico: «Tienes una idea.» Golpes de Anton sobre ink; el punto rojo cae.
  2. **Problema (4–9 s)**: una línea de tiempo de editor que se enreda y se rompe → «Y no tienes un estudio.»
  3. **Producto (9–15 s)**: firma en movimiento JP → `JP-VIDEOMOTION`; una terminal escribe `/jp-nuevo-video`.
  4. **Prueba: la ronda de estilos (15–45 s)**, unos 4 s por piel, cada una con su recurso estrella del kit:
     `tarjetas` (contador y odómetro), `vox` (mapa de Mercator, recortes y marcador), `comic` (viñetas y onomatopeya),
     `capas` (paisaje con paralaje y rayos), `plano` (personaje y escena plana), y vuelta a `tipografico` con karaoke.
     Entre pieles, un destello del flujo: entrevista → guion → voz → storyboard → render, con sus compuertas.
  5. **El mismo proyecto, dos formatos (45–50 s)**: el cuadro se parte en 16:9 y 9:16 a la vez.
  6. **Cierre (50–58 s)**: firma JP, nombre del repo y llamada a la acción.
- **Base visual**: sistema JP (ink, papel, un solo rojo, Anton/Geist/Geist Mono, radio 0, líneas finas). Las pieles de
  otros estilos rompen la paleta a propósito; el rojo JP y el rótulo de bloque las enmarcan.

## Qué se reutiliza
- Sistema de diseño `sistemas-diseno/jp` (importado sin retratos, clip de gestos ni mp4 de la firma).
- Plantillas de `estilos/*/plantilla/escena1` como punto de partida de cada piel.
- Kit `nucleo/kit/` (foco, ui, collage, capas, armazón).

## Referencias
- `sistemas-diseno/jp/activos/guia-movimiento.html` y `trazos-firma.ts` para la firma.
- Las plantillas de cada estilo en `estilos/`.

## Notas de la entrevista
- Audiencia: creadores con IA. Perfil: promo-lanzamiento. Formatos 16:9 + 9:16. Duración 45–60 s. Idioma: español.
- Versatilidad: misma idea, varios estilos. Estilo base: tipográfico + JP.
- Sin fotos ni clips. Voz ElevenLabs (la persona genera el mp3 con el guion). Música sintetizada. Subtítulos solo en archivo.
- Modo interactivo: se para en cada compuerta.
