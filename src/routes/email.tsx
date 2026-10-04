import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "@/layouts/AppLayout";
import { Card, CardHeader } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { SelectInput, TextArea, TextInput } from "@/components/common/Field";
import { useDb } from "@/hooks/useDb";
import { emailService } from "@/services";
import { formatDate, formatTime } from "@/lib/format";
import type { EmailItem } from "@/types";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "E-mail — Jack" },
      { name: "description", content: "Caixa de entrada resumida, e-mails importantes e rascunhos preparados pelo Jack." },
      { property: "og:title", content: "E-mail — Jack" },
      { property: "og:description", content: "Caixa de entrada resumida, e-mails importantes e rascunhos preparados pelo Jack." },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  const emails = useDb((s) => s.emails);
  const drafts = useDb((s) => s.drafts);
  const [priority, setPriority] = useState("");
  const [open, setOpen] = useState<EmailItem | null>(null);
  const [draft, setDraft] = useState<{ to: string; subject: string; preview: string } | null>(null);

  const visible = emails.filter((e) => !priority || (priority === "alta" ? e.important : !e.important));

  function saveDraft() {
    if (!draft) return;
    if (!draft.to.trim() || !draft.subject.trim()) {
      toast.error("Informe destinatário e assunto.");
      return;
    }
    emailService.createDraft(draft);
    toast.success("Rascunho salvo. Nada foi enviado.");
    setDraft(null);
  }

  return (
    <AppLayout
      eyebrow="Agente de E-mail"
      title="E-mail"
      subtitle="Triagem e rascunhos preparados — nenhum e-mail é enviado sem sua aprovação."
      headerAction={<Button onClick={() => setDraft({ to: "", subject: "", preview: "" })}>+ Novo rascunho</Button>}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Caixa de entrada"
            action={
              <SelectInput
                aria-label="Filtrar por prioridade"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="py-1.5 text-[12px]"
                options={[
                  { value: "", label: "Todas" },
                  { value: "alta", label: "Importantes" },
                  { value: "normal", label: "Normais" },
                ]}
              />
            }
          />
          {visible.length === 0 ? (
            <EmptyState title="Nenhum e-mail" description="Nada corresponde a esse filtro." glyph="✉" />
          ) : (
            <div className="space-y-2.5">
              {visible.map((email) => (
                <button key={email.id} onClick={() => setOpen(email)} className="glass-soft block w-full rounded-xl px-3.5 py-3 text-left transition hover:bg-card/80">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold">{email.from}</p>
                    <div className="flex shrink-0 items-center gap-2">
                      {email.important ? <StatusBadge label="importante" tone="warning" /> : null}
                      <span className="text-[11px] text-muted-foreground">{formatTime(email.receivedAt)}</span>
                    </div>
                  </div>
                  <p className="truncate text-[13px]">{email.subject}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{email.preview}</p>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Rascunhos" description="Preparados, não enviados." />
          {drafts.length === 0 ? (
            <EmptyState title="Sem rascunhos" />
          ) : (
            <div className="space-y-2.5">
              {drafts.map((d) => (
                <div key={d.id} className="glass-soft rounded-xl px-3 py-2.5">
                  <p className="truncate text-sm font-medium">{d.subject}</p>
                  <p className="truncate text-[11px] text-muted-foreground">Para {d.to} · {d.preview}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Modal
        open={open !== null}
        onClose={() => setOpen(null)}
        title={open?.subject ?? ""}
        footer={
          open ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setOpen(null)}>Fechar</Button>
              <Button size="sm" onClick={() => { setDraft({ to: open.from, subject: `Re: ${open.subject}`, preview: "" }); setOpen(null); }}>
                Criar rascunho de resposta
              </Button>
            </>
          ) : null
        }
      >
        {open ? (
          <div className="space-y-2">
            <p className="text-[12px]">De {open.from} · {formatDate(open.receivedAt)} às {formatTime(open.receivedAt)}</p>
            <p className="text-foreground">{open.body}</p>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={draft !== null}
        onClose={() => setDraft(null)}
        title="Novo rascunho"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDraft(null)}>Cancelar</Button>
            <Button size="sm" onClick={saveDraft}>Salvar rascunho</Button>
          </>
        }
      >
        {draft ? (
          <div className="space-y-3">
            <TextInput label="Para *" value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} />
            <TextInput label="Assunto *" value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} />
            <TextArea label="Mensagem" value={draft.preview} onChange={(e) => setDraft({ ...draft, preview: e.target.value })} />
          </div>
        ) : null}
      </Modal>
    </AppLayout>
  );
}
