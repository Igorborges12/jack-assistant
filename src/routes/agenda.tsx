import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "@/layouts/AppLayout";
import { Card, CardHeader } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { EventCard } from "@/components/EventCard";
import { TaskCard } from "@/components/TaskCard";
import { EmptyState } from "@/components/common/EmptyState";
import { SelectInput, TextInput, toOptions } from "@/components/common/Field";
import { useDb } from "@/hooks/useDb";
import { calendarService, tasksService } from "@/services";
import type { CalendarEvent } from "@/types";

export const Route = createFileRoute("/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda — Jack" },
      { name: "description", content: "Eventos, compromissos e tarefas organizados pelo Agente de Vida." },
      { property: "og:title", content: "Agenda — Jack" },
      { property: "og:description", content: "Eventos, compromissos e tarefas organizados pelo Agente de Vida." },
    ],
  }),
  component: AgendaPage,
});

const KINDS = ["Reunião", "Foco", "Pessoal", "Estudo"] as const;
const emptyEvent = (): Omit<CalendarEvent, "id"> => ({ title: "", time: "09:00", date: "Hoje", kind: "Reunião", location: "" });

function AgendaPage() {
  const events = useDb((s) => s.events);
  const tasks = useDb((s) => s.tasks);
  const [viewing, setViewing] = useState<CalendarEvent | null>(null);
  const [draft, setDraft] = useState<Omit<CalendarEvent, "id"> | null>(null);

  const todayEvents = events.filter((e) => e.date === "Hoje");
  const upcoming = events.filter((e) => e.date !== "Hoje");

  function save() {
    if (!draft?.title.trim()) {
      toast.error("Informe o título do compromisso.");
      return;
    }
    calendarService.addEvent(draft);
    toast.success("Compromisso adicionado localmente. Nenhum calendário externo foi alterado.");
    setDraft(null);
  }

  const renderEvents = (list: CalendarEvent[]) => (
    <div className="space-y-3">
      {list.map((event) => (
        <button key={event.id} onClick={() => setViewing(event)} className="block w-full rounded-xl p-1 text-left transition hover:bg-card/60">
          <EventCard event={event} />
        </button>
      ))}
    </div>
  );

  return (
    <AppLayout
      eyebrow="Agente de Vida"
      title="Agenda"
      subtitle="Seu dia e seus compromissos em uma visão só."
      headerAction={<Button onClick={() => setDraft(emptyEvent())}>+ Compromisso</Button>}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Hoje" action={<Button size="sm" variant="outline" className="sm:hidden" onClick={() => setDraft(emptyEvent())}>+ Novo</Button>} />
          {todayEvents.length === 0 ? <EmptyState title="Dia livre" description="Nenhum compromisso hoje." glyph="▤" /> : renderEvents(todayEvents)}
        </Card>
        <Card>
          <CardHeader title="Próximos eventos" />
          {upcoming.length === 0 ? <EmptyState title="Nada agendado" /> : renderEvents(upcoming)}
        </Card>
      </div>

      <Card>
        <CardHeader title="Tarefas" description={`${tasks.filter((t) => !t.done).length} pendentes`} />
        {tasks.length === 0 ? (
          <EmptyState title="Nenhuma tarefa" />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onToggle={() => tasksService.toggle(task.id)} />
            ))}
          </div>
        )}
      </Card>

      <Modal open={viewing !== null} onClose={() => setViewing(null)} title={viewing?.title ?? ""}>
        {viewing ? (
          <dl className="grid grid-cols-2 gap-2 text-[13px]">
            <dt>Quando</dt><dd className="text-foreground">{viewing.date}, {viewing.time}</dd>
            <dt>Tipo</dt><dd className="text-foreground">{viewing.kind}</dd>
            <dt>Local</dt><dd className="text-foreground">{viewing.location || "—"}</dd>
          </dl>
        ) : null}
      </Modal>

      <Modal
        open={draft !== null}
        onClose={() => setDraft(null)}
        title="Novo compromisso"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDraft(null)}>Cancelar</Button>
            <Button size="sm" onClick={save}>Salvar</Button>
          </>
        }
      >
        {draft ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <TextInput label="Título *" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </div>
            <TextInput label="Dia" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
            <TextInput label="Horário" type="time" value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} />
            <SelectInput label="Tipo" value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value as CalendarEvent["kind"] })} options={toOptions(KINDS)} />
            <TextInput label="Local" value={draft.location ?? ""} onChange={(e) => setDraft({ ...draft, location: e.target.value })} />
          </div>
        ) : null}
      </Modal>
    </AppLayout>
  );
}
