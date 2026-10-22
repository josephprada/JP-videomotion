#!/usr/bin/env bash
# Junta PNG sueltos en una hoja (ffmpeg en Windows no admite glob). Uso:
#   bash nucleo/tools/hoja.sh salida.png columnas ancho img1.png img2.png ...
set -euo pipefail
out="$1"; cols="$2"; w="$3"; shift 3
tmp=$(mktemp -d); i=0
for f in "$@"; do cp "$f" "$tmp/$(printf %03d $i).png"; i=$((i+1)); done
rows=$(( (i + cols - 1) / cols ))
ffmpeg -v error -y -framerate 1 -i "$tmp/%03d.png" -vf "scale=$w:-1,tile=${cols}x${rows}" -frames:v 1 "$out"
rm -rf "$tmp"
