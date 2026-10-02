import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate } from "@/lib/format";
import type { Job, JobStatus, StatusTone } from "@/types";

const statusLabel: Record<JobStatus, string> = {
  new: "Nova",
  applied: "Candidatado",
  interview: "Entrevista",
  rejected: "Recusada",
  saved: "Salva",
};

const statusTone: Record<JobStatus, StatusTone> = {
  new: "info",
  applied: "neutral",
  interview: "success",
  rejected: "danger",
  saved: "warning",
};

export function JobCard({ job }: { job: Job }) {
  return (
    <div className="glass-soft rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{job.title}</p>
          <p className="truncate text-[12px] text-muted-foreground">{job.company}</p>
        </div>
        <StatusBadge label={statusLabel[job.status]} tone={statusTone[job.status]} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
        <div className="flex justify-between gap-2">
          <dt>Local</dt>
          <dd className="truncate text-foreground">{job.location}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Modalidade</dt>
          <dd className="text-foreground">{job.modality}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Fonte</dt>
          <dd className="text-foreground">{job.source}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Data</dt>
          <dd className="text-foreground">{formatDate(job.date)}</dd>
        </div>
      </dl>
    </div>
  );
}
