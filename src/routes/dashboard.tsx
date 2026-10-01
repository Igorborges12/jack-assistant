import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppLayout } from "@/layouts/AppLayout";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/StatCard";
import { ApprovalCard } from "@/components/ApprovalCard";
import { EventCard } from "@/components/EventCard";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { ChatInput } from "@/components/chat/ChatInput";
import { approvalsService, calendarService, dashboardService } from "@/services";
import { greeting } from "@/lib/format";
import { mockUser } from "@/mocks";
import type { Approval } from "@/types";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Personal AI OS" },
      {
        name: "description",
        content: "Resumo diário de vagas, e-mails, agenda, tarefas e ações pendentes.",
      },
      { property: "og:title", content: "Dashboard — Personal AI OS" },
      {
        property: "og:description",
        content: "Resumo diário de vagas, e-mails, agenda, tarefas e ações pendentes.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const [details, setDetails] = useState<Approval | null>(null);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const summary = useQuery({ queryKey: ["summary"], queryFn: dashboardService.summary });
  const approvals = useQuery({ queryKey: ["approvals"], queryFn: approvalsService.list });
  const events = useQuery({ queryKey: ["events"], queryFn: calendarService.events });

  const pending = (approvals.data ?? []).filter((item) => !dismissed.includes(item.id));

  return (
    <AppLayout
      eyebrow={new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
      title={greeting(mockUser.name)}
      subtitle="How can I help you today?"
    >
      <Card>
        <div className="flex items-center gap-3">
          <div className="gradient-brand shadow-brand grid size-10 shrink-0 place-items-center rounded-2xl text-lg text-primary-foreground">
            ✦
          </div>
          <div className="flex-1">
            <ChatInput onSend={() => navigate({ to: "/chat" })} />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {["Resumir meus e-mails", "Buscar novas vagas", "Planejar meu dia", "Agendar estudo"].map(
            (chip) => (
              <span
                key={chip}
                className="glass-soft rounded-full px-3 py-1.5 text-xs text-muted-foreground"
              >
                {chip}
              </span>
            ),
          )}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Vagas" value={summary.data?.jobs ?? "—"} hint="novas esta semana" tone="brand" />
        <StatCard
          label="E-mails importantes"
          value={summary.data?.importantEmails ?? "—"}
          hint="2 aguardam resposta"
          tone="amber"
        />
        <StatCard label="Eventos hoje" value={summary.data?.eventsToday ?? "—"} hint="próximo às 14:00" />
        <StatCard
          label="Tarefas pendentes"
          value={summary.data?.pendingTasks ?? "—"}
          hint="1 vence hoje"
          tone="mint"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Ações pendentes"
            description="Nenhuma ação externa é executada sem sua aprovação."
            action={
              <span className="text-[11px] text-muted-foreground">{pending.length} aguardando</span>
            }
          />
          {approvals.isLoading ? (
            <LoadingState rows={3} />
          ) : pending.length === 0 ? (
            <EmptyState title="Tudo aprovado" description="Nada aguardando sua decisão agora." />
          ) : (
            <div className="space-y-3">
              {pending.map((approval) => (
                <ApprovalCard
                  key={approval.id}
                  approval={approval}
                  compact
                  onApprove={(id) => setDismissed((prev) => [...prev, id])}
                  onReject={(id) => setDismissed((prev) => [...prev, id])}
                  onDetails={setDetails}
                />
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Hoje" />
          {events.isLoading ? (
            <LoadingState rows={3} />
          ) : (
            <div className="space-y-3">
              {(events.data ?? [])
                .filter((event) => event.date === "Hoje")
                .map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
            </div>
          )}
        </Card>
      </div>

      <Modal
        open={details !== null}
        onClose={() => setDetails(null)}
        title={details?.action ?? ""}
      >
        {details?.description}
      </Modal>
    </AppLayout>
  );
}
