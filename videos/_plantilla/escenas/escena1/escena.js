// Escena 1 · APERTURA (tiempo global 0,00–X,XX)
// «Frase exacta del texto que cubre esta escena.»
// t0 = segundo global donde empieza la escena (un corte de voz/silencios.txt); dur = siguiente corte − t0.
const E = ESCENA.crear({ t0: 0, dur: 3 });
const { P, g, v } = E;
const { spring, S } = M;
// palabras clave en segundos globales (voz/palabras.srt): todo golpe visual se ancla a una de estas
const T = { apertura: 0.4, fin: 3 };

P.planos([[0, v(T.fin), pApertura]]);

// un plano por idea; cada 2–4 s tiene que pasar algo nuevo
function pApertura(t) {
  const k = spring(t - v(T.apertura), ...S.playful);
  P.dis(() => {
    if (k > 0) {
      g.save(); g.translate(540, 960); g.scale(k, k);
      g.fillStyle = "#FFD34A"; g.font = "800 120px Montserrat"; g.textAlign = "center"; g.textBaseline = "middle";
      g.fillText("APERTURA", 0, 0);
      g.restore();
    }
  });
}
