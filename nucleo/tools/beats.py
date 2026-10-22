# Mide la rejilla de una pista suministrada:  python tools/beats.py pista.wav > beats.json
# (Si la música se sintetiza en código, la rejilla sale de M.beat(i, bpm) y este paso sobra.)
# Requiere: pip install numpy librosa soundfile
import sys, json, numpy as np, librosa

y, sr = librosa.load(sys.argv[1], sr=None, mono=True)
tempo, frames = librosa.beat.beat_track(y=y, sr=sr, units="frames")
beats = librosa.frames_to_time(frames, sr=sr).round(3).tolist()

onset = librosa.onset.onset_strength(y=y, sr=sr)
peaks = librosa.util.peak_pick(onset, pre_max=3, post_max=3, pre_avg=3, post_avg=5, delta=0.5, wait=10)
json.dump({
    "bpm": float(np.atleast_1d(tempo)[0]),
    "beats": beats,                                                   # cambios de estado aquí
    "downbeats": beats[::4],                                          # momentos grandes aquí
    "hits": librosa.frames_to_time(peaks, sr=sr).round(3).tolist(),   # SFX aquí
}, sys.stdout, indent=1)
