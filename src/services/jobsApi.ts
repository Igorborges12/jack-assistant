
import { API_BASE_URL, request } from "./http";
import type { Job } from "@/types";

// Estrutura de uma vaga retornada pelo FastAPI
interface ApiJob {
  id: number;
  user_id: number;
  title: string;
  company: string;
  location: string;
  modality: Job["modality"];
  source: string;
  date: string;
  status: Job["status"];
  favorite: boolean;
  description: string | null;

  // Novos campos do Crawler
  application_url: string | null;
  external_id: string | null;
  discovered_at: string | null;
  origin: "manual" | "crawler";

  created_at: string;
  updated_at: string;
}

// Converte os dados do MySQL para o formato do React
function toFrontendJob(job: ApiJob): Job {
  return {
    id: String(job.id),
    title: job.title,
    company: job.company,
    location: job.location,
    modality: job.modality,
    source: job.source,
    date: job.date,
    status: job.status,
    favorite: job.favorite,
    description: job.description ?? "",

    // Novos campos do Crawler
    applicationUrl: job.application_url,
    externalId: job.external_id,
    discoveredAt: job.discovered_at,
    origin: job.origin,
  };
}

// Prepara os dados para enviar ao FastAPI
function toApiPayload(
  job: Omit<Job, "id"> & { id?: string }
) {
  return {
    title: job.title,
    company: job.company,
    location: job.location,
    modality: job.modality,
    source: job.source,
    date: job.date,
    status: job.status,
    favorite: job.favorite ?? false,
    description: job.description ?? "",

    // Novos campos do Crawler
    application_url: job.applicationUrl ?? null,
    external_id: job.externalId ?? null,
    discovered_at: job.discoveredAt ?? null,
    origin: job.origin ?? "manual",
  };
}

export const jobsApi = {
  // GET /api/jobs
  async list(): Promise<Job[]> {
    const jobs = await request<ApiJob[]>("/jobs");

    return jobs.map(toFrontendJob);
  },

  // POST /api/jobs ou PUT /api/jobs/{id}
  async save(
    job: Omit<Job, "id"> & { id?: string }
  ): Promise<Job> {
    const payload = toApiPayload(job);

    let result: ApiJob;

    if (job.id) {
      result = await request<ApiJob>(`/jobs/${job.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    } else {
      result = await request<ApiJob>("/jobs", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }

    return toFrontendJob(result);
  },

  // DELETE /api/jobs/{id}
  async remove(id: string): Promise<void> {
    const token = window.localStorage.getItem("paios.token");

    const response = await fetch(
      `${API_BASE_URL}/jobs/${id}`,
      {
        method: "DELETE",
        headers: {
          ...(token
            ? { Authorization: `Bearer ${token}` }
            : {}),
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Não foi possível excluir a vaga. Erro ${response.status}.`
      );
    }
  },

  // PUT /api/jobs/{id} - Alternar favorito
  async toggleFavorite(job: Job): Promise<Job> {
    const result = await request<ApiJob>(
      `/jobs/${job.id}`,
      {
        method: "PUT",
        body: JSON.stringify({
          favorite: !job.favorite,
        }),
      }
    );

    return toFrontendJob(result);
  },
};
