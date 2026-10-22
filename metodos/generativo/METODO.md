# Método · Generativo (experimental)

Los planos se generan con modelos de imagen o video y se montan sobre la voz. Sirve para looks que en código serían
carísimos (fotorrealismo, 3D, texturas orgánicas). Este método **delega** en el proveedor de IA que tenga el agente
(por ejemplo, el conector de Higgsfield, u otro configurado por el usuario).

Riesgo principal: la **consistencia** (la IA cambia el personaje en cada toma). Mitigación: hoja de referencia aprobada
en la fase de diseño y usarla como imagen de referencia en cada generación.

## Antes de empezar
- Confirmar con el usuario el proveedor, el presupuesto (créditos) y si cada generación necesita su aprobación.
- Guardar cada prompt y semilla en `<v>/generado/prompts.md` (reproducibilidad).

## brief · investigacion · guion · voz · tiempos
Igual que en `canvas`.

## diseno
Hoja de referencia del personaje y del mundo (imágenes aprobadas en `<v>/diseno/`). Es la «fuente de verdad» de las generaciones.

## storyboard
Un cuadro generado por plano (imagen), sobre el tiempo de la voz. ⛔ Se aprueba antes de generar video (es lo caro).

## animatic
Los cuadros del storyboard como imágenes fijas sobre la voz (`ffmpeg` con duraciones de `montaje/escenas.txt`).

## produccion
Generar los clips por plano a partir de los cuadros aprobados. Guardar en `<v>/generado/clips/`. Revisar cada clip contra la
hoja de referencia; regenerar los que rompan la identidad. Encima se pueden sumar textos y gráficos con el método `canvas`.

## sonido · render
Montaje con ffmpeg (concat de clips en el orden de `escenas.txt`) + `nucleo/tools/mezcla.sh`.

## subtitulos · entrega · ajustes
Igual que en `canvas`. Declarar en `publicacion.md` que el video usa contenido generado por IA (cada plataforma tiene su etiqueta).
