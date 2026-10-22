# Universos

Personajes, escenarios y utilería que comparten **varios videos** (una serie, un anfitrión recurrente, un mundo).
Un universo no sabe de ningún video. Se crea cuando el segundo video necesita lo que hizo el primero (regla de promoción).

```
universos/<id>/LEEME.md          qué es el universo, su tono y el bloqueo de identidad de cada personaje
universos/<id>/js/               código de personajes y escenarios (fuente única: lo que se anima es lo que está aquí)
universos/<id>/hoja.html         hoja de modelo que se renderiza desde ese código
```
Un video lo usa cargando `../../../../universos/<id>/js/<archivo>.js` en sus escenas (sin copiarlo) y anotándolo en
`video.yaml → reutiliza.de`.

`_ejemplo/` trae un personaje completo sobre el rig del núcleo, para usarlo como base de personajes nuevos.
