# Sistemas de diseño

Un sistema de diseño es la **marca** (colores, tipografías, logos, tono visual) de una persona, empresa o producto.
Es distinto del estilo: el estilo dice **cómo se dibuja** (plano, cómic…); el sistema dice **con qué colores, letras y logos**.
Cuando un video usa un sistema (`sistema_diseno: <id>` en `video.yaml`), el sistema **manda** sobre el estilo en
colores, tipografías y logos.

## Estructura
```
sistemas-diseno/<id>/sistema.yaml   tokens: colores, tipografías, logos, radios, reglas (lo lee el agente y el CLI)
sistemas-diseno/<id>/SISTEMA.md     cómo se usa: qué es intocable, qué es flexible, ejemplos
sistemas-diseno/<id>/activos/       logos e imágenes de marca (SVG de preferencia)
```
Plantilla en `_plantilla/`. Flujo de importación: `flujos/sistema-diseno.md`.

## De dónde puede venir
| Origen | Cómo se importa |
| --- | --- |
| **Claude Design** | Si el agente es Claude con acceso a Claude Design (o a su skill de diseño), se le pide el sistema y se traducen sus tokens a `sistema.yaml`. Detalle en `CLAUDE.md`. |
| **Figma** | Con un conector/MCP de Figma: variables y estilos del archivo → `sistema.yaml`. |
| Manual de marca (PDF, web) | Se extraen colores, tipografías y reglas; los logos van a `activos/`. |
| A mano | La entrevista pregunta 4–6 datos (colores, tipografías, logo) y se escribe `sistema.yaml`. |

## Reglas
- Los colores se guardan en hex; las tipografías con su nombre real y su equivalente en `@fontsource` si existe (si no, se instala la fuente).
- Logos de terceros: permitidos por defecto (`jp.config.yaml → marcas_terceros`), con uso nominativo: nunca sugerir patrocinio y retirarlos si la marca lo pide. Cada uso se registra en `DECISIONES.md`.
- Un sistema no se modifica desde un video. Si un video necesita una variación, se escribe en su `diseno/guia-estilo.md`.
