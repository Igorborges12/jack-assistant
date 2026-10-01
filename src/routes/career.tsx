import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/layouts/AppLayout";
import { Card, CardHeader } from "@/components/ui/Card";
import { JobCard } from "@/components/JobCard";
import { LoadingState } from "@/components/ui/LoadingState";
import { careerService } from "@/services";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/career")({
  head: () => ({
    meta: [
      { title: "Career — Personal AI OS" },
      {
        name: "description",
        content: "Novas vagas, candidaturas, empresas monitoradas e currículos em um só lugar.",
      },
      { property: "og:title", content: "Career — Personal AI OS" },
      {
        property: "og:description",
        content: "Novas vagas, candidaturas, empresas monitoradas e currículos em um só lugar.",
      },
    ],
  }),
  component: CareerPage,
});

function CareerPage() {
  const jobs = useQuery({ queryKey: ["jobs"], queryFn: careerService.jobs });
  const applications = useQuery({ queryKey: ["applications"], queryFn: careerService.applications });
  const companies = useQuery({ queryKey: ["companies"], queryFn: careerService.companies });
  const resumes = useQuery({ queryKey: ["resumes"], queryFn: careerService.resumes });

  return (
    <AppLayout eyebrow="Career Agent" title="Career" subtitle="Oportunidades e processos acompanhados.">
      <Card>
        <CardHeader title="Novas vagas" description="Coletadas pelos monitoramentos ativos." />
        {jobs.isLoading ? (
          <LoadingState rows={3} />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {(jobs.data ?? []).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Candidaturas" />
          {applications.isLoading ? (
            <LoadingState rows={3} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-[11px] tracking-wider text-muted-foreground uppercase">
                    <th className="pb-2 font-medium">Vaga</th>
                    <th className="pb-2 font-medium">Empresa</th>
                    <th className="pb-2 font-medium">Etapa</th>
                    <th className="pb-2 font-medium">Atualizado</th>
                  </tr>
                </thead>
                <tbody>
                  {(applications.data ?? []).map((application) => (
                    <tr key={application.id} className="border-t border-border/60">
                      <td className="py-2.5 font-medium">{application.jobTitle}</td>
                      <td className="py-2.5 text-muted-foreground">{application.company}</td>
                      <td className="py-2.5 text-muted-foreground">{application.stage}</td>
                      <td className="py-2.5 text-muted-foreground">
                        {formatDate(application.updatedAt)}
                      </td>
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
              {(companies.data ?? []).map((company) => (
                <div
                  key={company.id}
                  className="glass-soft flex items-center justify-between rounded-xl px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium">{company.name}</p>
                    <p className="text-[11px] text-muted-foreground">{company.segment}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-brand">
                    {company.openRoles} vagas
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Currículos" />
            <div className="space-y-2.5">
              {(resumes.data ?? []).map((resume) => (
                <div key={resume.id} className="glass-soft rounded-xl px-3 py-2.5">
                  <p className="text-sm font-medium">{resume.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {resume.target} · atualizado em {formatDate(resume.updatedAt)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
