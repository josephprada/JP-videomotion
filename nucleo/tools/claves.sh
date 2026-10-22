#!/usr/bin/env bash
# Renderiza los fotogramas clave de una escena y los deja en <video>/entregables/<escena>/fotogramas-clave/
# con su hoja de contacto. Uso (desde la raíz del repo):
#   bash nucleo/tools/claves.sh videos/001-ejemplo/escenas/escena3 e3 0.1,1.2,2.2
set -euo pipefail
RAIZ="$(cd "$(dirname "$0")/../.." && pwd)"
film="$1"; pref="$2"; tiempos="$3"
escena="$(basename "$film")"
dir="$RAIZ/$(dirname "$(dirname "$film")")/entregables/$escena/fotogramas-clave"
mkdir -p "$dir"
node "$RAIZ/nucleo/render.mjs" --film "$film" --stills "$tiempos" > /dev/null
lista=()
IFS=',' read -ra ts <<< "$tiempos"
for t in "${ts[@]}"; do
  f=$(printf "%.2f" "$t")
  cp "$RAIZ/$film/out/stills/9x16_${f}s.png" "$dir/${pref}_${f}s.png"
  lista+=("$dir/${pref}_${f}s.png")
done
n=${#lista[@]}; cols=$(( n < 5 ? n : 5 ))
"$RAIZ/nucleo/tools/hoja.sh" "$dir/hoja-claves.png" "$cols" 360 "${lista[@]}"
echo "$escena: $n fotogramas"
