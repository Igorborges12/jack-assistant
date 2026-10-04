import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/layouts/AppLayout";
import { Card, CardHeader } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { AgentBadge } from "@/components/common/AgentBadge";
import { mockUser } from "@/mocks";
import type { AgentId } from "@/types";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Configurações — Jack" },
      {
        name: "description",
        content: "Perfil, agentes ativos e preferências de aprovação do Jack.",
      },
      { property: "og:title", content: "Configurações — Jack" },
      {
        property: "og:description",
        content: "Perfil, agentes ativos e preferências de aprovação do Jack.",
      },
    ],
  }),
  component: SettingsPage,
});

const agents: AgentId[] = ["orchestrator", "career", "email", "study", "life"];

function SettingsPage() {
  const navigate = useNavigate();

  return (
    <AppLayout eyebrow="Conta" title="Configurações" subtitle="Perfil, agentes e preferências.">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Perfil" />
          <div className="flex items-center gap-3">
            <div className="gradient-brand grid size-12 place-items-center rounded-full text-sm font-semibold text-primary-foreground">
              {mockUser.initials}
            </div>
            <div>
              <p className="text-sm font-semibold">{mockUser.name}</p>
              <p className="text-[12px] text-muted-foreground">{mockUser.email}</p>
              <p className="text-[11px] text-brand">{mockUser.plan}</p>
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            <Button size="sm">Editar perfil</Button>
            <Button size="sm" variant="outline" onClick={() => navigate({ to: "/" })}>
              Sair
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader title="Agentes" description="Módulos que o Jack coordena." />
          <div className="flex flex-wrap gap-2">
            {agents.map((agent) => (
              <AgentBadge key={agent} agent={agent} active />
            ))}
          </div>
          <p className="mt-4 text-[12px] text-muted-foreground">
            Os agentes serão conectados ao backend em Python + FastAPI na próxima etapa.
          </p>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Aprovações" description="Como os agentes devem agir." />
          <div className="space-y-2.5">
            {[
              "Pedir aprovação antes de enviar e-mails",
              "Pedir aprovação antes de enviar candidaturas",
              "Pedir aprovação antes de criar ou confirmar eventos",
            ].map((label) => (
              <div
                key={label}
                className="glass-soft flex items-center justify-between rounded-xl px-3.5 py-3"
              >
                <span className="text-sm">{label}</span>
                <span className="gradient-brand rounded-full px-3 py-1 text-[11px] font-semibold text-primary-foreground">
                  Sempre
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
