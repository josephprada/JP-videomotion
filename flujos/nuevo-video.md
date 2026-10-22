# Flujo · Nuevo video (la entrevista)

Cada video se trabaja por separado y empieza con esta entrevista. Su resultado es la carpeta del video con `video.yaml`
y `brief.md` llenos; después manda `flujos/producir.md`.

Reglas de la entrevista:
- **Bloques cortos, en orden; esperar la respuesta de cada bloque.** Nada de 15 preguntas de golpe.
- Cada pregunta con opciones concretas y una **recomendada** (según la respuesta anterior y `jp.config.yaml`).
- Si `entrevista.preguntar_todo: false`, saltar lo que ya tenga valor en la configuración y decir qué se asumió.
- Nunca suponer una respuesta. Si la persona dice «lo que tú creas», proponer y pedir confirmación.

## 0. Antes de preguntar
`node nucleo/jp.mjs catalogo --json`: perfiles, estilos, métodos, sistemas de diseño, universos y videos existentes.
Si hay videos a medias, preguntar primero: «¿Seguimos con *<título>* (va en *<fase>*) o empezamos uno nuevo?»
(seguir uno existente → `flujos/producir.md`).

## Bloque 1 · De qué se trata
1. **¿De qué será el video?** Tema o idea, en sus palabras. Si no tiene tema: ofrecer 4–6 propuestas con gancho y ángulo
   (investigar si hace falta), una recomendada.
2. **¿Para qué?** Entretener · enseñar · vender o promocionar · posicionar una marca personal · otro.
3. **¿Para quién?** Audiencia en una frase.
4. **¿Afirma hechos reales** (cifras, historia, empresas, personas)? → `datos_reales` (si sí, habrá investigación con fuentes).

Con esto, **sugerir el perfil** (`historia-narrada`, `explicador`, `promo-lanzamiento`, `tutorial` o `libre`) explicando por qué en una línea.

## Bloque 2 · Dónde y cuánto
1. **Plataformas** (varias) y **formatos** (9:16 vertical para redes; 16:9 para YouTube largo; 1:1).
2. **Duración** objetivo (sugerir según plataforma y perfil: 30–60 s redes, 15–45 s promo, 3–10 min largo).
3. **Idioma** del contenido (sugerir el de `jp.config.yaml`).

## Bloque 3 · Qué se reutiliza
Mostrar lo que existe y preguntar qué se toma, si algo:
- Personajes o escenarios de un **universo** o de un video anterior.
- El **estilo** de un video anterior (mismo look, paleta nueva o igual).
- La **voz** (mismo narrador/proveedor), la **música** o los efectos de un video anterior.
- Escenas o recursos concretos (logos, mapas, gráficos).
→ `reutiliza.de` y, si no habrá diseño nuevo, `reutiliza.diseno_completo: true`.

## Bloque 4 · Cómo se ve
1. **Estilo**: los de `estilos/` (describir cada uno en una línea; mostrar `muestra.png` si existe) · el de un video anterior ·
   **uno nuevo** a partir de una referencia (video, imágenes, una cuenta que le guste) → se crea en la fase de diseño
   (`estilos/_nuevo/LEEME.md`).
2. **Sistema de diseño / marca**: ninguno · uno de `sistemas-diseno/` · **importar uno**: desde Claude Design, Figma, un manual
   de marca o a mano (→ `flujos/sistema-diseno.md`, ahora mismo). Si hay sistema, manda en colores, tipografías y logos.
3. **Logos de terceros**: permitidos por defecto; preguntar solo si el tema lo hace delicado (salud, política, menores) o si la
   persona quiere evitarlos. → `marcas_terceros`.

## Bloque 5 · Cómo se hace
1. **Método**: `canvas` (estable; animación en código, máximo control y consistencia) · `hyperframes` (experimental; tipografía
   cinética y promos) · `generativo` (experimental; IA de imagen/video, looks fotorrealistas, cuesta créditos). Recomendar
   `canvas` salvo que el estilo lo pida.
2. **Voz**: sintética (proveedor) · su voz grabada · sin voz (solo texto en pantalla y música).
3. **Música**: sintetizada en código (sin licencias) · una pista que entrega · sin música.
4. **Subtítulos** (preguntar siempre que haya voz, sobre todo si es para redes): «La mayoría ve en redes sin sonido.
   ¿Los quemamos en el video?» quemados (recomendado para redes) · solo archivo .srt para subir · ambos · ninguno.
   Si quemados: ¿estilo redes en MAYÚSCULAS y pocas palabras por bloque, o frases normales?

## Bloque 6 · Ritmo de trabajo
Interactivo (aprueba cada fase; recomendado para el primer video o un estilo nuevo) · automático (solo para en la voz y la entrega).

## Cierre de la entrevista
1. Resumen en una tabla corta (perfil, estilo, método, sistema, idioma, formatos, duración, voz, música, subtítulos, reutiliza, modo).
2. Crear la carpeta:
   ```bash
   node nucleo/jp.mjs nuevo <slug> --titulo "…" --perfil … --estilo … --metodo … --idioma … --formato 9x16[,16x9] \
     --duracion "…" --plataformas tiktok,… --voz tts|humana|ninguna --musica sintetizada|pista|ninguna \
     --subtitulos quemados|archivo|ambos|ninguno --datos-reales si|no [--sistema-diseno <id>] [--reutiliza a,b] --modo interactivo|automatico
   ```
   Ajustar en `video.yaml` lo que el CLI no cubre (p. ej. `subtitulos.mayusculas`, `reutiliza.diseno_completo`).
3. Escribir `brief.md` con lo conversado y las decisiones con su razón en la tabla de `LEEME.md` del video.
4. ⛔ Mostrar y esperar el OK (compuerta del brief). Luego `node nucleo/jp.mjs completar <video> brief` y seguir con `flujos/producir.md`.
