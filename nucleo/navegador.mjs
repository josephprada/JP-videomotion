// Busca un Chrome o Chromium instalado para Playwright (playwright-core no trae navegador propio).
// Orden: CHROME_PATH → rutas típicas de Windows, macOS y Linux. Devuelve la ruta o null.
import { existsSync } from "node:fs";
import { join } from "node:path";

export function candidatos(plataforma = process.platform, env = process.env) {
  const lista = [];
  if (env.CHROME_PATH) lista.push(env.CHROME_PATH);
  if (plataforma === "win32") {
    for (const base of [env.PROGRAMFILES, env["PROGRAMFILES(X86)"], env.LOCALAPPDATA, "C:/Program Files", "C:/Program Files (x86)"]) {
      if (!base) continue;
      lista.push(join(base, "Google/Chrome/Application/chrome.exe"), join(base, "Chromium/Application/chrome.exe"), join(base, "Microsoft/Edge/Application/msedge.exe"));
    }
  } else if (plataforma === "darwin") {
    lista.push("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/Applications/Chromium.app/Contents/MacOS/Chromium",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge");
  } else {
    lista.push("/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/snap/bin/chromium");
  }
  return lista;
}

export function buscarChrome(plataforma, env) {
  return candidatos(plataforma, env).find((p) => existsSync(p)) || null;
}

// Si no hay navegador instalado, Playwright usa el suyo (npx playwright install chromium).
export async function lanzar(chromium, opciones = {}) {
  const ruta = buscarChrome();
  try {
    return await chromium.launch({ ...(ruta ? { executablePath: ruta } : {}), ...opciones });
  } catch (e) {
    console.error("No se pudo abrir Chrome. Instala Google Chrome o define CHROME_PATH con la ruta del ejecutable.");
    console.error("Diagnóstico completo: node nucleo/jp.mjs doctor");
    throw e;
  }
}
