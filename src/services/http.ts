/**
 * Thin HTTP layer prepared for the future FastAPI backend.
 * Nothing here is wired to a live API yet — the domain services
 * currently resolve mock data through `mockRequest`.
 */

export const API_BASE_URL: string =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined) ?? "/api";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = window.localStorage.getItem("paios.token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new ApiError(`Request to ${path} failed`, response.status);
  }

  return (await response.json()) as T;
}

/** Simulates network latency while the backend does not exist yet. */
export function mockRequest<T>(data: T, delay = 220): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay));
}
