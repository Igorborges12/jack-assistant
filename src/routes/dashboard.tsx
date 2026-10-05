import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/layouts/AppLayout";
import { Card, CardHeader } from "@/components/common/Card";
import { StatCard } from "@/components/StatCard";
import { ApprovalCard } from "@/components/ApprovalCard";
import { EventCard } from "@/components/EventCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { ChatInput } from "@/components/chat/ChatInput";
import { NotificationList } from "@/components/NotificationList";
import { useDb } from "@/hooks/useDb";
import { notificationsService } from "@/services";
import { CHAT_SUGGESTIONS } from "@/services/chatResponder";
import { greeting } from "@/lib/format";
import { mockUser } from "@/mocks";
import type { Approval } from "@/types";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Início — Jack" },
      { name: "description", content: "Resumo diário de vagas, e-mails, agenda, tarefas e ações pendentes." },
      { property: "og:title", content: "Início — Jack" },
      { property: "og:description", content: "Resumo diário de vagas, e-mails, agenda, tarefas e ações pendentes." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const [details, setDetails] = useState<Approval | null>(null);

  const jobs = useDb((s) => s.jobs);
  const emails = useDb((s) => s.emails);
  const events = useDb((s) => s.events);
  const tasks = useDb((s) => s.tasks);
  const approvals = useDb((s) => s.approvals);
  const notifications = useDb((s) => s.notifications);

  const pending = approvals.filter((a) => a.status === "pending");
  const todayEvents = events.filter((e) => e.date === "Hoje");
  const openTasks = tasks.filter((t) => !t.done);
  const unread = notifications.filter((n) => !n.read).length;

  const askJack = (q: string) => navigate({ to: "/chat", search: { q } });

  return (
    <AppLayout
      eyebrow={new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
      title={greeting(mockUser.name)}
      subtitle="Como posso ajudar hoje?"
    >
      <Card>
        <div className="flex items-center gap-3">
          <div className="gradient-brand shadow-brand grid size-10 shrink-0 place-items-center rounded-2xl text-lg text-primary-foreground">
            ✦
          </div>
          <div className="min-w-0 flex-1">
            <ChatInput onSend={askJack} />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {CHAT_SUGGESTIONS.map((chip) => (
            <button
              key={chip}
              onClick={() => askJack(chip)}
              className="glass-soft rounded-full px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground"
            >
              {chip}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard to="/career" label="Vagas" value={jobs.length} hint={(() => { const n = jobs.filter((j) => j.status === "new").length; return n === 1 ? "1 nova" : `${n} novas`; })()} tone="brand" />
        <StatCard to="/email" label="E-mails importantes" value={emails.filter((e) => e.important).length} hint="ver caixa de entrada" tone="amber" />
        <StatCard to="/agenda" label="Eventos hoje" value={todayEvents.length} hint={todayEvents[0] ? `próximo às ${todayEvents[0].time}` : "dia livre"} />
        <StatCard to="/agenda" label="Tarefas pendentes" value={openTasks.length} hint="abrir agenda" tone="mint" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Ações pendentes"
            description="Nenhuma ação externa é executada sem sua aprovação."
            action={
              <Link to="/approvals" className="text-[12px] font-semibold text-brand">
                Ver todas
              </Link>
            }
          />
          {pending.length === 0 ? (
            <EmptyState title="Tudo revisado" description="Nada aguardando sua decisão agora." glyph="✓" />
          ) : (
            <div className="space-y-3">
              {pending.slice(0, 3).map((approval) => (
                <ApprovalCard
                  key={approval.id}
                  approval={approval}
                  compact
                  onApprove={() => navigate({ to: "/approvals" })}
                  onReject={() => navigate({ to: "/approvals" })}
                  onDetails={setDetails}
                />
              ))}
            </div>
          )}
        </Card>

        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader title="Hoje" />
            {todayEvents.length === 0 ? (
              <EmptyState title="Dia livre" description="Nenhum evento hoje." glyph="▤" />
            ) : (
              <div className="space-y-3">
                {todayEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader
              title="Notificações"
              action={
                unread > 0 ? (
                  <button onClick={notificationsService.markAllRead} className="text-[11px] font-semibold text-brand">
                    Marcar como lidas
                  </button>
                ) : null
              }
            />
            <NotificationList items={notifications} />
          </Card>
        </div>
      </div>

      <Modal
        open={details !== null}
        onClose={() => setDetails(null)}
        title={details?.action ?? ""}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDetails(null)}>
              Fechar
            </Button>
            <Button size="sm" onClick={() => navigate({ to: "/approvals" })}>
              Ir para Aprovações
            </Button>
          </>
        }
      >
        {details?.description}
      </Modal>
    </AppLayout>
  );
}
