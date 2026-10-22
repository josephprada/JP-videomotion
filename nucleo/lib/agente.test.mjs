import test from "node:test";
import assert from "node:assert/strict";
import { detectarAgente } from "./agente.mjs";

test("detectarAgente: AI_AGENT manda y se queda con el nombre sin la versión", () => {
  assert.deepEqual(detectarAgente({ AI_AGENT: "claude-code_2-1-306_agent" }), { id: "claude-code", fuente: "AI_AGENT" });
  assert.deepEqual(detectarAgente({ AI_AGENT: "otro-agente" }), { id: "otro-agente", fuente: "AI_AGENT" });
});

test("detectarAgente: CLAUDECODE=1 identifica a Claude Code aunque falte AI_AGENT", () => {
  assert.deepEqual(detectarAgente({ CLAUDECODE: "1" }), { id: "claude-code", fuente: "CLAUDECODE" });
});

test("detectarAgente: sin pistas devuelve null (el agente se declara o se pregunta)", () => {
  assert.equal(detectarAgente({}), null);
  assert.equal(detectarAgente({ AI_AGENT: "  " }), null);
});
