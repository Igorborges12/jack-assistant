import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/layouts/AppLayout";
import { Card, CardHeader } from "@/components/common/Card";
import { EventCard } from "@/components/EventCard";
import { TaskCard } from "@/components/TaskCard";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { calendarService, tasksService } from "@/services";

export const Route = createFileRoute("/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda — Personal AI OS" },
      {
        name: "description",
        content: "Eventos, compromissos e tarefas organizados pelo Life Agent.",
      },
      { property: "og:title", content: "Agenda — Personal AI OS" },
      {
        property: "og:description",
        content: "Eventos, compromissos e tarefas organizados pelo Life Agent.",
      },
    ],
  }),
  component: AgendaPage,
});

function AgendaPage() {
  const events = useQuery({ queryKey: ["events"], queryFn: calendarService.events });
  const tasks = useQuery({ queryKey: ["tasks"], queryFn: tasksService.list });

  const todayEvents = (events.data ?? []).filter((event) => event.date === "Hoje");
  const upcoming = (events.data ?? []).filter((event) => event.date !== "Hoje");

  return (
    <AppLayout eyebrow="Life Agent" title="Agenda" subtitle="Seu dia e seus compromissos em uma visão só.">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Hoje" />
          {events.isLoading ? (
            <LoadingState rows={3} />
          ) : todayEvents.length === 0 ? (
            <EmptyState title="Dia livre" description="Nenhum compromisso agendado para hoje." />
          ) : (
            <div className="space-y-3">
              {todayEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Próximos eventos" />
          <div className="space-y-3">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Tarefas" />
        {tasks.isLoading ? (
          <LoadingState rows={3} />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {(tasks.data ?? []).map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </Card>
    </AppLayout>
  );
}
