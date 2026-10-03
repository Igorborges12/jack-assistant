import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/layouts/AppLayout";
import { Card, CardHeader } from "@/components/common/Card";
import { ApprovalCard } from "@/components/ApprovalCard";
import { LoadingState } from "@/components/common/LoadingState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { approvalsService, emailService } from "@/services";
import { formatTime } from "@/lib/format";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Email — Jack" },
      {
        name: "description",
        content: "Inbox resumido, e-mails importantes, rascunhos e ações aguardando aprovação.",
      },
      { property: "og:title", content: "Email — Jack" },
      {
        property: "og:description",
        content: "Inbox resumido, e-mails importantes, rascunhos e ações aguardando aprovação.",
      },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  const inbox = useQuery({ queryKey: ["inbox"], queryFn: emailService.inbox });
  const drafts = useQuery({ queryKey: ["drafts"], queryFn: emailService.drafts });
  const approvals = useQuery({ queryKey: ["approvals"], queryFn: approvalsService.list });

  const important = (inbox.data ?? []).filter((email) => email.important);
  const emailApprovals = (approvals.data ?? []).filter((item) => item.agent === "email");

  return (
    <AppLayout eyebrow="Email Agent" title="Email" subtitle="Triagem e respostas preparadas para você.">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Inbox resumido" />
          {inbox.isLoading ? (
            <LoadingState rows={4} />
          ) : (
            <div className="space-y-2.5">
              {(inbox.data ?? []).map((email) => (
                <div key={email.id} className="glass-soft rounded-xl px-3.5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold">{email.from}</p>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {formatTime(email.receivedAt)}
                    </span>
                  </div>
                  <p className="truncate text-[13px]">{email.subject}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{email.preview}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Importantes" />
            <div className="space-y-2.5">
              {important.map((email) => (
                <div key={email.id} className="glass-soft rounded-xl px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{email.subject}</p>
                    <StatusBadge label="urgente" tone="warning" />
                  </div>
                  <p className="truncate text-[11px] text-muted-foreground">{email.from}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Rascunhos" />
            <div className="space-y-2.5">
              {(drafts.data ?? []).map((draft) => (
                <div key={draft.id} className="glass-soft rounded-xl px-3 py-2.5">
                  <p className="truncate text-sm font-medium">{draft.subject}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    Para {draft.to} · {draft.preview}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader
          title="Ações pendentes"
          description="Nenhum e-mail é enviado sem a sua aprovação."
        />
        <div className="space-y-3">
          {emailApprovals.map((approval) => (
            <ApprovalCard key={approval.id} approval={approval} />
          ))}
        </div>
      </Card>
    </AppLayout>
  );
}
