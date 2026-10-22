// Rig humanoide común: IK, luz y orden de piezas a partir del «spec» de un personaje (ejemplo: universos/_ejemplo/js/persona.js).
// Espacio del cuerpo: suelo en y = 1000, coronilla cerca de y = 0, x = 0 en el eje. `alto` escala a píxeles.
// Cada personaje es un «spec» con sus medidas y funciones de dibujo por pieza; el rig resuelve IK, luz y orden.
//   RIG.draw(g, SPEC, pose)
// Orden de pintado (atrás → adelante): atras (pelo largo, etc.) → piernas → torso → antesBrazos → brazos → despuesBrazos → cabeza → delante
(function (g0) {
  const { seg, ik } = D;
  const rad = (d) => (d * Math.PI) / 180;
  // dirección de la luz del mundo; una escena puede cambiarla (p. ej. un bombillo arriba-derecha)
  const R = { luz: [-1, -0.35] };
  const luzEn = (phi, L = R.luz) => [Math.cos(-phi) * L[0] - Math.sin(-phi) * L[1], Math.sin(-phi) * L[0] + Math.cos(-phi) * L[1]];
  const segL = (g, p, q, fn, L) => { const dx = q[0] - p[0], dy = q[1] - p[1]; const phi = Math.atan2(-dx, dy); seg(g, p, q, (len) => fn(len, luzEn(phi, L))); };

  function brazo(g, S, hombro, objetivo, side, k) {
    const tipo = side < 0 ? k.tipoI : k.tipoD, abajo = side < 0 ? k.codoAbajoI : k.codoAbajoD;
    const sg = (side < 0 ? 1 : -1) * (abajo ? -1 : 1);
    const [codo, mun] = ik(hombro, objetivo, S.brazo.a, S.brazo.b, sg);
    // antebrazo y mano primero: la manga del brazo cubre el codo
    segL(g, codo, mun, (len, luz) => {
      S.brazo.ante(g, len, luz, side, k);
      g.save(); g.translate(0, len - 6); S.brazo.mano(g, tipo, side, luz, k); g.restore();
    }, k.luz);
    segL(g, hombro, codo, (len, luz) => S.brazo.sup(g, len, luz, side, k), k.luz);
    return { codo, mun };
  }
  function pierna(g, S, cadera, pie, side, k) {
    const tob = [pie[0], pie[1] - S.pierna.tobillo];
    const [rod, t] = ik(cadera, tob, S.pierna.a, S.pierna.b, side < 0 ? 1 : -1);
    segL(g, cadera, rod, (len, luz) => S.pierna.muslo(g, len, luz, side, k), k.luz);
    segL(g, rod, t, (len, luz) => S.pierna.pant(g, len, luz, side, k), k.luz);
    const L = k.luz || R.luz;
    g.save(); g.translate(t[0], t[1]); g.scale(side, 1); S.pierna.pie(g, side, [L[0] * side, L[1]], k); g.restore();
  }

  function cuerpo(g, S, k) {
    const h = k.cadera, Rr = rad(k.rot), sq = k.sq;
    // punto del torso (marco sin girar) → espacio del cuerpo
    const xf = ([x, y]) => { const dx = x - h[0], dy = (y - h[1]) * sq; return [h[0] + dx * Math.cos(Rr) - dy * Math.sin(Rr), h[1] + dx * Math.sin(Rr) + dy * Math.cos(Rr)]; };
    const torso = (fn) => { g.save(); g.translate(h[0], h[1]); g.rotate(Rr); g.scale(1, sq); g.translate(-h[0], -h[1]); fn(); g.restore(); };
    const cuello = xf(S.cuello);
    const cabeza = (fn) => { g.save(); g.translate(cuello[0], cuello[1]); g.rotate(Rr + rad(k.cabeza.rot || 0)); g.translate(0, S.cabezaY); fn(); g.restore(); };
    const ctx = { xf, torso, cabeza };
    S.atras && S.atras(g, k, ctx);
    pierna(g, S, xf(S.caderas[0]), k.pieI, -1, k);
    pierna(g, S, xf(S.caderas[1]), k.pieD, 1, k);
    torso(() => S.torso(g, k, ctx));
    S.antesBrazos && S.antesBrazos(g, k, ctx);
    ctx.brazoI = brazo(g, S, xf(S.hombros[0]), k.manoI, -1, k);
    ctx.brazoD = brazo(g, S, xf(S.hombros[1]), k.manoD, 1, k);
    S.despuesBrazos && S.despuesBrazos(g, k, ctx);
    cabeza(() => S.cabeza(g, k.cabeza, k));
    S.delante && S.delante(g, k, ctx);
  }

  // pose: mezcla superficial con la base del personaje (la cabeza también se mezcla)
  function draw(g, S, pose = {}) {
    const k = { ...S.base, ...pose, cabeza: { ...S.base.cabeza, ...(pose.cabeza || {}) } };
    const s = k.alto / 1000;
    g.save(); g.translate(k.x, k.y); g.scale(s, s); g.translate(0, -1000);
    cuerpo(g, S, k);
    g.restore();
  }

  // ciclo de caminar visto de frente: pies que se alzan en arco, cadera que sube dos veces por ciclo y brazos opuestos.
  // fase en ciclos (1 = un paso de cada pie). Devuelve claves de pose.
  function caminar(S, fase, { zancada = 26, alza = 34, bob = 14, brazo = 46 } = {}) {
    const a = fase * Math.PI * 2, b = S.base;
    const pie = (s, ph) => { const lev = Math.max(0, Math.sin(ph)); return [b[s < 0 ? "pieI" : "pieD"][0] + Math.cos(ph) * zancada * 0.5, 1000 - lev * alza]; };
    return {
      pieI: pie(-1, a), pieD: pie(1, a + Math.PI),
      cadera: [b.cadera[0], b.cadera[1] - Math.abs(Math.cos(a)) * bob + bob * 0.5],
      manoI: [b.manoI[0] - Math.sin(a) * brazo * 0.3, b.manoI[1] - Math.max(0, -Math.sin(a)) * brazo * 0.4],
      manoD: [b.manoD[0] - Math.sin(a) * brazo * 0.3, b.manoD[1] - Math.max(0, Math.sin(a)) * brazo * 0.4],
      rot: Math.sin(a) * 1.5,
    };
  }

  // ---------------- caras genéricas (ojos, cejas y boca por expresión) ----------------
  // e: expresión { ceja, tristeza, ojo: punto|feliz|abierto, boca: sonrisa|dientes|o|ondas|linea|habla|lado, gota }
  // k: { mirada, parpadeo, giro }. P: medidas de la cara { ojoX, ojoY, ojo: [rx, ry], cejaY, cejaW, bocaY, bocaW, pestanas, labios, ojoCol, cejaCol, boca }
  const EXPR_P = {
    neutro: { ceja: 0, tristeza: 0, ojo: "punto", boca: "sonrisa" },
    feliz: { ceja: -4, tristeza: 0, ojo: "feliz", boca: "dientes" },
    sorpresa: { ceja: -12, tristeza: 2, ojo: "abierto", boca: "o" },
    preocupada: { ceja: -4, tristeza: 9, ojo: "punto", boca: "ondas", gota: true },
    duda: { ceja: -6, tristeza: -4, ojo: "punto", boca: "lado" },
    habla: { ceja: -2, tristeza: 0, ojo: "punto", boca: "habla" },
    seria: { ceja: 2, tristeza: 0, ojo: "punto", boca: "linea" },
  };
  function cara(g, e, k, P) {
    const { forma, fill, trazo, elipse, dentro } = D;
    if (typeof e === "string") e = EXPR_P[e] || EXPR_P.neutro;
    const mir = k.mirada || [0, 0], parp = k.parpadeo || 0, gx = (k.giro || 0) * 8;
    const [rx, ry] = P.ojo;
    for (const s of [-1, 1]) {
      const x = s * P.ojoX + gx, y = P.ojoY;
      if (parp > 0.5 || e.ojo === "feliz") {
        // ojo cerrado: arco feliz hacia arriba, parpadeo hacia abajo
        const up = e.ojo === "feliz" && parp <= 0.5 ? -1 : 1;
        trazo(g, `M ${x - rx * 1.25} ${y + 1} Q ${x} ${y + up * ry * 0.9} ${x + rx * 1.25} ${y + 1}`, P.ojoCol, 4.5);
        if (P.pestanas) trazo(g, `M ${x + s * rx * 1.25} ${y + 1} l ${s * 5} ${-4}`, P.ojoCol, 3);
        continue;
      }
      const ab = e.ojo === "abierto";
      if (ab) elipse(g, x, y, rx * 1.55, ry * 1.4, "#FFFDF6");
      const px = x + mir[0] * rx * 0.45, py = y + mir[1] * ry * 0.35;
      elipse(g, px, py, ab ? rx * 0.7 : rx, (ab ? ry * 0.75 : ry) * (1 - parp * 1.6), P.ojoCol);
      elipse(g, px - rx * 0.32, py - ry * 0.38, rx * 0.34, rx * 0.34, "#FFFDF6");
      elipse(g, px + rx * 0.3, py + ry * 0.3, rx * 0.15, rx * 0.15, "#FFFDF6");
      if (P.pestanas) {
        trazo(g, `M ${x - rx * 1.3} ${y - ry * 0.55} Q ${x} ${y - ry * 1.45} ${x + rx * 1.3} ${y - ry * 0.55}`, P.ojoCol, 3.2);
        trazo(g, `M ${x + s * rx * 1.3} ${y - ry * 0.55} l ${s * 6} ${-5}`, P.ojoCol, 2.6);
      }
    }
    for (const s of [-1, 1]) {
      g.save(); g.translate(s * P.ojoX + gx, P.cejaY + e.ceja); g.rotate((s * e.tristeza * 1.6 * Math.PI) / 180);
      const w = P.cejaW;
      fill(g, `M ${-w} 2 Q ${-w * 0.6} -5 0 -6 Q ${w * 0.7} -5 ${w} 1 Q ${w * 0.6} 3 0 2 Q ${-w * 0.6} 4 ${-w} 2 Z`, P.cejaCol);
      g.restore();
    }
    const y = P.bocaY, w = P.bocaW, L = P.labios, B = P.boca || "#6E2A2A";
    const b = e.boca;
    if (b === "sonrisa") { if (L) trazo(g, `M ${-w} ${y} Q 0 ${y + w * 0.55} ${w} ${y}`, L, 6.5); trazo(g, `M ${-w} ${y} Q 0 ${y + w * 0.45} ${w} ${y}`, B, 3.2); }
    if (b === "linea") trazo(g, `M ${-w * 0.8} ${y + 2} Q 0 ${y + 4} ${w * 0.8} ${y + 2}`, L || B, 4.5);
    if (b === "lado") trazo(g, `M ${-w * 0.8} ${y + 4} Q ${w * 0.2} ${y + 4} ${w * 0.9} ${y - 3}`, L || B, 4.5);
    if (b === "ondas") trazo(g, `M ${-w} ${y + 3} q ${w / 4} -5 ${w / 2} 0 t ${w / 2} 0 t ${w / 2} 0 t ${w / 2} 0`, L || B, 4);
    if (b === "dientes" || b === "habla" || b === "o") {
      const d = b === "dientes" ? `M ${-w * 1.1} ${y - 3} Q 0 ${y + w * 1.05} ${w * 1.1} ${y - 3} Q 0 ${y + 4} ${-w * 1.1} ${y - 3} Z`
        : b === "habla" ? `M ${-w * 0.7} ${y} Q 0 ${y + w * 0.9} ${w * 0.7} ${y} Q 0 ${y - 4} ${-w * 0.7} ${y} Z`
          : `M 0 ${y - 6} Q ${w * 0.55} ${y - 6} ${w * 0.55} ${y + 8} Q ${w * 0.55} ${y + 22} 0 ${y + 22} Q ${-w * 0.55} ${y + 22} ${-w * 0.55} ${y + 8} Q ${-w * 0.55} ${y - 6} 0 ${y - 6} Z`;
      fill(g, d, B);
      if (b === "dientes") dentro(g, d, `M ${-w * 1.2} ${y - 8} L ${w * 1.2} ${y - 8} L ${w * 1.2} ${y + 5} L ${-w * 1.2} ${y + 5} Z`, "#FFFDF6");
      dentro(g, d, `M ${-w} ${y + w * 0.6} Q 0 ${y + w * 0.2} ${w} ${y + w * 0.6} L ${w} ${y + 30} L ${-w} ${y + 30} Z`, "#C9584A");
      if (L) trazo(g, d, L, 2.5);
    }
    if (e.gota) { forma(g, `M ${P.ojoX + 26} -60 Q ${P.ojoX + 42} -34 ${P.ojoX + 37} -22 Q ${P.ojoX + 30} -12 ${P.ojoX + 21} -21 Q ${P.ojoX + 16} -32 ${P.ojoX + 26} -60 Z`, { b: "#8FD3F0", s: "#5FB3D9" }, { so: 4, lo: 0 }); }
  }

  g0.RIG = { R, draw, caminar, luzEn, rad, cara, EXPR_P };
})(typeof globalThis !== "undefined" ? globalThis : window);
