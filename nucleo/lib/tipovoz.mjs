// Puente entre la voz y la tipografía cinética (typefx). Puro: se usa en el navegador y en los tests.
//   buscarPalabra(palabras, "esta idea", { desde })  → { texto, ini, fin } en segundos de la voz (de voz/palabras.srt)
//   paletaTypefx({ fondo, tinta, acento, … })        → paleta por roles de typefx desde colores de marca
//   formatoDiseno("9x16")                            → [ancho, alto] del espacio de diseño
// Regla: si una palabra no está en la alineación, se falla. Nunca se inventan tiempos.

export const normalizar = (s) => String(s).toLocaleLowerCase("es").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\p{L}\p{N}]+/gu, "");

export function buscarPalabra(palabras, texto, { desde = 0 } = {}) {
  if (!palabras?.length) throw new Error(`no hay palabras con tiempo: genera voz/palabras.srt (bash nucleo/tools/tiempos.sh <video>) antes de animar «${texto}»`);
  const buscadas = String(texto).split(/\s+/).map(normalizar).filter(Boolean);
  const norm = palabras.map((p) => normalizar(p.texto));
  for (let i = 0; i <= palabras.length - buscadas.length; i++) {
    if (palabras[i].ini < desde) continue;
    if (buscadas.every((b, k) => norm[i + k] === b)) {
      const tramo = palabras.slice(i, i + buscadas.length);
      return { texto: tramo.map((p) => p.texto).join(" "), ini: tramo[0].ini, fin: tramo[tramo.length - 1].fin };
    }
  }
  const muestra = palabras.filter((p) => p.ini >= desde).slice(0, 12).map((p) => p.texto).join(" ");
  throw new Error(`«${texto}» no está en la voz${desde ? ` desde ${desde} s` : ""} (voz/palabras.srt). Lo que sí hay: ${muestra}…`);
}

// Roles de typefx: paper/ink (base), paperInv/inkInv (inversión), surfaceA/B + onSurface (planos), accent/onAccent (el golpe).
export function paletaTypefx({ id = "video", nombre = id, fondo, tinta, acento, sobreAcento = fondo, planoA = acento, sobrePlanoA = fondo, planoB = tinta, sobrePlanoB = fondo } = {}) {
  const swatches = { fondo, tinta, acento, sobreAcento, planoA, sobrePlanoA, planoB, sobrePlanoB };
  return {
    id, name: nombre, swatches,
    roles: {
      paper: "fondo", ink: "tinta", paperInv: "tinta", inkInv: "fondo",
      surfaceA: "planoA", onSurfaceA: "sobrePlanoA", surfaceB: "planoB", onSurfaceB: "sobrePlanoB",
      accent: "acento", onAccent: "sobreAcento",
    },
  };
}

const FORMATOS = { "9x16": [1080, 1920], "1x1": [1080, 1080], "16x9": [1920, 1080] };
export const formatoDiseno = (fmt) => [...(FORMATOS[fmt] || FORMATOS["9x16"])];
