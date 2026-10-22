#!/usr/bin/env bash
# Tiempos de la narración de un video: lo que necesitan el storyboard, las tablas T de las escenas y los subtítulos.
#   bash nucleo/tools/tiempos.sh videos/001-ejemplo
# Lee <video>/voz/narracion-completa.(mp3|wav) y el idioma de <video>/video.yaml; escribe en <video>/voz/:
#   frases.srt      subtítulos por frase (revisión del texto)
#   palabras.srt    una palabra por línea con su tiempo (tablas T y subtítulos automáticos)
#   silencios.txt   pausas de la voz: inicio, fin y corte sugerido (centro de la pausa, redondeado a 1/60 s)
# Ojo: los tiempos de whisper llegan ~0,1 s tarde; los golpes visuales van un pelo antes de la palabra.
set -euo pipefail
RAIZ="$(cd "$(dirname "$0")/../.." && pwd)"
video="${1:?falta la carpeta del video, p. ej. videos/001-ejemplo}"
V="$RAIZ/$video/voz"
NAR="$(ls "$V"/narracion-completa.* 2>/dev/null | head -1)"
[ -n "$NAR" ] || { echo "no hay $V/narracion-completa.mp3"; exit 1; }
IDIOMA="$(sed -n 's/^idioma: *\([a-z][a-z]\).*/\1/p' "$RAIZ/$video/video.yaml" 2>/dev/null | head -1)"
IDIOMA="${IDIOMA:-es}"
MODELO="${WHISPER_MODEL:-$HOME/.cache/whisper/ggml-small.bin}"
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
ffmpeg -v error -y -i "$NAR" -ar 16000 -ac 1 "$tmp/v.wav"
whisper-cli -m "$MODELO" -f "$tmp/v.wav" -l "$IDIOMA" -osrt -of "$V/frases" > /dev/null 2>&1
whisper-cli -m "$MODELO" -f "$tmp/v.wav" -l "$IDIOMA" -ml 1 -sow -osrt -of "$V/palabras" > /dev/null 2>&1
ffmpeg -hide_banner -nostats -i "$tmp/v.wav" -af silencedetect=noise=-35dB:d=0.25 -f null - 2>&1 \
  | awk '/silence_start/ { s = $NF } /silence_end/ { printf "%.3f\t%.3f\tcorte=%.4f\n", s, $5, int((s + $5) / 2 * 60 + 0.5) / 60 }' > "$V/silencios.txt"
dur="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$NAR")"
echo "voz: ${dur}s · idioma $IDIOMA · $(grep -c -- '-->' "$V/palabras.srt") palabras · $(wc -l < "$V/silencios.txt") pausas → $video/voz/"
