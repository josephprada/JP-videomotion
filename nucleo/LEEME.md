# Núcleo

El motor de JP-videomotion. Genérico: no sabe de ningún video, universo, estilo ni marca.

```
CONTRATO.md          reglas que nadie puede romper (render determinista, un solo reloj, calidad antes de mostrar)
TRAMPAS.md           errores que ya costaron caro; se leen antes de producir
jp.mjs               CLI: doctor · agente · catalogo · nuevo · estado · completar · reabrir · subtitulos · servir
render.mjs           motor de render: --film --fps --sub --from --to --stills --fmt --scale --audio --page --out
navegador.mjs        busca Chrome/Chromium/Edge en Windows, macOS y Linux (o CHROME_PATH)
lib/fases.mjs        motor de fases: herencia de perfiles, saltos, compuertas y estado de cada video
lib/subtitulos.mjs   subtítulos automáticos: palabras con tiempo → bloques cortos → .srt y .ass
lib/agente.mjs       detecta el agente que trabaja en el repo
lib/motion.js        resortes de forma cerrada, track(), ruido con semilla, held(), shake, beat
lib/pixel.js         pc98ify: tramado Bayer 4×4 + paleta de 12 bits + píxel duro + líneas de escaneo
kit/armazon.js       armazón de una escena: lienzo, contrato seek/film, planos, fuentes, acabado, vista previa
kit/dibujo.js        primitivas planas (sin contorno, sombra de celda, luz de borde; tinta opcional)
kit/rig.js           rig humanoide: IK, luz y orden de piezas desde el «spec» de un personaje
kit/camara.js        cámara con parallax por capas
kit/luz.js           luz práctica: mapa de luz multiplicado + halos
kit/acabado.js       papel, grano y viñeta configurables
kit/comic.js         gramática de cómic: semitono, «en dos», onomatopeyas, globos, viñetas, pincel
kit/svgctx.js        contexto que graba SVG (exporta hojas vectoriales con el mismo código del canvas)
kit/fuentes.js       carga de fuentes de un estilo sin servidor; ready no llega antes que la fuente
kit/tipo.mjs         tipografía cinética: typefx con el reloj y las palabras de la voz (módulo ES)
lib/tipovoz.mjs      buscar palabras de la voz, paletas por roles desde la marca, tamaño por formato
lib/servidor.mjs     servidor estático local (render y vista previa); nunca sirve fuera del repo
vendor/typefx/       motor de tipografía cinética de Lorena Bordonaba (MIT): 12 efectos, fuentes y docs (ver su LEEME.md)
tools/               tiempos, storyboard, video, mezcla, critica, determinismo, claves, ref-frames, hoja, beats, svg2png
prompts/             critica.txt, referencia.txt, brief-plantilla.md, spec-estados.xml
```

## Uso (desde la raíz del repo)
```bash
cd nucleo && npm install && npm test && cd ..
node nucleo/jp.mjs doctor
node nucleo/render.mjs --film videos/001-x/escenas/escena1 --stills 0.5,1.5,2.5   # cuadros sueltos
node nucleo/render.mjs --film videos/001-x/escenas/escena1 --scale 0.5             # animatic de una escena
bash nucleo/tools/video.sh videos/001-x animatic                                    # video completo
```
Vista previa en vivo: `node nucleo/jp.mjs servir` y abrir la escena en el navegador (las escenas clásicas también abren con doble clic;
las del estilo tipográfico usan módulos ES y necesitan el servidor). El render levanta su propio servidor local (127.0.0.1).
