import type {
  ExperimentResponse,
  FieldResponse,
  Memory,
  MemoryCreate,
  MemoryUpdate,
  QueryResponse,
  StatsResponse,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  health: () => request<{ status: string }>("/health"),

  memories: {
    list: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<Memory[]>(`/memories${qs}`);
    },
    get: (id: string) => request<Memory>(`/memories/${id}`),
    create: (data: MemoryCreate) =>
      request<Memory>("/memories", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: MemoryUpdate) =>
      request<Memory>(`/memories/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: string) => request<Memory>(`/memories/${id}`, { method: "DELETE" }),
  },

  query: (query: string, mode: string = "hybrid", top_k: number = 5) =>
    request<QueryResponse>("/query", {
      method: "POST",
      body: JSON.stringify({ query, mode, top_k }),
    }),

  stats: () => request<StatsResponse>("/stats"),

  experiments: {
    run: (num_queries: number = 10) =>
      request<ExperimentResponse>("/experiments/run", {
        method: "POST",
        body: JSON.stringify({ num_queries }),
      }),
  },

  seed: () => request<{ status: string; memories_created: number }>("/seed", { method: "POST" }),

  demo: {
    seed: () =>
      request<{ status: string; memories_created: number; memories: Memory[] }>("/demo/seed", {
        method: "POST",
      }),
  },

  field: () => request<FieldResponse>("/memory/field"),

  duel: (query: string, top_k: number = 5) =>
    request<{ query: string; holographic: QueryResponse; keyword: QueryResponse }>(
      "/memory/duel",
      { method: "POST", body: JSON.stringify({ query, top_k }) }
    ),

  noise: (count: number = 5) =>
    request<{ status: string; memories_created: number; memories: Memory[] }>("/memory/noise", {
      method: "POST",
      body: JSON.stringify({ count }),
    }),

  contradiction: (memory_id: string) =>
    request<{ status: string; original_id: string; contradiction: Memory }>(
      "/memory/contradiction",
      { method: "POST", body: JSON.stringify({ memory_id }) }
    ),

  reset: () => request<{ status: string }>("/memory/reset", { method: "POST" }),
};
