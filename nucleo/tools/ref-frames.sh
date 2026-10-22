#!/usr/bin/env bash
# Estudia una referencia: un cuadro cada 0,5 s + hojas de contacto. Uso:
#   bash nucleo/tools/ref-frames.sh videos/001-ejemplo/escenas/escena1/refs/ref.mp4
# Luego: escribir <video>/diseno/guia-estilo.md (gramática, nunca contenido) y storyboard/storyboard.md. Ver nucleo/prompts/referencia.txt
set -euo pipefail
v="$1"; d="$(dirname "$v")/frames"
mkdir -p "$d"
ffmpeg -v error -y -i "$v" -vf "fps=2,scale=480:-1" "$d/f_%04d.png"
ffmpeg -v error -y -i "$v" -vf "fps=1/2,scale=320:-1,tile=6x7" "$d/contact_%02d.png"
ffmpeg -v error -y -i "$v" -vf "select='gt(scene,0.3)',metadata=print:file=$d/cortes.txt" -an -f null - || true
echo "$(ls "$d"/f_*.png | wc -l) cuadros, cortes en $d/cortes.txt"
