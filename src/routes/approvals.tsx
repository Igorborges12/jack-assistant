import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppLayout } from "@/layouts/AppLayout";
import { Card, CardHeader } from "@/components/common/Card";
import { ApprovalCard } from "@/components/ApprovalCard";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { Modal } from "@/components/common/Modal";
import { approvalsService } from "@/services";
import type { Approval } from "@/types";

export const Route = createFileRoute("/approvals")({
  head: () => ({
    meta: [
      { title: "Approvals — Personal AI OS" },
      {
        name: "description",
        content: "Aprove ou recuse cada ação sugerida pelos agentes antes de qualquer execução.",
      },
      { property: "og:title", content: "Approvals — Personal AI OS" },
      {
        property: "og:description",
        content: "Aprove ou recuse cada ação sugerida pelos agentes antes de qualquer execução.",
      },
    ],
  }),
  component: ApprovalsPage,
});

function ApprovalsPage() {
  const approvals = useQuery({ queryKey: ["approvals"], queryFn: approvalsService.list });
  const [resolved, setResolved] = useState<Record<string, "approved" | "rejected">>({});
  const [details, setDetails] = useState<Approval | null>(null);

  const pending = (approvals.data ?? []).filter((item) => !resolved[item.id]);

  return (
    <AppLayout
      eyebrow="Controle humano"
      title="Approvals"
      subtitle="Nenhuma ação externa é executada sem a sua aprovação."
    >
      <div className="glass flex items-start gap-3 rounded-2xl border-l-4 border-l-amber p-4">
        <span aria-hidden className="text-lg text-amber">
          ⚠
        </span>
        <p className="text-[13px] text-muted-foreground">
          Os agentes apenas preparam ações. Enviar e-mails, candidatar-se a vagas ou confirmar eventos
          sempre exige a sua aprovação explícita nesta tela.
        </p>
      </div>

      <Card>
        <CardHeader
          title="Aguardando decisão"
          action={<span className="text-[11px] text-muted-foreground">{pending.length} pendentes</span>}
        />
        {approvals.isLoading ? (
          <LoadingState rows={3} />
        ) : pending.length === 0 ? (
          <EmptyState title="Nada pendente" description="Você revisou todas as ações sugeridas." />
        ) : (
          <div className="space-y-3">
            {pending.map((approval) => (
              <ApprovalCard
                key={approval.id}
                approval={approval}
                onApprove={(id) => setResolved((prev) => ({ ...prev, [id]: "approved" }))}
                onReject={(id) => setResolved((prev) => ({ ...prev, [id]: "rejected" }))}
                onDetails={setDetails}
              />
            ))}
          </div>
        )}
      </Card>

      <Modal open={details !== null} onClose={() => setDetails(null)} title={details?.action ?? ""}>
        {details?.description}
      </Modal>
    </AppLayout>
  );
}
