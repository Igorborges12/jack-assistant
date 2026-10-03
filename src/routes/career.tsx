import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "@/layouts/AppLayout";
import { Card, CardHeader } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { SelectInput, TextArea, TextInput, toOptions } from "@/components/common/Field";
import { JOB_STATUS_LABEL, JobCard } from "@/components/JobCard";
import { useDb } from "@/hooks/useDb";
import { careerService } from "@/services";
import { formatDate } from "@/lib/format";
import { APPLICATION_STAGES, type ApplicationStage, type Job, type JobStatus } from "@/types";

export const Route = createFileRoute("/career")({
  head: () => ({
    meta: [
      { title: "Carreira — Jack" },
      { name: "description", content: "Vagas, candidaturas, empresas monitoradas e currículos em um só lugar." },
      { property: "og:title", content: "Carreira — Jack" },
      { property: "og:description", content: "Vagas, candidaturas, empresas monitoradas e currículos em um só lugar." },
    ],
  }),
  component: CareerPage,
});

const MODALITIES = ["Remoto", "Híbrido", "Presencial"] as const;
const STATUS_OPTIONS = (Object.keys(JOB_STATUS_LABEL) as JobStatus[]).map((v) => ({ value: v, label: JOB_STATUS_LABEL[v] }));

type JobDraft = Omit<Job, "id"> & { id?: string };

const emptyJob = (): JobDraft => ({
  title: "",
  company: "",
  location: "",
  modality: "Remoto",
  source: "Manual",
  date: new Date().toISOString().slice(0, 10),
  status: "new",
  favorite: false,
  description: "",
});

