# Recursos del video

Imágenes, mapas, siluetas, logos y fotos que usan las escenas. Cada archivo se registra aquí con su origen:
sin origen claro, no entra en un video publicado.

| Archivo | Qué es | Origen | Licencia o permiso |
| --- | --- | --- | --- |
| `ejemplo-grabado.jpg` | Ilustración tipo grabado de un barco | Generada con IA: jp-skill-image, prompt «…» | Propia (generada) |

- **Generadas con IA** (p. ej. con la skill jp-skill-image): se anota el prompt exacto, para poder rehacerla o variarla.
  Una imagen generada es una **ilustración**, nunca un documento de archivo: no se presenta como foto o mapa histórico real.
- **Hechos verificables** (mapas reales, personas, lugares, datos): fuentes reales con licencia (dominio público, CC, permiso escrito).
- Las escenas cargan estas imágenes con `ESCENA.crear({ cargar })` (ruta `../../recursos/<archivo>` desde `escenas/<escena>/`).
