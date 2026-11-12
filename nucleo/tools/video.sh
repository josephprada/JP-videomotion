#!/usr/bin/env bash
# Renderiza todas las escenas de un video y las une con su audio global (<video>/montaje/).
#   bash nucleo/tools/video.sh videos/001-ejemplo animatic [fmt]   → media resolución, 30 fps, sin desenfoque (revisión de ritmo)
#   bash nucleo/tools/video.sh videos/001-ejemplo final [fmt]      → resolución completa, 60 fps, --sub 4, raster exacto (software)
# fmt: 9x16 (por defecto) | 1x1 | 16x9, desde la misma línea de tiempo.
# El orden de las escenas sale de <video>/montaje/escenas.txt (una carpeta de <video>/escenas/ por línea).
# Escenas en paralelo: 3 (JP_PARALELO para cambiarlo). Salida: <video>/montaje/out/<modo>[_fmt].mp4
set -euo pipefail
RAIZ="$(cd "$(dirname "$0")/../.." && pwd)"
video="${1:?falta la carpeta del video, p. ej. videos/001-ejemplo}"; modo="${2:-animatic}"; fmt="${3:-9x16}"
V="$RAIZ/$video"; M="$V/montaje"
nombre="$modo"; [ "$fmt" = 9x16 ] || nombre="${modo}_$fmt"
mapfile -t ESCENAS < <(tr -d '\r' < "$M/escenas.txt" | grep -v '^\s*$')
if [ "$modo" = final ]; then opts=(--fps 60 --sub 4 --raster software); else opts=(--fps 30 --scale 0.5 --crf 20); fi
mkdir -p "$M/out"
pids=()
for e in "${ESCENAS[@]}"; do
  node "$RAIZ/nucleo/render.mjs" --film "$video/escenas/$e" "${opts[@]}" --fmt "$fmt" --out "$nombre" > "$M/out/log_${e}_$nombre.txt" 2>&1 &
  pids+=($!)
  if [ ${#pids[@]} -ge "${JP_PARALELO:-3}" ]; then wait "${pids[0]}"; pids=("${pids[@]:1}"); fi
done
wait
lista="$M/out/lista_$nombre.txt"; : > "$lista"
for e in "${ESCENAS[@]}"; do echo "file '../../escenas/$e/out/$nombre.mp4'" >> "$lista"; done
ffmpeg -v error -y -f concat -safe 0 -i "$lista" -c copy "$M/out/${nombre}_mudo.mp4"
if [ -f "$M/audio/mezcla.wav" ]; then
  ffmpeg -v error -y -i "$M/out/${nombre}_mudo.mp4" -i "$M/audio/mezcla.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest "$M/out/$nombre.mp4"
fi
ffprobe -v error -show_entries format=duration -of csv=p=0 "$M/out/${nombre}_mudo.mp4"
