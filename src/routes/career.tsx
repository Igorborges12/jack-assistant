import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { AppLayout } from "@/layouts/AppLayout";
import { Card, CardHeader } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import {
  SelectInput,
  TextArea,
  TextInput,
  toOptions,
} from "@/components/common/Field";
import { JOB_STATUS_LABEL, JobCard } from "@/components/JobCard";
import { useDb } from "@/hooks/useDb";
import { db } from "@/mocks/db";
import { careerService } from "@/services";
import { jobsApi } from "@/services/jobsApi";
import { applicationsApi } from "@/services/applicationsApi";
import { formatDate } from "@/lib/format";
import {
  APPLICATION_STAGES,
  type ApplicationStage,
  type Job,
  type JobStatus,
} from "@/types";

export const Route = createFileRoute("/career")({
  head: () => ({
    meta: [
      { title: "Carreira — Jack" },
      {
        name: "description",
        content:
          "Vagas, candidaturas, empresas monitoradas e currículos em um só lugar.",
      },
      { property: "og:title", content: "Carreira — Jack" },
      {
        property: "og:description",
        content:
          "Vagas, candidaturas, empresas monitoradas e currículos em um só lugar.",
      },
    ],
  }),
  component: CareerPage,
});

const MODALITIES = ["Remoto", "Híbrido", "Presencial"] as const;

const STATUS_OPTIONS = (
  Object.keys(JOB_STATUS_LABEL) as JobStatus[]
).map((value) => ({
  value,
  label: JOB_STATUS_LABEL[value],
}));

type JobDraft = Omit<Job, "id"> & { id?: string };

function emptyJob(): JobDraft {
  return {
    title: "",
    company: "",
    location: "",
    modality: "Remoto",
    source: "Manual",
    date: new Date().toISOString().slice(0, 10),
    status: "new",
    favorite: false,
    description: "",
  };
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    console.error(fallback, error);
  }
  return fallback;
}

