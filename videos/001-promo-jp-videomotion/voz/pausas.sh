#!/usr/bin/env bash
# Regenera voz/narracion-completa.wav desde la toma de ElevenLabs: +0,6 s de silencio en las pausas entre los seis estilos.
# (Los .wav no se versionan; este script es la receta exacta.)  bash videos/001-promo-jp-videomotion/voz/pausas.sh
set -euo pipefail
cd "$(dirname "$0")"
SRC="ElevenLabs_2026-11-12T20_56_31_Roberto - Rich, Clear and Enunciated_pvc_s50_sim75_v4.mp3"
CORTES=(16.49 18.53 19.57 22.00 23.18 24.92); PAUSA=0.6
fc=""; lab=""; ini=0; i=0
for c in "${CORTES[@]}" fin; do
  if [ "$c" = fin ]; then fc+="[0:a]atrim=start=$ini,asetpts=PTS-STARTPTS[s$i];"; lab+="[s$i]"
  else fc+="[0:a]atrim=start=$ini:end=$c,asetpts=PTS-STARTPTS[s$i];anullsrc=r=44100:cl=mono,atrim=duration=$PAUSA[z$i];"; lab+="[s$i][z$i]"; ini=$c; fi
  i=$((i + 1))
done
n=$(( ${#CORTES[@]} * 2 + 1 ))
ffmpeg -v error -y -i "$SRC" -filter_complex "${fc}${lab}concat=n=$n:v=0:a=1[o]" -map "[o]" -ar 44100 -ac 1 narracion-completa.wav
ffprobe -v error -show_entries format=duration -of csv=p=0 narracion-completa.wav
