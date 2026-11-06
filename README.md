# JP-videomotion

Un estudio de video que manejas conversando con tu agente de IA. Le cuentas qué video quieres; te hace las preguntas
justas y lo produce contigo fase por fase: guion, voz, diseño, animación, música, subtítulos y entrega. En cada paso
importante te muestra el resultado y espera tu aprobación.

Sirve para historias narradas, explicadores, promos de producto, tutoriales o lo que necesites. Los videos se animan
en código, así que el render es reproducible y los personajes no cambian de una toma a otra.

## Empezar
Abre tu agente (Claude Code, u otro que lea `AGENTS.md`) en la carpeta donde quieres el proyecto y dile:

> Clona `https://github.com/josephprada/JP-videomotion` aquí y configúralo.

El agente lo descarga, revisa tu equipo y te hace una primera pregunta: **¿todo por defecto o configurado para tus casos de uso?**
Al terminar, **abre tu agente dentro de la carpeta del proyecto** (así carga sus instrucciones y atajos) y, cada vez que
quieras un video, dile **«nuevo video»**.

## Qué necesita tu equipo
Node.js 20+, ffmpeg, Google Chrome (o Chromium/Edge), git y bash (en Windows viene con Git for Windows).
Opcionales: whisper.cpp (tiempos de la voz y subtítulos automáticos), git-lfs (videos finales), Python con librosa (pistas de música entregadas).
El agente lo revisa con `node nucleo/jp.mjs doctor` y te dice cómo instalar lo que falte.

## Cómo está organizado
- **Perfiles**: qué tipo de video (y qué fases tiene).
- **Estilos**: cómo se ve.
- **Métodos**: cómo se produce (animación en código, HyperFrames o IA generativa).
- **Sistemas de diseño**: tu marca (desde Claude Design, Figma, un manual o a mano).
- **Universos**: personajes que se repiten entre videos.
- **Videos**: uno por carpeta, todos con la misma estructura.

Detalle técnico en `AGENTS.md` (todos los agentes) y `CLAUDE.md` (soporte extra para Claude).

## Créditos
- Tipografía cinética: [typefx](https://github.com/lorena-bordonaba-pau/typefx) de Lorena Bordonaba (MIT), incluido en `nucleo/vendor/typefx`.
- Fuentes Anybody y JetBrains Mono (SIL Open Font License).

## Licencia
MIT (ver `LICENSE`).