function CareerPage() {
  const jobs = useDb((state) => state.jobs);
  const applications = useDb((state) => state.applications);
  const companies = useDb((state) => state.companies);
  const resumes = useDb((state) => state.resumes);

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState(false);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [applicationsError, setApplicationsError] = useState(false);
  const [creatingApplication, setCreatingApplication] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [busyStages, setBusyStages] = useState<string[]>([]);
  const [deletingApplicationId, setDeletingApplicationId] =
    useState<string | null>(null);

  const stageIdsRef = useRef(new Set<string>());
  const creatingApplicationRef = useRef(false);
  const deletingApplicationRef = useRef(false);

  const [query, setQuery] = useState("");
  const [modality, setModality] = useState("");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState("");
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const [viewing, setViewing] = useState<Job | null>(null);
  const [editing, setEditing] = useState<JobDraft | null>(null);
  const [deleting, setDeleting] = useState<Job | null>(null);

  const [saving, setSaving] = useState(false);
  const [deletingJob, setDeletingJob] = useState(false);
  const [busyFavorites, setBusyFavorites] = useState<string[]>([]);

  const savingRef = useRef(false);
  const deletingRef = useRef(false);
  const favoriteIdsRef = useRef(new Set<string>());

  useEffect(() => {
    let active = true;

    db.set(() => ({ jobs: [], applications: [] }));

    async function loadData() {
      setLoadingJobs(true);
      setLoadingApplications(true);
      setJobsError(false);
      setApplicationsError(false);

      try {
        const realJobs = await jobsApi.list();
        if (!active) return;

        db.set(() => ({ jobs: realJobs }));
        setLoadingJobs(false);
      } catch (error) {
        if (!active) return;

        console.error("Erro ao carregar vagas:", error);
        setJobsError(true);
        setLoadingJobs(false);
        toast.error("Não foi possível carregar as vagas do MySQL.");
      }

      try {
        const realApplications = await careerService.applications();
        if (!active) return;

        db.set(() => ({ applications: realApplications }));
      } catch (error) {
        if (!active) return;

        console.error("Erro ao carregar candidaturas:", error);
        setApplicationsError(true);
        toast.error("Não foi possível carregar as candidaturas do MySQL.");
      } finally {
        if (active) setLoadingApplications(false);
      }
    }

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  async function refreshApplications() {
    const result = await careerService.applications();
    db.set(() => ({ applications: result }));
  }

  async function changeApplicationStage(
    id: string,
    stage: ApplicationStage,
  ) {
    if (stageIdsRef.current.has(id)) return;

    stageIdsRef.current.add(id);
    setBusyStages((previous) => [...previous, id]);

    try {
      await careerService.updateStage(id, stage);
      toast.success(`Etapa atualizada para "${stage}".`);
    } catch (error) {
      console.error("Erro ao atualizar candidatura:", error);
      toast.error("Não foi possível atualizar a etapa no MySQL.");
    } finally {
      stageIdsRef.current.delete(id);
      setBusyStages((previous) => previous.filter((item) => item !== id));
    }
  }

  async function createApplication() {
    if (!selectedJobId || creatingApplicationRef.current) return;

    creatingApplicationRef.current = true;
    setCreatingApplication(true);

    try {
      await applicationsApi.create({
        job_id: Number(selectedJobId),
        stage: "applied",
      });

      await refreshApplications();
      setSelectedJobId("");
      toast.success("Candidatura registrada no MySQL.");
    } catch (error) {
      console.error("Erro ao criar candidatura:", error);
      toast.error(
        "Não foi possível cadastrar a candidatura. Verifique se ela já existe.",
      );
    } finally {
      creatingApplicationRef.current = false;
      setCreatingApplication(false);
    }
  }

  async function deleteApplication(id: string) {
    if (deletingApplicationRef.current) return;

    deletingApplicationRef.current = true;
    setDeletingApplicationId(id);

    try {
      await applicationsApi.remove(Number(id));

      db.set((state) => ({
        applications: state.applications.filter((item) => item.id !== id),
      }));

      toast.success("Candidatura excluída do MySQL.");
    } catch (error) {
      console.error("Erro ao excluir candidatura:", error);
      toast.error("Não foi possível excluir a candidatura.");
    } finally {
      deletingApplicationRef.current = false;
      setDeletingApplicationId(null);
    }
  }

  const availableJobs = jobs.filter(
    (job) =>
      !applications.some((application) => application.jobId === job.id),
  );

  const sources = useMemo(
    () => [...new Set(jobs.map((job) => job.source))].sort(),
    [jobs],
  );

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesSearch =
        !search ||
        [job.title, job.company, job.location].some((field) =>
          field.toLowerCase().includes(search),
        );

      return (
        matchesSearch &&
        (!modality || job.modality === modality) &&
        (!source || job.source === source) &&
        (!status || job.status === status) &&
        (!onlyFavorites || job.favorite)
      );
    });
  }, [jobs, query, modality, source, status, onlyFavorites]);

  const hasFilters = Boolean(
    query || modality || source || status || onlyFavorites,
  );

  const isBusy = saving || deletingJob || busyFavorites.length > 0;

  function openNewJob() {
    if (isBusy) return;
    setEditing(emptyJob());
  }

  function update(patch: Partial<JobDraft>) {
    if (savingRef.current) return;

    setEditing((previous) =>
      previous ? { ...previous, ...patch } : previous,
    );
  }

  async function saveJob() {
    if (!editing || savingRef.current) return;

    if (!editing.title.trim() || !editing.company.trim()) {
      toast.error("Preencha o cargo e a empresa.");
      return;
    }

    const wasEditing = Boolean(editing.id);

    savingRef.current = true;
    setSaving(true);

    try {
      await careerService.saveJob(editing);

      toast.success(
        wasEditing
          ? "Vaga atualizada no banco de dados."
          : "Vaga cadastrada no banco de dados.",
      );

      setEditing(null);
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Não foi possível salvar a vaga. Verifique a conexão com o servidor.",
        ),
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleting || deletingRef.current) return;

    deletingRef.current = true;
    setDeletingJob(true);

    try {
      await careerService.deleteJob(deleting.id);
      toast.success("Vaga excluída do banco de dados.");
      setDeleting(null);
      setViewing(null);
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Não foi possível excluir a vaga. Tente novamente.",
        ),
      );
    } finally {
      deletingRef.current = false;
      setDeletingJob(false);
    }
  }

  async function toggleFavorite(job: Job) {
    if (favoriteIdsRef.current.has(job.id)) return;

    favoriteIdsRef.current.add(job.id);
    setBusyFavorites((previous) => [...previous, job.id]);

    try {
      await careerService.toggleFavorite(job.id);

      toast.success(
        job.favorite
          ? "Vaga removida dos favoritos."
          : "Vaga adicionada aos favoritos.",
      );
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Não foi possível atualizar o favorito."),
      );
    } finally {
      favoriteIdsRef.current.delete(job.id);
      setBusyFavorites((previous) =>
        previous.filter((id) => id !== job.id),
      );
    }
  }

  return (
    <AppLayout
      eyebrow="Agente de Carreira"
      title="Carreira"
      subtitle="Oportunidades e processos acompanhados. Nenhuma candidatura é enviada automaticamente."
      headerAction={
        <Button
          disabled={loadingJobs || jobsError || isBusy}
          onClick={openNewJob}
        >
          + Nova vaga
        </Button>
      }
    >
      {/* VAGAS */}
      <Card>
        <CardHeader
          title="Vagas"
          description={
            loadingJobs
              ? "Carregando vagas..."
              : `${filtered.length} de ${jobs.length} vagas`
          }
          action={
            <Button
              size="sm"
              className="sm:hidden"
              disabled={loadingJobs || jobsError || isBusy}
              onClick={openNewJob}
            >
              + Nova vaga
            </Button>
          }
        />

        <div className="grid gap-2 md:grid-cols-[2fr_1fr_1fr_1fr_auto]">
          <TextInput
            aria-label="Pesquisar vagas"
            placeholder="Pesquisar por cargo, empresa ou local"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <SelectInput
            aria-label="Modalidade"
            value={modality}
            onChange={(event) => setModality(event.target.value)}
            options={toOptions(MODALITIES, "Todas as modalidades")}
          />

          <SelectInput
            aria-label="Fonte"
            value={source}
            onChange={(event) => setSource(event.target.value)}
            options={toOptions(sources, "Todas as fontes")}
          />

          <SelectInput
            aria-label="Status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            options={[
              { value: "", label: "Todos os status" },
              ...STATUS_OPTIONS,
            ]}
          />

          <Button
            variant={onlyFavorites ? "primary" : "outline"}
            size="sm"
            aria-pressed={onlyFavorites}
            onClick={() => setOnlyFavorites((value) => !value)}
          >
            ★ Favoritas
          </Button>
        </div>

        <div className="mt-4">
          {loadingJobs ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Carregando vagas do banco de dados...
            </div>
          ) : jobsError ? (
            <EmptyState
              title="Erro ao carregar vagas"
              description="Não foi possível consultar o FastAPI. Verifique se o backend está funcionando e atualize a página."
              glyph="◈"
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              title={
                hasFilters
                  ? "Nenhuma vaga encontrada"
                  : "Nenhuma vaga cadastrada"
              }
              description={
                hasFilters
                  ? "Ajuste a pesquisa ou os filtros."
                  : "Cadastre uma vaga manualmente para começar."
              }
              glyph="◈"
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {filtered.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onOpen={setViewing}
                  onToggleFavorite={(selectedJob) => {
                    void toggleFavorite(selectedJob);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* CANDIDATURAS */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Candidaturas"
            description="Registre candidaturas e acompanhe as etapas no MySQL. Nenhuma inscrição é enviada automaticamente."
          />

          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <SelectInput
              aria-label="Selecionar vaga para registrar candidatura"
              value={selectedJobId}
              onChange={(event) => setSelectedJobId(event.target.value)}
              options={[
                {
                  value: "",
                  label: "Selecione uma vaga cadastrada",
                },
                ...availableJobs.map((job) => ({
                  value: job.id,
                  label: `${job.title} — ${job.company}`,
                })),
              ]}
              disabled={
                loadingJobs ||
                loadingApplications ||
                creatingApplication ||
                jobsError ||
                applicationsError
              }
            />

            <Button
              size="sm"
              disabled={
                !selectedJobId ||
                creatingApplication ||
                loadingJobs ||
                loadingApplications ||
                jobsError ||
                applicationsError
              }
              onClick={() => {
                void createApplication();
              }}
            >
              {creatingApplication
                ? "Registrando…"
                : "+ Registrar candidatura"}
            </Button>
          </div>

          {loadingApplications ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Carregando candidaturas do MySQL...
            </div>
          ) : applicationsError ? (
            <EmptyState
              title="Erro ao carregar candidaturas"
              description="Verifique o FastAPI e atualize a página para tentar novamente."
            />
          ) : applications.length === 0 ? (
            <EmptyState
              title="Nenhuma candidatura"
              description="Selecione uma vaga acima para registrar sua primeira candidatura."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="text-[11px] tracking-wider text-muted-foreground uppercase">
                    <th className="pb-2 font-medium">Vaga</th>
                    <th className="pb-2 font-medium">Empresa</th>
                    <th className="pb-2 font-medium">Etapa</th>
                    <th className="pb-2 font-medium">Atualizado</th>
                    <th className="pb-2 font-medium">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {applications.map((application) => (
                    <tr
                      key={application.id}
                      className="border-t border-border/60"
                    >
                      <td className="py-2.5 font-medium">
                        {application.jobTitle}
                      </td>

                      <td className="py-2.5 text-muted-foreground">
                        {application.company}
                      </td>

                      <td className="py-2 pr-3">
                        <SelectInput
                          aria-label={`Etapa de ${application.jobTitle}`}
                          value={application.stage}
                          className="py-1.5 text-[12px]"
                          disabled={
                            busyStages.includes(application.id) ||
                            deletingApplicationId !== null
                          }
                          onChange={(event) => {
                            void changeApplicationStage(
                              application.id,
                              event.target.value as ApplicationStage,
                            );
                          }}
                          options={toOptions(APPLICATION_STAGES)}
                        />
                      </td>

                      <td className="py-2.5 text-muted-foreground">
                        {formatDate(application.updatedAt)}
                      </td>

                      <td className="py-2.5">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={
                            deletingApplicationId !== null ||
                            busyStages.includes(application.id)
                          }
                          onClick={() => {
                            if (
                              window.confirm(
                                "Excluir esta candidatura do banco de dados? A vaga será mantida.",
                              )
                            ) {
                              void deleteApplication(application.id);
                            }
                          }}
                        >
                          {deletingApplicationId === application.id
                            ? "Excluindo…"
                            : "Excluir"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          {/* EMPRESAS MONITORADAS */}
          <Card>
            <CardHeader title="Empresas monitoradas" />

            <div className="space-y-2.5">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className="glass-soft flex items-center justify-between rounded-xl px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {company.name}
                    </p>

                    <p className="text-[11px] text-muted-foreground">
                      {company.segment}
                    </p>
                  </div>

                  <span className="text-[11px] font-semibold text-brand">
                    {company.openRoles} vagas
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* CURRÍCULOS */}
          <Card>
            <CardHeader title="Currículos" />

            <div className="space-y-2.5">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="glass-soft rounded-xl px-3 py-2.5"
                >
                  <p className="text-sm font-medium">
                    {resume.name}
                  </p>

                  <p className="text-[11px] text-muted-foreground">
                    {resume.target} · atualizado em{" "}
                    {formatDate(resume.updatedAt)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* MODAL DE DETALHES */}
      <Modal
        open={viewing !== null}
        onClose={() => {
          if (!deletingJob) setViewing(null);
        }}
        title={
          viewing
            ? `${viewing.title} · ${viewing.company}`
            : ""
        }
        footer={
          viewing ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                disabled={isBusy}
                onClick={() => setDeleting(viewing)}
              >
                Excluir
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={isBusy}
                onClick={() => {
                  setEditing({ ...viewing });
                  setViewing(null);
                }}
              >
                Editar
              </Button>

              <Button
                size="sm"
                disabled={deletingJob}
                onClick={() => setViewing(null)}
              >
                Fechar
              </Button>
            </>
          ) : null
        }
      >
        {viewing ? (
          <div className="space-y-3">
            <dl className="grid grid-cols-2 gap-2 text-[13px]">
              <dt>Local</dt>
              <dd className="text-foreground">
                {viewing.location || "—"}
              </dd>

              <dt>Modalidade</dt>
              <dd className="text-foreground">
                {viewing.modality}
              </dd>

              <dt>Fonte</dt>
              <dd className="text-foreground">
                {viewing.source}
              </dd>

              <dt>Data</dt>
              <dd className="text-foreground">
                {formatDate(viewing.date)}
              </dd>

              <dt>Status</dt>
              <dd className="text-foreground">
                {JOB_STATUS_LABEL[viewing.status]}
              </dd>
            </dl>

            <p>
              {viewing.description ||
                "Sem descrição cadastrada."}
            </p>

            <p className="text-[11px]">
              O Jack não envia candidaturas automaticamente.
            </p>
          </div>
        ) : null}
      </Modal>

      {/* MODAL DE CADASTRO E EDIÇÃO */}
      <Modal
        open={editing !== null}
        onClose={() => {
          if (!saving) setEditing(null);
        }}
        title={editing?.id ? "Editar vaga" : "Nova vaga"}
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={saving}
              onClick={() => setEditing(null)}
            >
              Cancelar
            </Button>

            <Button
              size="sm"
              disabled={saving}
              onClick={() => {
                void saveJob();
              }}
            >
              {saving ? "Salvando…" : "Salvar"}
            </Button>
          </>
        }
      >
        {editing ? (
          <form
            className="grid gap-3 sm:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              void saveJob();
            }}
          >
            <TextInput
              label="Cargo *"
              value={editing.title}
              onChange={(event) =>
                update({ title: event.target.value })
              }
            />

            <TextInput
              label="Empresa *"
              value={editing.company}
              onChange={(event) =>
                update({ company: event.target.value })
              }
            />

            <TextInput
              label="Localização"
              value={editing.location}
              onChange={(event) =>
                update({ location: event.target.value })
              }
            />

            <SelectInput
              label="Modalidade"
              value={editing.modality}
              onChange={(event) =>
                update({
                  modality: event.target.value as Job["modality"],
                })
              }
              options={toOptions(MODALITIES)}
            />

            <TextInput
              label="Fonte"
              value={editing.source}
              onChange={(event) =>
                update({ source: event.target.value })
              }
            />

            <TextInput
              label="Data"
              type="date"
              value={editing.date}
              onChange={(event) =>
                update({ date: event.target.value })
              }
            />

            <SelectInput
              label="Status"
              value={editing.status}
              onChange={(event) =>
                update({
                  status: event.target.value as JobStatus,
                })
              }
              options={STATUS_OPTIONS}
            />

            <div className="sm:col-span-2">
              <TextArea
                label="Descrição"
                value={editing.description ?? ""}
                onChange={(event) =>
                  update({ description: event.target.value })
                }
              />
            </div>

            <button type="submit" className="hidden" />
          </form>
        ) : null}
      </Modal>

      {/* CONFIRMAÇÃO DE EXCLUSÃO */}
      <ConfirmDialog
        open={deleting !== null}
        title={deletingJob ? "Excluindo vaga..." : "Excluir vaga?"}
        confirmLabel={deletingJob ? "Excluindo..." : "Excluir"}
        onCancel={() => {
          if (!deletingRef.current) setDeleting(null);
        }}
        onConfirm={() => {
          void confirmDelete();
        }}
      >
        {deleting
          ? `"${deleting.title}" na ${deleting.company} será removida permanentemente do banco de dados.`
          : null}
      </ConfirmDialog>
    </AppLayout>
  );
}