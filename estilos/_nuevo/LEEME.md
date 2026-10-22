# Crear un estilo nuevo

Un estilo es **cómo se ve** un video, independiente del tema. Se crea cuando la entrevista pide un look que no existe.

## Desde una referencia (video, imágenes o un sistema de diseño)
1. Guardar la referencia en `<video>/refs/` (no se versiona) y estudiarla: `bash nucleo/tools/ref-frames.sh <video>/refs/ref.mp4`.
2. Escribir `<video>/diseno/guia-estilo.md` siguiendo `nucleo/prompts/referencia.txt`: qué se toma (gramática) y qué NO (contenido, personajes, logos ajenos).
3. Lookdev: una escena de prueba con 3 stills; crítica hasta 8+. ⛔ Aprobación del usuario.
4. El estilo vive **dentro del video** mientras solo lo use ese video (`<video>/js/estilo.js`, cargado en lugar de `estilos/<id>/estilo.js`).

## Promoverlo a `estilos/` (cuando el segundo video lo quiere)
```
estilos/<id>/estilo.yaml   nombre, descripcion, metodos, fuentes
estilos/<id>/ESTILO.md     gramática, personajes, acabado y trampas del estilo (sin nada de un video concreto)
estilos/<id>/estilo.js     define window.ESTILO = { id, fuentes, fondo, listo, preparar(), acabado(o), pj(t) }
estilos/<id>/muestra.png   un cuadro representativo (la entrevista lo muestra al elegir estilo)
```
Si necesita código de dibujo nuevo y genérico, va a `nucleo/kit/` con su test (no en el estilo).
Fuentes: agregar el paquete `@fontsource/<fuente>` a `nucleo/package.json` y cargarlo con `FUENTES.cargar`.
