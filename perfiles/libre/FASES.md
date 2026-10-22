# Fases por defecto

Qué se hace en cada fase, sin importar el método. El **cómo** con herramientas concretas está en
`metodos/<método>/METODO.md` bajo la misma sección. Un perfil hijo puede ampliar una fase en su `PERFIL.md`.

Reglas comunes a todas las fases:
- Antes de empezar: `node nucleo/jp.mjs estado <video>` (dice la fase actual y qué leer).
- Al terminar: si la fase tiene ⛔ compuerta, mostrar el resultado y **esperar la aprobación**. Recién entonces
  `node nucleo/jp.mjs completar <video> <fase> --nota "…"`. Sin compuerta: completar y seguir.
- Si el usuario pide volver atrás: `node nucleo/jp.mjs reabrir <video> <fase>` (descompleta lo que venía después).
- Toda decisión del video con su razón va a la tabla de decisiones de `LEEME.md` del video.

## brief
Lo produce la entrevista (`flujos/nuevo-video.md`). Deja `video.yaml` lleno y `brief.md` con: la idea en una frase,
objetivo, audiencia, plataformas, qué debe sentir quien lo ve al final, qué se reutiliza y las restricciones.
⛔ Mostrar el resumen y esperar el OK.

## investigacion
Solo si el video afirma hechos reales (`datos_reales: true`).
- Cada dato con su fuente (enlace y fecha de consulta). Preferir fuentes primarias.
- Lo que no se pueda verificar va a «Datos descartados» con la razón. **Nunca entra al video.**
- Señalar los datos que pueden cambiar (cifras «actuales», cargos) para reconfirmarlos antes de publicar.

## guion
Con la plantilla que trajo el perfil (`guion.md`). Siempre:
- La idea en una frase y el ángulo (lo que da la vuelta a lo que el público cree).
- Texto de la narración (si hay voz) o de los rótulos (si no hay), con la duración objetivo.
- Guion técnico: por escena, qué se ve, texto en pantalla y sonido.
- Títulos candidatos para publicar.
⛔ Se itera con el usuario hasta aprobarlo.

## voz
Según `voz` en `video.yaml`:
- `tts`: escribir el prompt para el proveedor de voz (`config` → `voz.proveedor`) en `guion.md`. Si el agente tiene acceso
  directo a un generador de voz y el usuario lo autoriza, puede generarla; si no, el usuario la genera y la entrega.
- `humana`: guía de grabación (ritmo, pausas, énfasis por tramo).
- Guardar la toma elegida como `voz/narracion-completa.mp3` (o `.wav`).
⛔ Siempre (también en modo automático): la voz la aprueba una persona.

## tiempos
`bash nucleo/tools/tiempos.sh <video>` → `palabras.srt`, `frases.srt`, `silencios.txt`.
Los cortes de escena caen en las pausas; escribir `montaje/escenas.txt`. Revisar palabras que whisper oyó distinto.

## diseno
El look del video, a partir del estilo (`estilos/<estilo>/ESTILO.md`) y, si hay, del sistema de diseño
(`sistemas-diseno/<id>/SISTEMA.md`), que manda en colores, tipografías y logos.
- `diseno/guia-estilo.md`: paleta, tipografía, textura, cámara, cómo entra y sale el texto, prohibidos.
- Hoja de modelo de cada personaje nuevo y de los escenarios (`diseno/personajes.html`), renderizada y revisada.
- Si se reutiliza de otro video o universo, se nombra la fuente y se respeta su bloqueo de identidad.
⛔ Aprobación del look y de los personajes nuevos.

## storyboard
Unos 3 cuadros por escena, sincronizados con el tiempo global, en `storyboard/cuadros.tsv`, y las hojas.
`storyboard/storyboard.md`: por escena, intención, planos y golpes. Rondas de crítica antes de mostrar.
⛔ Revisión y ajustes.

## animatic
Video completo a media resolución con la voz sola (o la música provisional). Se revisa el **ritmo**, no el pulido.
⛔ Aprobación del ritmo.

## produccion
Cada escena al detalle. Antes: leer `nucleo/TRAMPAS.md` y las trampas del estilo.
Bucle de crítica por escena (`nucleo/prompts/critica.txt`) hasta 8+, registrado en `critica.md`.

## sonido
Música por tramos del relato (un silencio antes del golpe principal vale más que cualquier efecto) y efectos sobre
las palabras clave. Mezcla a −14 LUFS. Medir por tramo y dejar que el usuario apruebe de oído en la entrega.

## render
Verificar determinismo en 2 escenas y renderizar el final en segundo plano. Un formato por cada entrada de `formatos`.

## subtitulos
Según `subtitulos.modo`:
- `quemados`: subtítulos dentro del video (lo normal en redes: la mayoría ve sin sonido).
- `archivo`: solo `.srt` para subir a la plataforma.
- `ambos`: los dos.
`node nucleo/jp.mjs subtitulos <video>` (`--quemar` para quemarlos). Revisar que no tapen nada clave
(zona segura) y que las palabras coincidan con el guion.

## entrega
`entregables/final/`: el video final (subtitulado si aplica), `poster.png` (el cuadro que resume el video),
`contacto.png`, `subtitulos.srt` si aplica, `publicacion.md` (títulos, descripción, hashtags por plataforma) y
`NOTAS.md` (qué mejorarías). Commit. ⛔ El usuario lo ve completo.

## ajustes
Diagnosticar mirando la secuencia (no solo el cuadro), corregir, rerenderizar solo las escenas tocadas y volver a unir.
⛔ Se repite hasta «todo correcto». Al cerrar: actualizar `LEEME.md` del video (estado, checklist antes de publicar).