function CareerPage() {
  const jobs = useDb((s) => s.jobs);
  const applications = useDb((s) => s.applications);
  const companies = useDb((s) => s.companies);
  const resumes = useDb((s) => s.resumes);

  const [query, setQuery] = useState("");
  const [modality, setModality] = useState("");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState("");
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const [viewing, setViewing] = useState<Job | null>(null);
  const [editing, setEditing] = useState<JobDraft | null>(null);
  const [deleting, setDeleting] = useState<Job | null>(null);
  const [saving, setSaving] = useState(false);

  const sources = useMemo(() => [...new Set(jobs.map((j) => j.source))].sort(), [jobs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter(
      (j) =>
        (!q || [j.title, j.company, j.location].some((f) => f.toLowerCase().includes(q))) &&
        (!modality || j.modality === modality) &&
        (!source || j.source === source) &&
        (!status || j.status === status) &&
        (!onlyFavorites || j.favorite),
    );
  }, [jobs, query, modality, source, status, onlyFavorites]);

  const hasFilters = query || modality || source || status || onlyFavorites;

  async function saveJob() {
    if (!editing) return;
    setSaving(true);
    try {
      await careerService.saveJob(editing);
      toast.success(editing.id ? "Vaga atualizada." : "Vaga cadastrada.");
      setEditing(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar a vaga.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    await careerService.deleteJob(deleting.id);
    toast.success("Vaga excluída.");
    setDeleting(null);
    setViewing(null);
  }

  function toggleFavorite(job: Job) {
    careerService.toggleFavorite(job.id);
    toast(job.favorite ? "Removida dos favoritos." : "Marcada como favorita.");
  }

  const update = (patch: Partial<JobDraft>) => setEditing((prev) => (prev ? { ...prev, ...patch } : prev));

  return (
    <AppLayout
      eyebrow="Agente de Carreira"
      title="Carreira"
      subtitle="Oportunidades e processos acompanhados. Nenhuma candidatura é enviada automaticamente."
      headerAction={<Button onClick={() => setEditing(emptyJob())}>+ Nova vaga</Button>}
    >
      <Card>
        <CardHeader
          title="Vagas"
          description={`${filtered.length} de ${jobs.length} vagas`}
          action={
            <Button size="sm" className="sm:hidden" onClick={() => setEditing(emptyJob())}>
              + Nova vaga
            </Button>
          }
        />
        <div className="grid gap-2 md:grid-cols-[2fr_1fr_1fr_1fr_auto]">
          <TextInput
            aria-label="Pesquisar vagas"
            placeholder="Pesquisar por cargo, empresa ou local"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <SelectInput aria-label="Modalidade" value={modality} onChange={(e) => setModality(e.target.value)} options={toOptions(MODALITIES, "Todas as modalidades")} />
          <SelectInput aria-label="Fonte" value={source} onChange={(e) => setSource(e.target.value)} options={toOptions(sources, "Todas as fontes")} />
          <SelectInput aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)} options={[{ value: "", label: "Todos os status" }, ...STATUS_OPTIONS]} />
          <Button variant={onlyFavorites ? "primary" : "outline"} size="sm" aria-pressed={onlyFavorites} onClick={() => setOnlyFavorites((v) => !v)}>
            ★ Favoritas
          </Button>
        </div>

        <div className="mt-4">
          {filtered.length === 0 ? (
            <EmptyState
              title={hasFilters ? "Nenhuma vaga encontrada" : "Nenhuma vaga cadastrada"}
              description={hasFilters ? "Ajuste a pesquisa ou os filtros." : "Cadastre uma vaga manualmente para começar."}
              glyph="◈"
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {filtered.map((job) => (
                <JobCard key={job.id} job={job} onOpen={setViewing} onToggleFavorite={toggleFavorite} />
              ))}
            </div>
          )}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Candidaturas" description="Atualize a etapa manualmente." />
          {applications.length === 0 ? (
            <EmptyState title="Nenhuma candidatura" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="text-[11px] tracking-wider text-muted-foreground uppercase">
                    <th className="pb-2 font-medium">Vaga</th>
                    <th className="pb-2 font-medium">Empresa</th>
                    <th className="pb-2 font-medium">Etapa</th>
                    <th className="pb-2 font-medium">Atualizado</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((a) => (
                    <tr key={a.id} className="border-t border-border/60">
                      <td className="py-2.5 font-medium">{a.jobTitle}</td>
                      <td className="py-2.5 text-muted-foreground">{a.company}</td>
                      <td className="py-2 pr-3">
                        <SelectInput
                          aria-label={`Etapa de ${a.jobTitle}`}
                          value={a.stage}
                          className="py-1.5 text-[12px]"
                          onChange={(e) => {
                            careerService.updateStage(a.id, e.target.value as ApplicationStage);
                            toast.success(`Etapa atualizada para "${e.target.value}".`);
                          }}
                          options={toOptions(APPLICATION_STAGES)}
                        />
                      </td>
                      <td className="py-2.5 text-muted-foreground">{formatDate(a.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Empresas monitoradas" />
            <div className="space-y-2.5">
              {companies.map((c) => (
                <div key={c.id} className="glass-soft flex items-center justify-between rounded-xl px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground">{c.segment}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-brand">{c.openRoles} vagas</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <CardHeader title="Currículos" />
            <div className="space-y-2.5">
              {resumes.map((r) => (
                <div key={r.id} className="glass-soft rounded-xl px-3 py-2.5">
                  <p className="text-sm font-medium">{r.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {r.target} · atualizado em {formatDate(r.updatedAt)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Detalhes */}
      <Modal
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title={viewing ? `${viewing.title} · ${viewing.company}` : ""}
        footer={
          viewing ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => setDeleting(viewing)}>
                Excluir
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setEditing({ ...viewing }); setViewing(null); }}>
                Editar
              </Button>
              <Button size="sm" onClick={() => setViewing(null)}>
                Fechar
              </Button>
            </>
          ) : null
        }
      >
        {viewing ? (
          <div className="space-y-3">
            <dl className="grid grid-cols-2 gap-2 text-[13px]">
              <dt>Local</dt><dd className="text-foreground">{viewing.location || "—"}</dd>
              <dt>Modalidade</dt><dd className="text-foreground">{viewing.modality}</dd>
              <dt>Fonte</dt><dd className="text-foreground">{viewing.source}</dd>
              <dt>Data</dt><dd className="text-foreground">{formatDate(viewing.date)}</dd>
              <dt>Status</dt><dd className="text-foreground">{JOB_STATUS_LABEL[viewing.status]}</dd>
            </dl>
            <p>{viewing.description || "Sem descrição cadastrada."}</p>
            <p className="text-[11px]">O Jack não envia candidaturas automaticamente.</p>
          </div>
        ) : null}
      </Modal>

      {/* Formulário */}
      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Editar vaga" : "Nova vaga"}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button size="sm" disabled={saving} onClick={saveJob}>{saving ? "Salvando…" : "Salvar"}</Button>
          </>
        }
      >
        {editing ? (
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); void saveJob(); }}>
            <TextInput label="Cargo *" value={editing.title} onChange={(e) => update({ title: e.target.value })} />
            <TextInput label="Empresa *" value={editing.company} onChange={(e) => update({ company: e.target.value })} />
            <TextInput label="Localização" value={editing.location} onChange={(e) => update({ location: e.target.value })} />
            <SelectInput label="Modalidade" value={editing.modality} onChange={(e) => update({ modality: e.target.value as Job["modality"] })} options={toOptions(MODALITIES)} />
            <TextInput label="Fonte" value={editing.source} onChange={(e) => update({ source: e.target.value })} />
            <TextInput label="Data" type="date" value={editing.date} onChange={(e) => update({ date: e.target.value })} />
            <SelectInput label="Status" value={editing.status} onChange={(e) => update({ status: e.target.value as JobStatus })} options={STATUS_OPTIONS} />
            <div className="sm:col-span-2">
              <TextArea label="Descrição" value={editing.description ?? ""} onChange={(e) => update({ description: e.target.value })} />
            </div>
            <button type="submit" className="hidden" />
          </form>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Excluir vaga?"
        confirmLabel="Excluir"
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      >
        {deleting ? `"${deleting.title}" na ${deleting.company} será removida da lista.` : null}
      </ConfirmDialog>
    </AppLayout>
  );
}
