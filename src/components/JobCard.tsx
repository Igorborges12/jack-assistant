import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate } from "@/lib/format";
import type { Job, JobStatus, StatusTone } from "@/types";

export const JOB_STATUS_LABEL: Record<JobStatus, string> = {
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

interface JobCardProps {
  job: Job;
  onOpen?: (job: Job) => void;
  onToggleFavorite?: (job: Job) => void;
}

export function JobCard({ job, onOpen, onToggleFavorite }: JobCardProps) {
  return (
    <div className="glass-soft rounded-2xl p-4 transition hover:bg-card/80">
      <div className="flex items-start justify-between gap-3">
        <button onClick={() => onOpen?.(job)} className="min-w-0 text-left">
          <p className="truncate text-sm font-semibold">{job.title}</p>
          <p className="truncate text-[12px] text-muted-foreground">{job.company}</p>
        </button>
        <div className="flex shrink-0 items-center gap-1.5">
          <StatusBadge label={JOB_STATUS_LABEL[job.status]} tone={statusTone[job.status]} />
          <button
            aria-label={job.favorite ? "Remover dos favoritos" : "Marcar como favorita"}
            aria-pressed={!!job.favorite}
            onClick={() => onToggleFavorite?.(job)}
            className={`grid size-7 place-items-center rounded-full text-base transition ${
              job.favorite ? "text-amber" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {job.favorite ? "★" : "☆"}
          </button>
        </div>
      </div>
      <button onClick={() => onOpen?.(job)} className="block w-full text-left">
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
      </button>
    </div>
  );
}
