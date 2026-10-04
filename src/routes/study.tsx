import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "@/layouts/AppLayout";
import { Card, CardHeader } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { EmptyState } from "@/components/common/EmptyState";
import { TextInput } from "@/components/common/Field";
import { useDb } from "@/hooks/useDb";
import { studyService } from "@/services";

export const Route = createFileRoute("/study")({
  head: () => ({
    meta: [
      { title: "Estudos — Jack" },
      { name: "description", content: "Estudos de hoje, cursos, matérias, progresso e próximos blocos de estudo." },
      { property: "og:title", content: "Estudos — Jack" },
      { property: "og:description", content: "Estudos de hoje, cursos, matérias, progresso e próximos blocos de estudo." },
    ],
  }),
  component: StudyPage,
});

type FormKind = "subject" | "course" | "session";

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-foreground/8">
      <div className="gradient-brand h-full rounded-full transition-all" style={{ width: `${value}%` }} />
    </div>
  );
}

function StudyPage() {
  const today = useDb((s) => s.studyToday);
  const next = useDb((s) => s.studyNext);
  const courses = useDb((s) => s.courses);
  const subjects = useDb((s) => s.subjects);
  const [form, setForm] = useState<FormKind | null>(null);
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [c, setC] = useState("");

  function openForm(kind: FormKind) {
    setA(""); setB(""); setC("");
    setForm(kind);
  }

  function submit() {
    if (!a.trim()) {
      toast.error("Preencha o nome.");
      return;
    }
    if (form === "subject") studyService.addSubject({ name: a, hoursThisWeek: Number(b) || 0, progress: 0 });
    if (form === "course") studyService.addCourse({ name: a, provider: b || "—", progress: 0 });
    if (form === "session") studyService.addSession({ subject: a, topic: b || "—", time: c || "A definir", durationMin: 45 });
    toast.success("Cadastrado com sucesso.");
    setForm(null);
  }

  const labels: Record<FormKind, [string, string, string?]> = {
    subject: ["Matéria *", "Horas nesta semana"],
    course: ["Curso *", "Plataforma"],
    session: ["Matéria *", "Tópico", "Quando (ex.: Sexta, 19:00)"],
  };

  return (
    <AppLayout eyebrow="Agente de Estudos" title="Estudos" subtitle="Seu plano de estudos acompanhado de perto.">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Estudos de hoje" />
          {today.length === 0 ? (
            <EmptyState title="Nada para hoje" glyph="✎" />
          ) : (
            <div className="space-y-2.5">
              {today.map((s) => (
                <div key={s.id} className="glass-soft flex items-center justify-between gap-3 rounded-xl px-3.5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{s.subject}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{s.topic}</p>
                  </div>
                  <span className="shrink-0 text-[11px] font-semibold text-brand">{s.time} · {s.durationMin}min</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Próximos estudos" action={<Button size="sm" variant="outline" onClick={() => openForm("session")}>+ Sessão</Button>} />
          {next.length === 0 ? (
            <EmptyState title="Sem sessões agendadas" />
          ) : (
            <div className="space-y-2.5">
              {next.map((s) => (
                <div key={s.id} className="glass-soft rounded-xl px-3 py-2.5">
                  <p className="text-sm font-medium">{s.subject}</p>
                  <p className="text-[11px] text-muted-foreground">{s.topic} · {s.time}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Cursos" action={<Button size="sm" variant="outline" onClick={() => openForm("course")}>+ Curso</Button>} />
          {courses.length === 0 ? (
            <EmptyState title="Nenhum curso" />
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.id}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium">{course.name}</p>
                    <div className="flex shrink-0 items-center gap-1">
                      <button aria-label="Diminuir progresso" onClick={() => studyService.updateCourseProgress(course.id, course.progress - 10)} className="glass-soft size-6 rounded-md text-xs">−</button>
                      <span className="w-9 text-center text-[11px] text-muted-foreground">{course.progress}%</span>
                      <button aria-label="Aumentar progresso" onClick={() => studyService.updateCourseProgress(course.id, course.progress + 10)} className="glass-soft size-6 rounded-md text-xs">+</button>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{course.provider}</p>
                  <ProgressBar value={course.progress} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Matérias e progresso" action={<Button size="sm" variant="outline" onClick={() => openForm("subject")}>+ Matéria</Button>} />
          {subjects.length === 0 ? (
            <EmptyState title="Nenhuma matéria" />
          ) : (
            <div className="space-y-3.5">
              {subjects.map((s) => (
                <div key={s.id}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium">{s.name}</p>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{s.hoursThisWeek}h esta semana</span>
                  </div>
                  <ProgressBar value={s.progress} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Modal
        open={form !== null}
        onClose={() => setForm(null)}
        title={form === "subject" ? "Nova matéria" : form === "course" ? "Novo curso" : "Nova sessão de estudo"}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setForm(null)}>Cancelar</Button>
            <Button size="sm" onClick={submit}>Salvar</Button>
          </>
        }
      >
        {form ? (
          <div className="space-y-3">
            <TextInput label={labels[form][0]} value={a} onChange={(e) => setA(e.target.value)} />
            <TextInput label={labels[form][1]} type={form === "subject" ? "number" : "text"} value={b} onChange={(e) => setB(e.target.value)} />
            {labels[form][2] ? <TextInput label={labels[form][2]} value={c} onChange={(e) => setC(e.target.value)} /> : null}
          </div>
        ) : null}
      </Modal>
    </AppLayout>
  );
}
