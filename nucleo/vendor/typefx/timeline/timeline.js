// Timeline: escenas colocadas en pulsos. sceneAt(t) dice qué escena manda y en qué pulso local está.
//
// scene: { id, beat (pulso de inicio), beats (duración), draw(ctx, s, env) }
// s: { t (segundos locales), b (pulso local), T (segundos absolutos), B (pulso absoluto), u (progreso 0..1) }

export function createTimeline({ clock, scenes }) {
  const ordered = scenes.slice().sort((a, b) => a.beat - b.beat);
  const totalBeats = Math.max(...ordered.map((s) => s.beat + s.beats));
  const duration = clock.time(totalBeats) - clock.time(0);

  function sceneAt(T) {
    const B = clock.beat(T);
    let scene = ordered[0];
    for (const s of ordered) if (B >= s.beat - 1e-9) scene = s;
    const b = B - scene.beat;
    return { scene, s: { t: b * clock.period, b, T, B, u: b / scene.beats } };
  }

  function draw(ctx, T, env) {
    const { scene, s } = sceneAt(T);
    ctx.save();
    scene.draw(ctx, s, env);
    ctx.restore();
  }

  return { scenes: ordered, sceneAt, draw, duration, totalBeats, clock };
}
