// Modo de raster del navegador que renderiza (render.mjs --raster):
//   gpu       (por defecto) lienzo acelerado: rápido, para animatics, stills y storyboard. El texto grande bajo ciertas
//             transformaciones puede variar 1 nivel en algún píxel entre procesos (no se ve, pero cambia el hash).
//   software  lienzo por software: exacto entre procesos, ~45–70 % más lento. Lo usan determinismo.sh y el render final.
const BASE = ["--disable-gpu-vsync", "--font-render-hinting=none"];
const MODOS = { gpu: [], software: ["--disable-accelerated-2d-canvas", "--disable-gpu"] };

export function argsNavegador(modo = "gpu") {
  if (!(modo in MODOS)) throw new Error(`--raster «${modo}» no existe: usa ${Object.keys(MODOS).join(" o ")}`);
  return [...BASE, ...MODOS[modo]];
}
