#!/usr/bin/env bash
# Storyboard de un video: renderiza los cuadros de <video>/storyboard/cuadros.tsv (segundo global · número de escena · frase)
# y arma hojas con el tiempo y la frase debajo de cada cuadro. El inicio de cada escena se lee de su escena.js (t0).
#   bash nucleo/tools/storyboard.sh videos/001-ejemplo   → <video>/storyboard/storyboard-1.jpg, -2.jpg… (14 cuadros por hoja)
set -euo pipefail
RAIZ="$(cd "$(dirname "$0")/../.." && pwd)"
video="${1:?falta la carpeta del video, p. ej. videos/001-ejemplo}"
V="$RAIZ/$video"; SB="$V/storyboard"
# fuente de los rótulos: la primera que exista en este sistema (JP_FUENTE_ROTULO para fijarla)
FUENTE="${JP_FUENTE_ROTULO:-}"
for f in "C:/Windows/Fonts/arialbd.ttf" "/System/Library/Fonts/Supplemental/Arial Bold.ttf" "/Library/Fonts/Arial Bold.ttf" \
  "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf"; do
  if [ -z "$FUENTE" ] && [ -f "$f" ]; then FUENTE="$f"; fi
done
[ -n "$FUENTE" ] || { echo "no encontré una fuente TTF para los rótulos; define JP_FUENTE_ROTULO"; exit 1; }
FUENTE_FF="${FUENTE//:/\\:}"
t0de() { grep -oE 't0: *[0-9.]+' "$V/escenas/escena$1/escena.js" | head -1 | grep -oE '[0-9.]+$'; }
cd "$SB"; mkdir -p cuadros; rm -f cuadros/*.png
# 1) un render de stills por escena con todos sus tiempos
for e in $(tr -d '\r' < cuadros.tsv | cut -f2 | sort -un); do
  t0=$(t0de "$e")
  ts=$(tr -d '\r' < cuadros.tsv | awk -F'\t' -v e="$e" -v t0="$t0" '$2 == e { printf "%s%.2f", (n++ ? "," : ""), $1 - t0 }')
  node "$RAIZ/nucleo/render.mjs" --film "$video/escenas/escena$e" --stills "$ts" > /dev/null
done
# 2) cada cuadro con su rótulo
i=0; lista=()
while IFS=$'\t' read -r tg e frase; do
  i=$((i + 1)); loc=$(awk -v a="$tg" -v b="$(t0de "$e")" 'BEGIN { printf "%.2f", a - b }')
  src="$V/escenas/escena$e/out/stills/9x16_${loc}s.png"; out=$(printf "cuadros/%02d.png" "$i")
  printf "%02d · %ss · escena %s\n%s" "$i" "$tg" "$e" "$(echo "$frase" | fold -s -w 34)" > rotulo.txt
  ffmpeg -v error -y -i "$src" -vf "scale=360:640,pad=360:760:0:0:0x1E1830,drawtext=fontfile='$FUENTE_FF':textfile=rotulo.txt:fontcolor=0xFFF3C4:fontsize=19:line_spacing=6:x=14:y=652" "$out"
  lista+=("$out")
done < <(tr -d '\r' < cuadros.tsv)
rm -f rotulo.txt storyboard-*.jpg
for ((h = 0; h * 14 < ${#lista[@]}; h++)); do bash "$RAIZ/nucleo/tools/hoja.sh" "storyboard-$((h + 1)).jpg" 7 360 "${lista[@]:h*14:14}"; done
echo "storyboard: $i cuadros → $video/storyboard/"
