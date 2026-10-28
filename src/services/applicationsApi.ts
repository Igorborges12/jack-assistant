
import { API_BASE_URL, request } from "./http";

export interface ApiApplication {
  id: number;
  user_id: number;
  job_id: number;
  stage: string;
  created_at: string;
  updated_at: string;
}

export interface CreateApplicationData {
  job_id: number;
  stage?: string;
}

export interface UpdateApplicationData {
  stage: string;
}

export const applicationsApi = {
  async list(): Promise<ApiApplication[]> {
    return request<ApiApplication[]>("/applications");
  },

  async get(id: number): Promise<ApiApplication> {
    return request<ApiApplication>(`/applications/${id}`);
  },

  async create(
    data: CreateApplicationData
  ): Promise<ApiApplication> {
    return request<ApiApplication>("/applications", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(
    id: number,
    data: UpdateApplicationData
  ): Promise<ApiApplication> {
    return request<ApiApplication>(`/applications/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async remove(id: number): Promise<void> {
    const token = localStorage.getItem("paios.token");

    const response = await fetch(
      `${API_BASE_URL}/applications/${id}`,
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
        `Erro ao excluir candidatura: ${response.status}`
      );
    }
  },
};
