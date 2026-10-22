#!/usr/bin/env bash
# Mezcla de un video: voz (si hay) + música (ducking bajo la voz) + efectos → −14 LUFS en <video>/montaje/audio/mezcla.wav
#   bash nucleo/tools/mezcla.sh videos/001-ejemplo
# Antes corre <video>/montaje/audio/sintesis.cjs (música y efectos sintetizados del video).
# Pista entregada: ponla como montaje/audio/musica.wav y deja que sintesis.cjs escriba solo sfx.wav.
set -euo pipefail
RAIZ="$(cd "$(dirname "$0")/../.." && pwd)"
video="${1:?falta la carpeta del video, p. ej. videos/001-ejemplo}"
cd "$RAIZ/$video/montaje/audio"
if [ -f sintesis.cjs ]; then node sintesis.cjs; fi
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 musica.wav)
FADE=$(awk -v d="$DUR" 'BEGIN { print d - 0.6 }')
NAR="$(ls ../../voz/narracion-completa.* 2>/dev/null | head -1 || true)"
if [ -n "$NAR" ]; then
  ffmpeg -v error -y -i "$NAR" -af "aresample=48000,pan=stereo|c0=c0|c1=c0,apad=whole_dur=$DUR" -t "$DUR" -ar 48000 narracion.wav
  ffmpeg -v error -y -i narracion.wav -i musica.wav -i sfx.wav -filter_complex \
    "[0:a]volume=1.0,asplit=2[voz][llave];[1:a]volume=0.55[mus];[mus][llave]sidechaincompress=threshold=0.04:ratio=6:attack=20:release=250[musd];[2:a]volume=0.8[fx];[voz][musd][fx]amix=inputs=3:normalize=0,afade=t=out:st=$FADE:d=0.6,atrim=0:$DUR" \
    -ar 48000 premezcla.wav
else
  ffmpeg -v error -y -i musica.wav -i sfx.wav -filter_complex \
    "[0:a]volume=0.8[mus];[1:a]volume=0.8[fx];[mus][fx]amix=inputs=2:normalize=0,afade=t=out:st=$FADE:d=0.6,atrim=0:$DUR" \
    -ar 48000 premezcla.wav
fi
J=$(ffmpeg -hide_banner -nostats -i premezcla.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p')
v() { echo "$J" | grep "\"$1\"" | sed -E 's/.*: "([^"]+)".*/\1/'; }
ffmpeg -v error -y -i premezcla.wav -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(v input_i):measured_TP=$(v input_tp):measured_LRA=$(v input_lra):measured_thresh=$(v input_thresh):offset=$(v target_offset):linear=true,aresample=48000" -ar 48000 mezcla.wav
ffmpeg -hide_banner -nostats -i mezcla.wav -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+I:|Peak:" | head -2
