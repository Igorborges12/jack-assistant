import { AgentBadge } from "@/components/common/AgentBadge";
import { Button } from "@/components/common/Button";
import { formatDate, formatTime } from "@/lib/format";
import type { Approval } from "@/types";

interface ApprovalCardProps {
  approval: Approval;
  compact?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onDetails?: (approval: Approval) => void;
}

export function ApprovalCard({
  approval,
  compact = false,
  onApprove,
  onReject,
  onDetails,
}: ApprovalCardProps) {
  return (
    <div className="glass-soft rounded-2xl p-4">
      <div className="flex flex-wrap items-center gap-2">
        <AgentBadge agent={approval.agent} active />
        <span className="text-[11px] text-muted-foreground">
          {formatDate(approval.date)} · {formatTime(approval.date)}
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold">{approval.action}</p>
      {!compact ? (
        <p className="mt-1 text-[13px] text-muted-foreground">{approval.description}</p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => onApprove?.(approval.id)}>
          Aprovar
        </Button>
        <Button size="sm" variant="outline" onClick={() => onReject?.(approval.id)}>
          Recusar
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onDetails?.(approval)}>
          Ver detalhes
        </Button>
      </div>
    </div>
  );
}
