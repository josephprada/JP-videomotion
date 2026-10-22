#!/usr/bin/env bash
# Material para el bucle de crítica. Uso:
#   bash nucleo/tools/critica.sh videos/001-ejemplo/escenas/escena1/out/final.mp4 [segundo_de_la_tira]
# Produce junto al video: contacto.png · tira.png · telefono.png · costura_loop.mp4
# Después: abrir las tres imágenes y seguir nucleo/prompts/critica.txt
set -euo pipefail
v="$1"; t="${2:-2.0}"
d="$(dirname "$v")"
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$v")
techo() { awk -v x="$1" 'BEGIN { n = int(x); if (n < x) n++; if (n < 1) n = 1; print n }'; }
filas=$(techo "$(awk -v d="$dur" 'BEGIN { print d * 2 / 6 }')")
filas_tel=$(techo "$(awk -v d="$dur" 'BEGIN { print d / 5 }')")
desde=$(awk -v t="$t" 'BEGIN { print (t > 0.1 ? t - 0.1 : 0) }')
# hoja de contacto: 2 cuadros por segundo, 6 por fila
ffmpeg -v error -y -i "$v" -vf "fps=2,scale=270:-1,tile=6x$filas" -frames:v 1 "$d/contacto.png"
# tira: 12 cuadros consecutivos alrededor de una acción rápida (para cazar saltos y solapes)
ffmpeg -v error -y -ss "$desde" -i "$v" -vf "scale=320:-1,tile=12x1" -frames:v 1 "$d/tira.png"
# prueba de teléfono: cómo se lee a 360 px de ancho
ffmpeg -v error -y -i "$v" -vf "fps=1,scale=360:-1,tile=5x$filas_tel" -frames:v 1 "$d/telefono.png"
# costura del loop: dos pasadas seguidas
ffmpeg -v error -y -stream_loop 1 -i "$v" -c copy "$d/costura_loop.mp4"
echo "contacto.png tira.png telefono.png costura_loop.mp4 → $d"
