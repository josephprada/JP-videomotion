// Subtítulos automáticos para redes: de las palabras con tiempo de la voz (voz/palabras.srt) a bloques cortos.
//   leerSrt(texto)                       → [{ ini, fin, texto }]
//   agrupar(palabras, opciones)          → bloques de pocas palabras: corta en puntuación final, en pausas y por largo
//   aSrt(bloques)                        → .srt estándar (para subir como archivo a la plataforma)
//   aAss(bloques, estilo)                → .ass con estilo (para quemarlo en el video con ffmpeg/libass)
const aSeg = (h, m, s, ms) => +h * 3600 + +m * 60 + +s + +ms / 1000;
const RE_T = /(\d+):(\d\d):(\d\d)[,.](\d{1,3})\s*-->\s*(\d+):(\d\d):(\d\d)[,.](\d{1,3})/;

export function leerSrt(texto) {
  const out = [];
  const lineas = texto.replace(/\r/g, "").split("\n");
  for (let i = 0; i < lineas.length; i++) {
    const m = lineas[i].match(RE_T);
    if (!m) continue;
    const txt = [];
    for (let j = i + 1; j < lineas.length && lineas[j].trim() !== "" && !RE_T.test(lineas[j]) && !(/^\d+$/.test(lineas[j].trim()) && RE_T.test(lineas[j + 1] || "")); j++) txt.push(lineas[j].trim());
    const t = txt.join(" ").trim();
    if (t) out.push({ ini: aSeg(m[1], m[2], m[3], m[4].padEnd(3, "0")), fin: aSeg(m[5], m[6], m[7], m[8].padEnd(3, "0")), texto: t });
  }
  return out;
}

const FINAL = /[.!?…]["»”)]?$/;
const unir = (ps) => ps.map((p) => p.texto).join(" ");
// Si una palabra que cierra frase no cabe en el bloque, se lleva consigo la última palabra del bloque
// (si caben juntas): así no queda una palabra huérfana al final de la frase.
export function agrupar(palabras, { maxCar = 22, maxPalabras = 4, pausa = 0.35, mayusculas = false } = {}) {
  const bloques = [];
  let cur = [];
  const cerrar = () => { if (cur.length) bloques.push(cur); cur = []; };
  for (const p of palabras) {
    if (cur.length) {
      const ultima = cur[cur.length - 1];
      if (p.ini - ultima.fin >= pausa) cerrar();
      else if (unir([...cur, p]).length > maxCar || cur.length >= maxPalabras) {
        const lleva = FINAL.test(p.texto) && cur.length >= 2 && unir([ultima, p]).length <= maxCar;
        if (lleva) cur.pop();
        cerrar();
        if (lleva) cur.push(ultima);
      }
    }
    cur.push(p);
    if (FINAL.test(p.texto)) cerrar();
  }
  cerrar();
  return bloques.map((ps) => {
    const texto = unir(ps);
    return { ini: ps[0].ini, fin: ps[ps.length - 1].fin, texto: mayusculas ? texto.toLocaleUpperCase("es") : texto };
  });
}

const dos = (n) => String(n).padStart(2, "0");
export function tiempoSrt(s) {
  const ms = Math.round(s * 1000);
  return `${dos(Math.floor(ms / 3600000))}:${dos(Math.floor(ms / 60000) % 60)}:${dos(Math.floor(ms / 1000) % 60)},${String(ms % 1000).padStart(3, "0")}`;
}
export const aSrt = (bloques) => bloques.map((b, i) => `${i + 1}\n${tiempoSrt(b.ini)} --> ${tiempoSrt(b.fin)}\n${b.texto}\n`).join("\n");

const tiempoAss = (s) => { const cs = Math.round(s * 100); return `${Math.floor(cs / 360000)}:${dos(Math.floor(cs / 6000) % 60)}:${dos(Math.floor(cs / 100) % 60)}.${dos(cs % 100)}`; };
// Colores ASS: &HAABBGGRR. Por defecto letra crema con borde oscuro grueso (legible sobre cualquier fondo, estilo redes).
export function aAss(bloques, { ancho = 1080, alto = 1920, fuente = "Arial", tamano = 76, negrita = true, color = "&H00F0FAFF", borde = "&H00201010",
  grosor = 6, sombra = 0, margenV = Math.round(alto * 0.27) } = {}) {
  return [
    "[Script Info]", "ScriptType: v4.00+", `PlayResX: ${ancho}`, `PlayResY: ${alto}`, "WrapStyle: 0", "ScaledBorderAndShadow: yes", "",
    "[V4+ Styles]",
    "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
    `Style: JP,${fuente},${tamano},${color},${color},${borde},&H80000000,${negrita ? -1 : 0},0,0,0,100,100,0,0,1,${grosor},${sombra},2,60,60,${margenV},1`,
    "", "[Events]", "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
    ...bloques.map((b) => `Dialogue: 0,${tiempoAss(b.ini)},${tiempoAss(b.fin)},JP,,0,0,0,,${b.texto.replace(/\n/g, "\N")}`),
    "",
  ].join("\n");
}
