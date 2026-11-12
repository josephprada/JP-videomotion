# Registro de decisiones

Decisiones que afectan a **todo el repo** (no a un solo video), con fecha y razón. Las de un video van en su `LEEME.md`.
Incluye cada uso de marcas de terceros y cada sistema de diseño importado.

| Fecha | Decisión | Razón |
| --- | --- | --- |
| 2026-11-12 | Estilos `tarjetas`, `vox` y `capas` y kits `foco`, `ui`, `collage` y `capas` | Estudio de un video de referencia que compara técnicas (motion graphics, Vox-style, 2.5D) y cuyo propio montaje usa foco y continuidad. 3D (Three.js) queda fuera: sería un método aparte |
| 2026-11-12 | Render con `--raster gpu\|software`: gpu por defecto; `determinismo.sh` y `video.sh final` por software | El lienzo acelerado varía 1 nivel en algún píxel entre procesos (texto grande transformado); software es exacto pero ~45–70 % más lento |
