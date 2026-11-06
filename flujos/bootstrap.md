# Flujo · Bootstrap (primera vez)

Deja JP-videomotion listo en la máquina de la persona. Se corre una vez por clon, o cuando la persona pide reconfigurar.
Tono: natural, cálido y simple. **Una pregunta (o un bloque corto) a la vez; esperar la respuesta antes de seguir.**
Nunca instalar software del sistema sin preguntar.

## 0. Clonar (si te pasaron solo el enlace)
1. Preguntar en qué carpeta lo quiere (sugerir una, p. ej. `~/proyectos/JP-videomotion`). Si la carpeta existe y no está vacía, avisar y no sobrescribir.
2. `git clone <enlace> <carpeta>` y trabajar desde esa carpeta de aquí en adelante.

## 1. Preparar
1. `node --version`. Si no hay Node ≥ 20, explicar cómo instalarlo en su sistema operativo y esperar.
2. `cd nucleo && npm install && npm test && cd ..`. Si los tests fallan, parar e informar con la salida.
3. `node nucleo/jp.mjs agente`. Si no detecta el agente, declararse: `node nucleo/jp.mjs agente --id <tu-nombre-de-agente>`.
   (Queda en `.jp/local.yaml`, que no se versiona: cada persona puede usar un agente distinto.)
4. Si ya existe `jp.config.yaml`: decir que ya está configurado y preguntar si quiere reconfigurar. Si no, terminar aquí.

## 2. La primera pregunta
> «¡Hola! JP-videomotion ya está descargado. ¿Quieres **empezar con todo por defecto** (sirve para cualquier tipo de video
> y te pregunto lo necesario en cada uno) o prefieres **configurarlo para tus casos de uso** (son 7 preguntas rápidas)?»

<!-- mantenimiento: el número de esta pregunta debe coincidir con las preguntas del paso 3 -->


- **Por defecto** → escribir `jp.config.yaml` con solo `version`, `configurado` (fecha) e `idioma_conversacion` (el idioma
  en que te escribe la persona). Todo lo demás sale de `config/defecto.yaml`. Saltar al paso 4.
- **Configurar** → paso 3.

## 3. Configurar (una pregunta a la vez, con opciones y una recomendada)
1. **Usos**: «¿Qué tipo de videos quieres hacer?» (varias): historias narradas · explicadores · promos de producto o marca ·
   tutoriales · de todo un poco. → `usos` (ids de `perfiles/`).
2. **Idioma**: «¿En qué idioma serán tus videos?» → `idioma_contenido` (y `idioma_conversacion` si quiere hablar en otro).
3. **Dónde publica**: TikTok/Reels/Shorts (vertical 9:16) · YouTube largo (16:9) · LinkedIn/X (1:1 o 16:9) · varios.
   → `video.plataformas` y `video.formatos`.
4. **Voz**: voz sintética (¿qué proveedor? p. ej. ElevenLabs o Fish Audio) · su propia voz · sin voz · depende del video. → `video.voz`, `voz.proveedor`.
5. **Subtítulos**: «En redes la mayoría ve sin sonido. ¿Subtítulos quemados por defecto?» quemados (recomendado para redes) ·
   solo archivo .srt · ambos · ninguno. → `video.subtitulos` (y `mayusculas` si quiere el estilo de redes en mayúsculas).
6. **Marca**: «¿Tienes una marca o sistema de diseño (colores, tipografías, logo)?» no · sí, en Claude Design · sí, en Figma ·
   sí, en un manual o archivo. Si sí: correr `flujos/sistema-diseno.md` ahora o dejarlo para el primer video (preguntar).
   → `video.sistema_diseno`.
7. **Ritmo**: «¿Cómo prefieres trabajar cada video?»
   - Reviso cada fase y me preguntas todo en cada video (recomendado) → `video.modo: interactivo`, `entrevista.preguntar_todo: true`
   - Reviso cada fase, pero pregúntame solo lo que no quedó configurado → `interactivo`, `preguntar_todo: false`
   - Que avance solo y me consulte únicamente lo indispensable (la voz y la entrega) → `automatico`, `preguntar_todo: false`

Además, sin preguntar, informar en una línea: los logos de terceros están **permitidos por defecto** con uso nominativo
y puede cambiarlo cuando quiera.

Escribir `jp.config.yaml` solo con lo que difiere de `config/defecto.yaml` (más `version` y `configurado`).
Mostrar el archivo y confirmar.

## 4. Revisar el equipo
`node nucleo/jp.mjs doctor`. Por cada requisito obligatorio que falte: explicar qué es, para qué sirve y el comando de su
sistema operativo; **preguntar** antes de instalarlo. Lo opcional (·) se menciona, sin insistir.

## 5. Prueba de humo
`node nucleo/render.mjs --film universos/_ejemplo --page hoja --stills 0` y **mirar** la imagen
(`universos/_ejemplo/out/stills/hoja_9x16_0.00s.png`). Mostrarla: «así se ve un personaje de ejemplo renderizado en tu máquina».

## 6. Repo propio (opcional)
Si el clon apunta al repo original, preguntar si quiere su propio repositorio (privado) para sus videos. Si sí: renombrar
el remoto (`git remote rename origin plantilla`) y agregar el suyo cuando lo tenga. Nunca hacer push sin que lo pida.

## 7. Cierre
Resumen en 4–6 líneas: qué quedó configurado, qué falta (si algo) y cómo empezar:
> «Cuando quieras, dime **"nuevo video"** y te hago unas preguntas para arrancar.»
**Abrir el agente en la carpeta del repo.** Si esta sesión se abrió en otra carpeta (por ejemplo, porque clonaste desde fuera),
el agente no cargó las instrucciones ni los atajos del repo (en Claude: las skills `/jp-*`). Comprobarlo comparando la carpeta
de trabajo de la sesión con la del repo; si no coinciden, decirlo con claridad:
> «Para trabajar con todos los atajos, cierra esta sesión y abre tu agente **dentro de** `<carpeta-del-repo>`. Ahí dime "nuevo video".»
Si coinciden, mencionar los atajos que tenga el agente (ver `CLAUDE.md` para Claude).
