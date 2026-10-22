// Persona de ejemplo · personaje completo sobre el rig del núcleo (nucleo/kit/rig.js). Plano, sin contorno, sombra de celda.
// Úsalo como base para personajes nuevos: copia el archivo, cambia la paleta C, las formas y el bloqueo de identidad.
// Espacio del cuerpo: suelo en y = 1000, coronilla en y ≈ 0 (≈ 4,6 cabezas). Caras con RIG.cara (expresiones de RIG.EXPR_P).
//   PERSONA.draw(g, { x, y, alto, manoD: [x, y], codoAbajoD: true, cabeza: { expr: "feliz", mirada: [0.5, 0] } })
//   PERSONA.retrato(g, { expr: "sorpresa" })     solo la cabeza (para planos cerrados y hojas de expresiones)
(function (g0) {
  const { forma, fill, trazo, elipse } = D;
  const C = {
    piel: { b: "#C68A62", s: "#A06A47", l: "#EDB386" },
    camisa: { b: "#3E8E86", s: "#2C6B66", l: "#6CC0B5" }, camisaD: "#327A73",
    pantalon: { b: "#3B3F5C", s: "#2A2D45", l: "#5D6286" }, costura: "#E9C35C",
    pelo: { b: "#2E2228", s: "#1E161B", l: "#5A4450" },
    tenis: { b: "#F4F0E8", s: "#CFC6D6", l: "#FFFFFF" }, suela: "#E8664F",
    ojo: "#2A1E22", rubor: "rgba(226,110,100,0.28)",
  };
  // ---------------- cabeza ----------------
  const CARA = "M -64 -48 Q -66 -96 0 -100 Q 66 -96 64 -48 L 63 18 Q 60 64 34 84 Q 17 96 0 96 Q -17 96 -34 84 Q -60 64 -63 18 Z";
  const PELO_ATRAS = "M -78 -40 Q -92 -126 0 -132 Q 92 -126 78 -40 Q 80 0 74 30 L -74 30 Q -80 0 -78 -40 Z";
  const PELO = "M -68 4 L -72 -40 Q -80 -108 -10 -118 Q 64 -124 76 -48 L 70 4 L 62 2 L 60 -40 Q 50 -80 10 -82 Q -30 -78 -50 -52 Q -58 -38 -60 4 Z";
  function cabeza(g, k) {
    const e = k.expr || "neutro";
    g.save(); g.scale(0.95, 0.95);
    for (const s of [-1, 1]) forma(g, `M ${s * 58} -14 Q ${s * 80} -20 ${s * 78} 10 Q ${s * 76} 30 ${s * 60} 26 Z`, C.piel, { so: 7, lo: 2 });
    forma(g, CARA, C.piel, { so: 20, lo: 5 });
    g.save(); g.clip(D.P(CARA)); g.translate(2, 10); fill(g, PELO, C.piel.s); g.restore();
    for (const s of [-1, 1]) elipse(g, s * 38, 30, 14, 8, C.rubor);
    fill(g, "M 4 -4 Q 9 18 13 28 Q 6 36 -5 33 Q 4 30 6 24 Q 4 12 4 -4 Z", C.piel.s);
    elipse(g, -2, 30, 7, 4.5, C.piel.l);
    RIG.cara(g, e, k, { ojoX: 27, ojoY: -6, ojo: [7, 8.5], cejaY: -30, cejaW: 16, bocaY: 56, bocaW: 16, pestanas: false, labios: null, ojoCol: C.ojo, cejaCol: C.pelo.b, boca: "#7A2A2E" });
    forma(g, PELO, C.pelo, { so: 14, lo: 4 });
    fill(g, "M -36 -104 Q 14 -122 54 -96 Q 30 -108 -4 -106 Q -20 -104 -36 -96 Z", C.pelo.l);
    g.restore();
  }
  function peloAtras(g) { g.save(); g.scale(0.95, 0.95); forma(g, PELO_ATRAS, C.pelo, { so: 18, lo: 4 }); g.restore(); }
  // ---------------- cuerpo ----------------
  function mano(g, tipo, side, luz) {
    const o = { so: 6, lo: 2, luz };
    if (tipo === "puno") { forma(g, "M -17 -4 Q -21 24 -2 31 Q 20 31 18 -2 Z", C.piel, o); trazo(g, "M -10 21 L 11 21", C.piel.s, 1.6); return; }
    forma(g, "M -17 -4 Q -21 30 -11 47 Q 0 55 11 47 Q 20 30 17 -4 Z", C.piel, o);
    forma(g, `M ${side * 12} 3 Q ${side * 29} 14 ${side * 23} 27 Q ${side * 15} 27 ${side * 11} 17 Z`, C.piel, o);
    trazo(g, "M -6 32 L -6 46 M 3 33 L 3 47", C.piel.s, 2);
  }
  const SPEC = {
    nombre: "Persona de ejemplo",
    cuello: [0, 250], cabezaY: -118,
    hombros: [[-104, 292], [104, 292]], caderas: [[-48, 604], [48, 604]],
    brazo: {
      a: 158, b: 150,
      sup: (g, len, luz) => {
        forma(g, `M -21 ${len * 0.3} L -18 ${len} L 18 ${len} L 21 ${len * 0.3} Z`, C.piel, { so: 8, lo: 2, luz });
        forma(g, `M -32 -18 Q -44 30 -36 ${len * 0.5} Q 0 ${len * 0.58} 36 ${len * 0.5} Q 44 30 32 -18 Q 0 -34 -32 -18 Z`, C.camisa, { so: 12, lo: 3, luz });
        trazo(g, `M -34 ${len * 0.48} Q 0 ${len * 0.56} 34 ${len * 0.48}`, C.camisaD, 4);
      },
      ante: (g, len, luz) => {
        D.elipse(g, 0, 0, 19, 19, C.piel.b);
        forma(g, `M -19 -2 Q -21 60 -15 ${len} L 15 ${len} Q 21 60 19 -2 Z`, C.piel, { so: 8, lo: 2, luz });
      },
      mano: (g, tipo, side, luz) => mano(g, tipo, side, luz),
    },
    pierna: {
      a: 188, b: 188, tobillo: 22,
      muslo: (g, len, luz) => { forma(g, `M -54 -24 Q -50 ${len * 0.5} -36 ${len + 6} L 36 ${len + 6} Q 50 ${len * 0.5} 54 -24 Z`, C.pantalon, { so: 12, lo: 3, luz }); },
      pant: (g, len, luz) => {
        forma(g, `M -36 -6 L -30 ${len - 4} L 30 ${len - 4} L 36 -6 Z`, C.pantalon, { so: 12, lo: 3, luz }); D.elipse(g, 0, -2, 36, 30, C.pantalon.b);
        fill(g, `M -14 ${len - 4} L 14 ${len - 4} L 14 ${len + 2} L -14 ${len + 2} Z`, C.piel.b);
      },
      pie: (g, side, luz) => {
        forma(g, "M 26 -10 Q 52 -8 58 10 Q 60 22 44 22 L -26 22 Q -36 18 -34 4 Q -28 -12 -6 -12 Z", C.tenis, { so: 7, lo: 2, luz });
        fill(g, "M -35 14 L 59 14 Q 60 22 44 22 L -26 22 Q -36 20 -35 14 Z", C.suela);
      },
    },
    atras: (g, k, ctx) => ctx.cabeza(() => peloAtras(g)),
    torso: (g) => {
      forma(g, "M -22 196 L 22 196 L 24 262 L 0 290 L -24 262 Z", C.piel, { so: 10, lo: 0 });
      forma(g, "M -96 556 L 96 556 L 104 650 Q 0 668 -104 650 Z", C.pantalon, { so: 16, lo: 4 });
      trazo(g, "M -100 584 L 100 584", C.costura, 1.6);
      forma(g, "M -30 250 L 0 286 L 30 250 Q 82 254 104 276 Q 118 300 112 360 L 102 470 Q 96 540 104 598 Q 0 618 -104 598 Q -96 540 -102 470 L -112 360 Q -118 300 -104 276 Q -82 254 -30 250 Z", C.camisa, { so: 26, lo: 6 });
      trazo(g, "M -30 250 L 0 286 L 30 250", C.camisa.l, 3);
      trazo(g, "M -58 430 Q -48 510 -64 592 M 46 440 Q 56 520 44 596", C.camisa.s, 2.5);
      trazo(g, "M -104 598 Q 0 618 104 598", C.camisaD, 4);
    },
    cabeza: (g, kc) => cabeza(g, kc),
    base: {
      x: 0, y: 0, alto: 410, cadera: [0, 610], rot: 0, sq: 1,
      pieI: [-50, 1000], pieD: [50, 1000], manoI: [-128, 596], manoD: [128, 596], tipoI: "abierta", tipoD: "abierta",
      cabeza: { expr: "neutro", rot: 0, giro: 0, mirada: [0, 0], parpadeo: 0 },
    },
  };
  g0.PERSONA = { C, SPEC, draw: (g, pose = {}) => RIG.draw(g, SPEC, pose), cabeza, retrato: (g, kc) => { peloAtras(g); cabeza(g, kc); } };
})(typeof globalThis !== "undefined" ? globalThis : window);
