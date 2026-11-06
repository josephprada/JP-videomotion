// Renderizador Canvas 2D con desenfoque de movimiento por subfotogramas.
//
// Cada subfotograma se pinta llamando a draw(ctx, t') desde cero, así que el resultado sigue siendo
// una función pura de t. La media se acumula con source-over y alfa 1/(k+1): las zonas quietas
// (todos los subfotogramas iguales) conservan su color exacto y solo se mezclan los bordes en movimiento.

export function createRenderer(canvas, { width = 1920, height = 1080, fps = 60, subframes = 8, shutter = 0.5 } = {}) {
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const buffer = document.createElement('canvas');
  buffer.width = width;
  buffer.height = height;
  const bctx = buffer.getContext('2d');
  const opts = { fps, subframes, shutter };

  function frame(t, draw, { duration = Infinity } = {}) {
    const n = Math.max(1, opts.subframes | 0);
    if (n === 1) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      draw(ctx, t);
      return;
    }
    const span = opts.shutter / opts.fps;
    for (let k = 0; k < n; k++) {
      // Obturador centrado en t, recortado a la duración del vídeo.
      const tk = Math.min(duration - 1e-4, Math.max(0, t + (k / (n - 1) - 0.5) * span));
      bctx.setTransform(1, 0, 0, 1, 0, 0);
      bctx.globalAlpha = 1;
      draw(bctx, tk);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1 / (k + 1);
      ctx.drawImage(buffer, 0, 0);
    }
    ctx.globalAlpha = 1;
  }

  return { canvas, ctx, frame, options: opts, width, height };
}
