import { AgentBadge } from "@/components/common/AgentBadge";
import { Button } from "@/components/common/Button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate, formatTime } from "@/lib/format";
import type { Approval } from "@/types";

interface ApprovalCardProps {
  approval: Approval;
  compact?: boolean;
  onApprove?: (approval: Approval) => void;
  onReject?: (approval: Approval) => void;
  onDetails?: (approval: Approval) => void;
}

export function ApprovalCard({ approval, compact = false, onApprove, onReject, onDetails }: ApprovalCardProps) {
  const pending = approval.status === "pending";

  return (
    <div className="glass-soft rounded-2xl p-4">
      <div className="flex flex-wrap items-center gap-2">
        <AgentBadge agent={approval.agent} active />
        <span className="text-[11px] text-muted-foreground">
          {formatDate(approval.date)} · {formatTime(approval.date)}
        </span>
        {!pending ? (
          <StatusBadge
            className="ml-auto"
            label={approval.status === "approved" ? "Aprovada" : "Recusada"}
            tone={approval.status === "approved" ? "success" : "danger"}
          />
        ) : null}
      </div>
      <p className="mt-2 text-sm font-semibold">{approval.action}</p>
      {!compact ? <p className="mt-1 text-[13px] text-muted-foreground">{approval.description}</p> : null}

      {!pending && approval.decidedAt ? (
        <p className="mt-2 text-[11px] text-muted-foreground">
          Decisão em {formatDate(approval.decidedAt)} às {formatTime(approval.decidedAt)}
          {approval.status === "approved" && approval.external
            ? " · Autorizada, mas ainda não executada — depende de integração externa."
            : ""}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {pending ? (
          <>
            <Button size="sm" onClick={() => onApprove?.(approval)}>
              Aprovar
            </Button>
            <Button size="sm" variant="outline" onClick={() => onReject?.(approval)}>
              Recusar
            </Button>
          </>
        ) : null}
        <Button size="sm" variant="ghost" onClick={() => onDetails?.(approval)}>
          Ver detalhes
        </Button>
      </div>
    </div>
  );
}
