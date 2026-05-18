import type {
  ExperimentResponse,
  FieldResponse,
  Memory,
  MemoryCreate,
  MemoryUpdate,
  QueryResponse,
  StatsResponse,
} from "./types";
import { ClientEngine } from "./hrr";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

let backendStatus: "unknown" | "available" | "unavailable" = "unknown";
let lastCheck = 0;
const CHECK_INTERVAL = 30_000;
const HEALTH_TIMEOUT = 2000;

async function checkBackend(): Promise<boolean> {
  const now = Date.now();
  if (backendStatus !== "unknown" && now - lastCheck < CHECK_INTERVAL) {
    return backendStatus === "available";
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), HEALTH_TIMEOUT);
    const res = await fetch(`${BASE_URL}/health`, { signal: controller.signal });
    clearTimeout(timer);
    backendStatus = res.ok ? "available" : "unavailable";
  } catch {
    backendStatus = "unavailable";
  }
  lastCheck = now;
  return backendStatus === "available";
}

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

async function withFallback<T>(remoteFn: () => Promise<T>, localFn: () => Promise<T>): Promise<T> {
  const available = await checkBackend();
  if (available) {
    try {
      return await remoteFn();
    } catch {
      backendStatus = "unavailable";
      lastCheck = Date.now();
      return localFn();
    }
  }
  return localFn();
}

export type Api = ReturnType<typeof makeApi>;

/**
 * Build an `api` object backed by a freshly constructed `ClientEngine`.
 *
 * The playground uses the module-level `api` singleton (below) so every panel
 * sees the same memory field. The homepage explainer blocks (encode/recall/trust)
 * call `makeApi()` in a `useMemo` so each block has its own private store and
 * the demos can't leak state into each other.
 */
export function makeApi(engine: ClientEngine = new ClientEngine()) {
  const clientEngine = engine;
  return {
  health: () =>
    withFallback(
      () => request<{ status: string }>("/health"),
      () => clientEngine.health()
    ),

  memories: {
    list: (params?: Record<string, string>) =>
      withFallback(
        () => {
          const qs = params ? "?" + new URLSearchParams(params).toString() : "";
          return request<Memory[]>(`/memories${qs}`);
        },
        () => clientEngine.memories.list(params)
      ),
    get: (id: string) =>
      withFallback(
        () => request<Memory>(`/memories/${id}`),
        () => clientEngine.memories.get(id)
      ),
    create: (data: MemoryCreate) =>
      withFallback(
        () => request<Memory>("/memories", { method: "POST", body: JSON.stringify(data) }),
        () => clientEngine.memories.create(data)
      ),
    update: (id: string, data: MemoryUpdate) =>
      withFallback(
        () => request<Memory>(`/memories/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
        () => clientEngine.memories.update(id, data)
      ),
    delete: (id: string) =>
      withFallback(
        () => request<Memory>(`/memories/${id}`, { method: "DELETE" }),
        () => clientEngine.memories.delete(id)
      ),
  },

  query: (query: string, mode: string = "hybrid", top_k: number = 5) =>
    withFallback(
      () =>
        request<QueryResponse>("/query", {
          method: "POST",
          body: JSON.stringify({ query, mode, top_k }),
        }),
      () => clientEngine.query(query, mode, top_k)
    ),

  stats: () =>
    withFallback(
      () => request<StatsResponse>("/stats"),
      () => clientEngine.stats()
    ),

  experiments: {
    run: (num_queries: number = 10) =>
      withFallback(
        () =>
          request<ExperimentResponse>("/experiments/run", {
            method: "POST",
            body: JSON.stringify({ num_queries }),
          }),
        () => clientEngine.experiments.run(num_queries)
      ),
  },

  seed: () =>
    withFallback(
      () => request<{ status: string; memories_created: number }>("/seed", { method: "POST" }),
      () => clientEngine.seed()
    ),

  demo: {
    seed: () =>
      withFallback(
        () =>
          request<{ status: string; memories_created: number; memories: Memory[] }>("/demo/seed", {
            method: "POST",
          }),
        () => clientEngine.demo.seed()
      ),
  },

  field: () =>
    withFallback(
      () => request<FieldResponse>("/memory/field"),
      () => clientEngine.field()
    ),

  duel: (query: string, top_k: number = 5) =>
    withFallback(
      () =>
        request<{ query: string; holographic: QueryResponse; keyword: QueryResponse }>(
          "/memory/duel",
          { method: "POST", body: JSON.stringify({ query, top_k }) }
        ),
      () => clientEngine.duel(query, top_k)
    ),

  noise: (count: number = 5) =>
    withFallback(
      () =>
        request<{ status: string; memories_created: number; memories: Memory[] }>("/memory/noise", {
          method: "POST",
          body: JSON.stringify({ count }),
        }),
      () => clientEngine.noise(count)
    ),

  contradiction: (memory_id: string) =>
    withFallback(
      () =>
        request<{ status: string; original_id: string; contradiction: Memory }>(
          "/memory/contradiction",
          { method: "POST", body: JSON.stringify({ memory_id }) }
        ),
      () => clientEngine.contradiction(memory_id)
    ),

  reset: () =>
    withFallback(
      () => request<{ status: string }>("/memory/reset", { method: "POST" }),
      () => clientEngine.reset()
    ),
  };
}

// Module-level singleton used by the playground (Teach / Memory field / Recall
// share one store across all three columns). Homepage explainer blocks should
// call `makeApi()` directly so each block gets its own private engine.
export const api = makeApi();
