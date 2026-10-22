// ¿Qué agente está trabajando en el repo? Se detecta del entorno; si no hay pistas, el agente se declara o se pregunta.
// AI_AGENT es la convención emergente (Claude Code la define: «claude-code_<versión>_agent»); CLAUDECODE=1 es la de Claude Code.
// El resultado va en .jp/local.yaml (no se versiona): cada persona puede trabajar el mismo repo con un agente distinto.
export function detectarAgente(env = process.env) {
  const ai = (env.AI_AGENT || "").trim();
  if (ai) return { id: ai.split("_")[0], fuente: "AI_AGENT" };
  if (env.CLAUDECODE === "1") return { id: "claude-code", fuente: "CLAUDECODE" };
  return null;
}
