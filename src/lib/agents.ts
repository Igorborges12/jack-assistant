import type { AgentId } from "@/types";

export const AGENT_LABELS: Record<AgentId, string> = {
  orchestrator: "Orquestrador",
  career: "Carreira",
  email: "E-mail",
  study: "Estudos",
  life: "Vida",
};

export const AGENT_GLYPH: Record<AgentId, string> = {
  orchestrator: "✦",
  career: "◈",
  email: "✉",
  study: "✎",
  life: "▤",
};
