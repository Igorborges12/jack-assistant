import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "@/layouts/AppLayout";
import { Card, CardHeader } from "@/components/common/Card";
import { ApprovalCard } from "@/components/ApprovalCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Modal } from "@/components/common/Modal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { AgentBadge } from "@/components/common/AgentBadge";
import { useDb } from "@/hooks/useDb";
import { approvalsService } from "@/services";
import { formatDate, formatTime } from "@/lib/format";
import type { Approval } from "@/types";

export const Route = createFileRoute("/approvals")({
  head: () => ({
    meta: [
      { title: "Aprovações — Jack" },
      { name: "description", content: "Aprove ou recuse cada ação preparada pelo Jack antes de qualquer execução." },
      { property: "og:title", content: "Aprovações — Jack" },
      { property: "og:description", content: "Aprove ou recuse cada ação preparada pelo Jack antes de qualquer execução." },
    ],
  }),
  component: ApprovalsPage,
});

function ApprovalsPage() {
  const approvals = useDb((s) => s.approvals);
  const [details, setDetails] = useState<Approval | null>(null);
  const [confirming, setConfirming] = useState<Approval | null>(null);

  const pending = approvals.filter((a) => a.status === "pending");
  const decided = approvals.filter((a) => a.status !== "pending");

  async function approve(approval: Approval) {
    await approvalsService.decide(approval.id, "approved");
    setConfirming(null);
    toast.success(
      approval.external ? "Ação autorizada. Ela ainda não foi executada — depende de integração externa." : "Ação aprovada.",
    );
  }

  async function reject(approval: Approval) {
    await approvalsService.decide(approval.id, "rejected");
    toast("Ação recusada.");
  }

  return (
    <AppLayout eyebrow="Controle humano" title="Aprovações" subtitle="Nenhuma ação externa é executada sem a sua aprovação.">
      <div className="glass flex items-start gap-3 rounded-2xl border-l-4 border-l-amber p-4">
        <span aria-hidden className="text-lg text-amber">⚠</span>
        <p className="text-[13px] text-muted-foreground">
          O Jack apenas prepara ações. Enviar e-mails, candidatar-se a vagas ou confirmar eventos sempre exige sua
          aprovação explícita. Nesta versão, nenhuma ação externa real é executada.
        </p>
      </div>

      <Card>
        <CardHeader title="Aguardando decisão" action={<span className="text-[11px] text-muted-foreground">{pending.length} pendentes</span>} />
        {pending.length === 0 ? (
          <EmptyState title="Nada pendente" description="Você revisou todas as ações sugeridas." glyph="✓" />
        ) : (
          <div className="space-y-3">
            {pending.map((a) => (
              <ApprovalCard key={a.id} approval={a} onApprove={setConfirming} onReject={reject} onDetails={setDetails} />
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Histórico de decisões" />
        {decided.length === 0 ? (
          <EmptyState title="Sem decisões ainda" description="Aprovações e recusas aparecerão aqui." />
        ) : (
          <div className="space-y-3">
            {decided.map((a) => (
              <ApprovalCard key={a.id} approval={a} onDetails={setDetails} />
            ))}
          </div>
        )}
      </Card>

      <Modal open={details !== null} onClose={() => setDetails(null)} title={details?.action ?? ""}>
        {details ? (
          <div className="space-y-3">
            <AgentBadge agent={details.agent} active />
            <p>{details.description}</p>
            <p className="text-[12px]">
              Solicitada em {formatDate(details.date)} às {formatTime(details.date)}
              {details.decidedAt ? ` · Decidida em ${formatDate(details.decidedAt)} às ${formatTime(details.decidedAt)}` : ""}
            </p>
            {details.external ? <p className="text-[12px]">Depende de integração externa para ser executada.</p> : null}
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={confirming !== null}
        title="Confirmar aprovação?"
        confirmLabel="Aprovar"
        onCancel={() => setConfirming(null)}
        onConfirm={() => confirming && approve(confirming)}
      >
        {confirming ? (
          <>
            Você está autorizando: <strong className="text-foreground">{confirming.action}</strong>.
            {confirming.external ? " Esta ação depende de uma integração externa e ficará como autorizada, mas não executada." : ""}
          </>
        ) : null}
      </ConfirmDialog>
    </AppLayout>
  );
}
