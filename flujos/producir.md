# Flujo · Producir un video (el jefe de obra)

Este flujo no sabe qué tipo de video se hace: lo lee del perfil. Sirve para avanzar y para **retomar** un video a medias.

## El ciclo
1. `node nucleo/jp.mjs estado <video>` → fase actual, si tiene compuerta y **qué leer**.
2. Leer, en este orden (lo de abajo manda sobre lo de arriba en caso de conflicto, salvo el contrato):
   1. `nucleo/CONTRATO.md` (siempre manda)
   2. `perfiles/libre/FASES.md § <fase>` — qué se hace
   3. `perfiles/<perfil>/PERFIL.md` — lo que el perfil cambia
   4. `metodos/<método>/METODO.md § <fase>` — cómo se hace
   5. `estilos/<estilo>/ESTILO.md` — cómo se ve
   6. `sistemas-diseno/<id>/SISTEMA.md` — la marca (si hay)
   7. `LEEME.md` del video — decisiones propias del video
3. Hacer la fase. Antes de mostrar cualquier imagen o video: **mirarlo uno mismo** y pasar la crítica (`nucleo/prompts/critica.txt`).
4. Cerrar la fase:
   - Con ⛔ compuerta: mostrar el resultado de forma concreta (qué se hizo, qué mirar, qué decidir) y **esperar**.
     Cuando la persona aprueba: `node nucleo/jp.mjs completar <video> <fase> --nota "<lo aprobado>"`.
     Si pide cambios: se hacen y se vuelve a mostrar (la fase no se completa).
   - Sin compuerta: `completar` y seguir con la siguiente.
5. Volver a 1.

## Volver atrás
Si la persona cambia algo de una fase ya completada (p. ej. el guion en pleno storyboard):
`node nucleo/jp.mjs reabrir <video> <fase> --nota "<por qué>"`. Descompleta esa fase y todas las siguientes; las que no
cambien de verdad se vuelven a completar rápido, pero se revisan.

## Modo automático
Solo paran las compuertas `siempre` (voz y entrega, y la ronda de ajustes). Igual se registra todo en el historial y la
crítica 8+ sigue siendo obligatoria: lo automático es no esperar, no saltarse la calidad.

## Al terminar
- Actualizar `LEEME.md` del video (checklist «Antes de publicar»).
- Si algo del video lo va a necesitar un segundo video (personaje, estilo, sistema, utilidad de código), proponer
  **promoverlo** (`universos/`, `estilos/`, `sistemas-diseno/`, `nucleo/kit/`) y esperar el OK.
- Trampas nuevas que no dependan del estilo → `nucleo/TRAMPAS.md`; las del estilo → su `ESTILO.md`.
- Decisiones que afectan a todo el repo (no solo a un video) → `DECISIONES.md`.
