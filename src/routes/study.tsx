import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/layouts/AppLayout";
import { Card, CardHeader } from "@/components/common/Card";
import { LoadingState } from "@/components/common/LoadingState";
import { studyService } from "@/services";

export const Route = createFileRoute("/study")({
  head: () => ({
    meta: [
      { title: "Study — Personal AI OS" },
      {
        name: "description",
        content: "Estudos de hoje, cursos, matérias, progresso e próximos blocos de estudo.",
      },
      { property: "og:title", content: "Study — Personal AI OS" },
      {
        property: "og:description",
        content: "Estudos de hoje, cursos, matérias, progresso e próximos blocos de estudo.",
      },
    ],
  }),
  component: StudyPage,
});

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-foreground/8">
      <div className="gradient-brand h-full rounded-full" style={{ width: `${value}%` }} />
    </div>
  );
}

function StudyPage() {
  const today = useQuery({ queryKey: ["study-today"], queryFn: studyService.today });
  const next = useQuery({ queryKey: ["study-next"], queryFn: studyService.next });
  const courses = useQuery({ queryKey: ["courses"], queryFn: studyService.courses });
  const subjects = useQuery({ queryKey: ["subjects"], queryFn: studyService.subjects });

  return (
    <AppLayout eyebrow="Study Agent" title="Study" subtitle="Seu plano de estudos acompanhado de perto.">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Estudos de hoje" />
          {today.isLoading ? (
            <LoadingState rows={2} />
          ) : (
            <div className="space-y-2.5">
              {(today.data ?? []).map((session) => (
                <div
                  key={session.id}
                  className="glass-soft flex items-center justify-between gap-3 rounded-xl px-3.5 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{session.subject}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{session.topic}</p>
                  </div>
                  <span className="shrink-0 text-[11px] font-semibold text-brand">
                    {session.time} · {session.durationMin}min
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Próximos estudos" />
          <div className="space-y-2.5">
            {(next.data ?? []).map((session) => (
              <div key={session.id} className="glass-soft rounded-xl px-3 py-2.5">
                <p className="text-sm font-medium">{session.subject}</p>
                <p className="text-[11px] text-muted-foreground">
                  {session.topic} · {session.time}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Cursos" />
          <div className="space-y-3.5">
            {(courses.data ?? []).map((course) => (
              <div key={course.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-medium">{course.name}</p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {course.progress}%
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">{course.provider}</p>
                <ProgressBar value={course.progress} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Matérias e progresso" />
          <div className="space-y-3.5">
            {(subjects.data ?? []).map((subject) => (
              <div key={subject.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-medium">{subject.name}</p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {subject.hoursThisWeek}h esta semana
                  </span>
                </div>
                <ProgressBar value={subject.progress} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
