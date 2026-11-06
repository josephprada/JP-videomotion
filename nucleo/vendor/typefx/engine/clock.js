// Tiempo absoluto ↔ pulsos y compases. La rejilla sale de beats.json (medida sobre la pista).

export function createClock({ bpm = 120, beatsPerBar = 4, offset = 0, beats = null } = {}) {
  const period = 60 / bpm;
  return {
    bpm, period, beatsPerBar, offset,
    beats,
    // Pulso fraccionario en el instante t (0 = primer pulso).
    beat: (t) => (t - offset) / period,
    bar: (t) => (t - offset) / (period * beatsPerBar),
    time: (beat) => offset + beat * period,
    // Pulso relativo al inicio de un bloque que empieza en el pulso b0.
    local: (t, b0) => (t - offset) / period - b0,
  };
}

export function clockFromBeats(json) {
  return createClock({ bpm: json.bpm, offset: json.offset, beats: json.beats });
}
