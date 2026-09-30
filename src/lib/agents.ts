import type { AgentId } from "@/types";

export const AGENT_LABELS: Record<AgentId, string> = {
  orchestrator: "Orchestrator",
  career: "Career",
  email: "Email",
  study: "Study",
  life: "Life",
};

export const AGENT_GLYPH: Record<AgentId, string> = {
  orchestrator: "✦",
  career: "◈",
  email: "✉",
  study: "✎",
  life: "▤",
};
