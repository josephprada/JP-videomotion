// Escena 11 · FASES (global 28,2167–33,3000) · marca JP
// «Guion, voz, diseño, animación, render. Tú apruebas cada paso,»
// Cinco fichas del flujo se encienden al nombrarlas (con una piel distinta dentro); en «apruebas» cada compuerta se cierra con ✓.
const E = ESCENA.crear({ t0: 28.2167, dur: 5.0833 });
const { P, g, v } = E;
const { inv, ease, spring, lerp } = M;
const { C, F } = MARCA;
const T = { guion: 28.7, voz: 29.2, diseno: 29.6, animacion: 30.36, render: 31.12, tu: 31.64, apruebas: 31.8, cada: 32.44, paso: 32.76, fin: 33.3 };
const antes = 0.08;
const W = P.W / P.ESC, H = P.H / P.ESC;
const vertical = H > W;
const FASES = [["Guion", T.guion, 5], ["Voz", T.voz, 1], ["Diseño", T.diseno, 0], ["Animación", T.animacion, 3], ["Render", T.render, 2]];
const L = vertical ? { x: 110, y: 300, w: W - 220, h: 128, gap: 26 } : { x: 120, y: 150, w: 860, h: 130, gap: 22 };
const TIT = vertical ? { x: W / 2, y: H * 0.72, px: 130 } : { x: W * 0.74, y: H * 0.5, px: 110 };

P.planos([[0, v(T.fin), plano]]);

function ficha(t, [nombre, cuando, piel], i) {
  const y = L.y + i * (L.h + L.gap);
  const e = FOCO.estado(t, { entra: v(cuando) - antes - 0.1, dur: 0.3, blur: 14, dy: 20 });
  if (e.a <= 0) return;
  const enc = inv(v(cuando) - antes, v(cuando) + 0.15, t);
  const ok = v(T.apruebas) + i * 0.14;
  FOCO.dibujar(g, e, L.x + L.w / 2, y + L.h / 2, (g) => {
    g.fillStyle = C.banda; g.fillRect(L.x, y, L.w, L.h);
    g.strokeStyle = enc > 0.5 ? C.lineaFuerte : C.linea; g.lineWidth = 2; g.strokeRect(L.x + 1, y + 1, L.w - 2, L.h - 2);
    g.fillStyle = C.rojo; g.fillRect(L.x, y, 6 * enc, L.h);
    g.font = F.mono(24); g.fillStyle = C.tenue; g.textBaseline = "middle"; g.textAlign = "left"; g.fillText(String(i + 1).padStart(2, "0"), L.x + 34, y + L.h / 2);
    g.font = F.display(70); g.fillStyle = C.papel; g.fillText(nombre.toUpperCase(), L.x + 100, y + L.h / 2 + 4);
    // miniatura de una piel: el mismo punto, otro estilo
    PROMO.miniatura(g, piel, L.x + L.w - 300, y + 16, 160, L.h - 32, t);
    // compuerta: cuadro que se cierra con ✓ rojo
    const gx = L.x + L.w - 96, gy = y + L.h / 2;
    g.strokeStyle = C.lineaFuerte; g.lineWidth = 2; g.strokeRect(gx - 30, gy - 30, 60, 60);
    const k = ease.out(inv(ok, ok + 0.2, t));
    if (k > 0) {
      g.fillStyle = C.rojo; g.fillRect(gx - 30, gy - 30, 60, 60);
      g.strokeStyle = C.papel; g.lineWidth = 7; g.lineCap = "square"; g.beginPath();
      const p = [[gx - 15, gy + 1], [gx - 4, gy + 13], [gx + 17, gy - 13]];
      g.moveTo(...p[0]); if (k > 0.4) g.lineTo(...p[1]); else g.lineTo(lerp(p[0][0], p[1][0], k / 0.4), lerp(p[0][1], p[1][1], k / 0.4));
      if (k > 0.4) g.lineTo(lerp(p[1][0], p[2][0], (k - 0.4) / 0.6), lerp(p[1][1], p[2][1], (k - 0.4) / 0.6));
      g.stroke();
    }
  }, { caja: [L.x - 60, y - 60, L.w + 120, L.h + 120] });
}

function plano(t) {
  P.dis(() => {
    MARCA.rotulo(g, "El flujo · 14 fases · 9 compuertas", L.x, L.y - 60, { px: 22, color: C.suave, a: inv(v(T.guion) - 0.3, v(T.guion), t) });
    FASES.forEach((f, i) => ficha(t, f, i));
    const pal = [["TÚ", T.tu], ["APRUEBAS", T.apruebas]];
    FOCO.texto(g, pal.map(([texto, tt]) => ({ texto, t: v(tt) - antes })), t, TIT.x, TIT.y, { font: F.display(TIT.px), color: C.papel, dur: 0.3 });
    FOCO.texto(g, [{ texto: "CADA", t: v(T.cada) - antes }, { texto: "PASO.", t: v(T.paso) - antes, color: C.rojo }], t, TIT.x, TIT.y + TIT.px * 1.05,
      { font: F.display(TIT.px), color: C.papel, dur: 0.3 });
  });
}
