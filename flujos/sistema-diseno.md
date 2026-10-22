# Flujo · Importar un sistema de diseño

Trae la marca de la persona (colores, tipografías, logos, reglas) a `sistemas-diseno/<id>/` para usarla en sus videos.

## 1. ¿De dónde viene?
Preguntar: Claude Design · Figma · un manual de marca (PDF o web) · no está escrito (lo armamos ahora).

## 2. Traerlo según el origen
- **Claude Design**: solo si el agente tiene acceso real a Claude Design o a una herramienta de diseño de Claude en esta sesión
  (ver `CLAUDE.md`). Pedirle el sistema de diseño (paleta, tipografías, componentes, logos) y traducirlo a `sistema.yaml`.
  Si el agente no tiene ese acceso, pedirle a la persona que **exporte o copie** desde Claude Design los colores (hex),
  las tipografías y el logo (SVG o PNG) y seguir como «a mano».
- **Figma**: con un conector/MCP de Figma, leer variables y estilos del archivo (colores, tipografías) y exportar los logos.
  Sin conector: pedir el enlace y que la persona exporte los tokens o comparta capturas.
- **Manual de marca**: leer el documento y extraer colores, tipografías, logos y reglas de uso (lo intocable y lo flexible).
- **A mano**: 4 preguntas: colores (2–5, en hex o descritos) · tipografía de títulos y de texto · logo (archivo) · 2 o 3 reglas
  («el logo siempre sobre fondo claro», «nunca usar rojo»…).

## 3. Escribirlo
1. `cp -r sistemas-diseno/_plantilla sistemas-diseno/<id>` (id en minúsculas con guiones).
2. Llenar `sistema.yaml` (hex, nombres reales de las tipografías y su paquete `@fontsource` si existe) y `SISTEMA.md`.
3. Logos en `activos/` (SVG de preferencia). Fuentes que no estén en `@fontsource`: anotar cómo instalarlas.
4. Muestra: un cuadro con la paleta, las tipografías y el logo (una escena de prueba o una hoja simple) y **mirarlo**.
5. ⛔ Mostrar y esperar el OK. Registrar en `DECISIONES.md`: de dónde salió y la fecha.

## 4. Usarlo
En la entrevista (`sistema_diseno: <id>` en `video.yaml`). En la fase de diseño, sus tokens pasan a la paleta del video
(`<video>/js/marca.js` en el método canvas) y mandan sobre el estilo en colores, tipografías y logos.
