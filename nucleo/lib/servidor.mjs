// Servidor estático local para el render y la vista previa: las escenas con módulos ES (typefx) no cargan con file://.
// Solo escucha en 127.0.0.1 y nunca sirve nada fuera de la raíz del repo.
//   const s = await servir(RAIZ);  s.url → "http://127.0.0.1:PUERTO"   await s.cerrar();
import { createServer } from "node:http";
import { createReadStream, statSync } from "node:fs";
import { resolve, sep, extname, join } from "node:path";

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif",
  ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf", ".otf": "font/otf",
  ".mp3": "audio/mpeg", ".wav": "audio/wav", ".mp4": "video/mp4",
  ".srt": "text/plain; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".tsv": "text/plain; charset=utf-8", ".md": "text/plain; charset=utf-8",
};
export const tipoMime = (ruta) => MIME[extname(ruta).toLowerCase()] || "application/octet-stream";

// Ruta del archivo en disco para una URL, o null si sale de la raíz (o trae bytes nulos).
export function rutaSegura(raiz, url) {
  let p;
  try { p = decodeURIComponent(url.split("?")[0].split("#")[0]); } catch { return null; }
  if (p.includes("\0")) return null;
  const base = resolve(raiz);
  const ruta = resolve(join(base, p));
  return ruta === base || ruta.startsWith(base + sep) ? ruta : null;
}

export function servir(raiz, { puerto = 0 } = {}) {
  const srv = createServer((req, res) => {
    let ruta = rutaSegura(raiz, req.url || "/");
    if (!ruta) { res.writeHead(403).end(); return; }
    try {
      let st = statSync(ruta);
      if (st.isDirectory()) { ruta = join(ruta, "index.html"); st = statSync(ruta); }
      res.writeHead(200, { "Content-Type": tipoMime(ruta), "Content-Length": st.size, "Cache-Control": "no-store" });
      createReadStream(ruta).pipe(res);
    } catch { res.writeHead(404).end(); }
  });
  return new Promise((ok, mal) => {
    srv.once("error", mal);
    srv.listen(puerto, "127.0.0.1", () => ok({ url: `http://127.0.0.1:${srv.address().port}`, cerrar: () => new Promise((r) => srv.close(r)) }));
  });
}
