// Escena 1 · COMPARATIVA (plantilla del estilo «tarjetas»; reemplázala por la escena real del guion)
// Muestra el lenguaje completo: título karaoke, tarjetas que entran enfocándose, contadores rodantes, conector,
// onda de «ganador» y el paso a una tarjeta crema de capítulo que crece desde el centro (continuidad, no corte).
const E = ESCENA.crear({ t0: 0, dur: 8 });
const { P, g, v } = E;
const { inv, ease, lerp } = M;
const C = ESTILO.color, F = ESTILO.fuente;
// palabras clave en segundos globales (voz/palabras.srt): todo golpe visual se ancla a una de estas
const T = { titulo: 0.3, tarjetaA: 0.95, tarjetaB: 1.3, cuenta: 1.9, ganador: 3.5, sale: 4.9, crema: 5.0, frase: 5.85, fin: 8 };

const W = P.W / P.ESC, H = P.H / P.ESC;   // espacio de diseño (1080 × 1920 en 9:16)
P.planos([[0, v(T.fin), plano]]);

function tarjetaModelo(t, y, nombre, punto, valor, n, entra, elegida) {
  const x = 110, w = W - 220, h = 470;
  const e = FOCO.estado(t, { entra: v(entra), sale: v(T.sale), dur: 0.5, blur: 22, dy: 26 });
  FOCO.dibujar(g, e, W / 2, y + h / 2, (g) => {
    UI.tarjeta(g, x, y, w, h, {
      brillo: elegida ? `rgba(185,166,255,${inv(v(T.ganador), v(T.ganador) + 0.4, t)})` : null, anchoBorde: 5,
      contenido: (g) => {
        const fr = g.createLinearGradient(0, y, 0, y + 150); fr.addColorStop(0, "#EEF3FF"); fr.addColorStop(1, "#FFFFFF");
        g.fillStyle = fr; g.fillRect(x, y, w, 150);
        UI.digitos(g, UI.contador(t, v(T.cuenta), 1.3, 0, valor), n, W / 2, y + 250, { font: "800 118px Inter", color: C.tinta, fondo: "#F1F4FC", ancho: 104, alto: 150 });
        g.fillStyle = C.suave; g.font = "600 34px Inter"; g.textAlign = "center"; g.fillText("millones de tokens", W / 2, y + 405);
      },
    });
    UI.insignia(g, nombre, x + 120, y, { font: "600 28px Inter", punto, color: C.tinta });
    if (elegida) UI.dibujarOnda(g, x + 120, y, 190, t, v(T.ganador));
  }, { caja: [x - 140, y - 230, w + 280, h + 360] });
}

function plano(t) {
  ESTILO.limpio = 0;   // estado por cuadro: se reinicia siempre (seek puede ir hacia atrás)
  P.dis(() => {
    // 1) título karaoke: sans + palabra clave en serif itálica
    FOCO.texto(g, [
      { texto: "Dos", t: v(T.titulo) }, { texto: "modelos,", t: v(T.titulo + 0.12) }, { texto: "un", t: v(T.titulo + 0.3) },
      { texto: "mismo", t: v(T.titulo + 0.42), font: F.clave }, { texto: "reto", t: v(T.titulo + 0.56), font: F.clave },
    ], t, W / 2, H * 0.17, { font: F.texto, color: "#FFFFFF", sale: v(T.sale), dur: 0.4 });

    // 2) dos tarjetas que entran enfocándose, con contadores rodantes
    tarjetaModelo(t, H * 0.24, "Modelo A", C.acento, 237, 3, T.tarjetaA, false);
    tarjetaModelo(t, H * 0.24 + 560, "Modelo B", "#2A5BD7", 10, 2, T.tarjetaB, true);

    // 3) conector punteado hacia el veredicto + píldora que entra enfocándose
    const yB = H * 0.24 + 560 + 470, yV = H * 0.86;
    const ec = FOCO.estado(t, { entra: v(T.ganador - 0.2), sale: v(T.sale), dur: 0.3, blur: 10 });
    FOCO.dibujar(g, ec, W / 2, (yB + yV) / 2, (g) => UI.conector(g, [[W / 2, yB + 10], [W / 2, yV - 30]], inv(v(T.ganador - 0.2), v(T.ganador + 0.3), t)));
    const ep = FOCO.estado(t, { entra: v(T.ganador + 0.2), sale: v(T.sale), dur: 0.45, blur: 16, dy: 20 });
    FOCO.dibujar(g, ep, W / 2, yV, (g) => UI.insignia(g, "Más eficiente", W / 2, yV, { font: "800 34px Inter", alto: 70, punto: "#2BB673", color: C.tinta }));

    // 4) capítulo: una tarjeta crema entra enfocándose y crece hasta llenar el cuadro (continuidad: el siguiente plano YA está aquí)
    const em = FOCO.estado(t, { entra: v(T.crema), dur: 0.35, blur: 18 });
    if (em.a > 0) {
      const k = ease.inOut(inv(v(T.crema + 0.3), v(T.crema + 0.85), t));
      const w = lerp(560, W, k), h = lerp(320, H, k), r = lerp(36, 0, k);
      ESTILO.limpio = k;
      FOCO.dibujar(g, em, W / 2, H / 2, (g) => ESTILO.crema(g, (W - w) / 2, (H - h) / 2, w, h, r));
      // 5) frase de capítulo con jerarquía tipográfica mezclada
      FOCO.texto(g, [{ texto: "Ahora,", t: v(T.frase), font: "italic 96px 'Instrument Serif'" }, { texto: "hablemos del", t: v(T.frase + 0.25) }],
        t, W / 2, H * 0.47, { font: "600 60px Inter", color: C.tintaCrema });
      FOCO.texto(g, [{ texto: "costo", t: v(T.frase + 0.6) }], t, W / 2, H * 0.47 + 190, { font: "800 190px Inter", color: C.acentoCrema, blur: 18, dur: 0.5 });
    }
  });
}
