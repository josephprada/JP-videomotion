// Rejilla suiza: 12 columnas, márgenes y medianil. Todo lo que se coloca en pantalla se coloca aquí.

export function createGrid({ width = 1920, height = 1080, cols = 12, rows = 6, margin = 96, gutter = 24 } = {}) {
  const colW = (width - 2 * margin - (cols - 1) * gutter) / cols;
  const rowH = (height - 2 * margin - (rows - 1) * gutter) / rows;
  return {
    width, height, cols, rows, margin, gutter, colW, rowH,
    // Borde izquierdo de la columna i (0..cols). x(cols) es el borde derecho del área útil.
    x: (i) => margin + i * (colW + gutter) - (i === cols ? gutter : 0),
    y: (j) => margin + j * (rowH + gutter) - (j === rows ? gutter : 0),
    span: (n) => n * colW + (n - 1) * gutter,
    spanY: (n) => n * rowH + (n - 1) * gutter,
    // Rectángulo de columnas [c0, c0+n) × filas [r0, r0+m).
    rect: (c0, n, r0 = 0, m = rows) => ({
      x: margin + c0 * (colW + gutter), y: margin + r0 * (rowH + gutter),
      w: n * colW + (n - 1) * gutter, h: m * rowH + (m - 1) * gutter,
    }),
    full: { x: 0, y: 0, w: width, h: height },
  };
}
