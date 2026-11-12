#!/usr/bin/env bash
# El mismo cuadro renderizado dos veces (dos procesos, raster por software) debe dar el mismo hash. Uso:
#   bash nucleo/tools/determinismo.sh videos/001-ejemplo/escenas/escena3 2.5   (película desde la raíz del repo)
set -euo pipefail
RAIZ="$(cd "$(dirname "$0")/../.." && pwd)"
film="$1"; t="${2:-1.0}"
out="$RAIZ/$film/out/stills"
node "$RAIZ/nucleo/render.mjs" --film "$film" --stills "$t" --raster software >/dev/null && a=$(md5sum "$out"/9x16_*"$(printf %.2f "$t")"s.png | cut -d' ' -f1)
node "$RAIZ/nucleo/render.mjs" --film "$film" --stills "$t" --raster software >/dev/null && b=$(md5sum "$out"/9x16_*"$(printf %.2f "$t")"s.png | cut -d' ' -f1)
if [ "$a" = "$b" ]; then echo "determinista ✔ ($a)"; else echo "NO determinista ✖ ($a ≠ $b)"; exit 1; fi
