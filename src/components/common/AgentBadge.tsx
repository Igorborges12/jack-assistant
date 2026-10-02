import { AGENT_GLYPH, AGENT_LABELS } from "@/lib/agents";
import { cn } from "@/lib/utils";
import type { AgentId } from "@/types";

interface AgentBadgeProps {
  agent: AgentId;
  active?: boolean;
  className?: string;
}

export function AgentBadge({ agent, active = false, className }: AgentBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
        active
          ? "bg-brand/10 text-brand"
          : "glass-soft text-muted-foreground",
        className,
      )}
    >
      <span aria-hidden>{AGENT_GLYPH[agent]}</span>
      {AGENT_LABELS[agent]}
    </span>
  );
}
