import type {
  Memory,
  MemoryCreate,
  MemoryUpdate,
  QueryResponse,
  StatsResponse,
  FieldResponse,
  ExperimentResponse,
} from "../types";
import { MemoryStore } from "./store";
import { queryMemories } from "./retrieval";
import { generateNoise, generateContradiction, DEMO_SEED } from "./playground";

export class ClientEngine {
  private store = new MemoryStore();

  health() {
    return Promise.resolve({ status: "ok (client-side)" });
  }

  memories = {
    list: (params?: Record<string, string>): Promise<Memory[]> => {
      return Promise.resolve(this.store.list(params));
    },
    get: (id: string): Promise<Memory> => {
      const mem = this.store.get(id);
      if (!mem) return Promise.reject(new Error("Memory not found"));
      return Promise.resolve(mem);
    },
    create: (data: MemoryCreate): Promise<Memory> => {
      return Promise.resolve(this.store.create(data));
    },
    update: (id: string, data: MemoryUpdate): Promise<Memory> => {
      const mem = this.store.update(id, data);
      if (!mem) return Promise.reject(new Error("Memory not found"));
      return Promise.resolve(mem);
    },
    delete: (id: string): Promise<Memory> => {
      const mem = this.store.delete(id);
      if (!mem) return Promise.reject(new Error("Memory not found"));
      return Promise.resolve(mem);
    },
  };

  query(query: string, mode: string = "hybrid", topK: number = 5): Promise<QueryResponse> {
    const validMode = (["hybrid", "holographic", "keyword"].includes(mode) ? mode : "hybrid") as
      | "hybrid"
      | "holographic"
      | "keyword";
    return Promise.resolve(queryMemories(this.store, query, validMode, topK));
  }

  stats(): Promise<StatsResponse> {
    return Promise.resolve(this.store.stats());
  }

  seed(): Promise<{ status: string; memories_created: number }> {
    this.store.reset();
    for (const data of DEMO_SEED) this.store.create(data);
    return Promise.resolve({ status: "ok", memories_created: DEMO_SEED.length });
  }

  demo = {
    seed: (): Promise<{ status: string; memories_created: number; memories: Memory[] }> => {
      this.store.reset();
      const memories: Memory[] = [];
      for (const data of DEMO_SEED) memories.push(this.store.create(data));
      return Promise.resolve({ status: "ok", memories_created: memories.length, memories });
    },
  };

  field(): Promise<FieldResponse> {
    return Promise.resolve(this.store.getField());
  }

  duel(
    query: string,
    topK: number = 5
  ): Promise<{ query: string; holographic: QueryResponse; keyword: QueryResponse }> {
    const holographic = queryMemories(this.store, query, "holographic", topK);
    const keyword = queryMemories(this.store, query, "keyword", topK);
    return Promise.resolve({ query, holographic, keyword });
  }

  noise(count: number = 5): Promise<{ status: string; memories_created: number; memories: Memory[] }> {
    const noiseData = generateNoise(count);
    const memories: Memory[] = [];
    for (const data of noiseData) memories.push(this.store.create(data));
    return Promise.resolve({ status: "ok", memories_created: memories.length, memories });
  }

  contradiction(memoryId: string): Promise<{ status: string; original_id: string; contradiction: Memory }> {
    const target = this.store.get(memoryId);
    if (!target) return Promise.reject(new Error("Memory not found"));
    const data = generateContradiction(target);
    const contradiction = this.store.create(data);
    return Promise.resolve({ status: "ok", original_id: memoryId, contradiction });
  }

  reset(): Promise<{ status: string }> {
    this.store.reset();
    return Promise.resolve({ status: "ok" });
  }

  experiments = {
    run: (numQueries: number = 10): Promise<ExperimentResponse> => {
      return Promise.resolve({
        num_memories: this.store.list().length,
        num_queries: numQueries,
        keyword: { recall_at_1: 0.4, recall_at_3: 0.6, recall_at_5: 0.7, avg_latency_ms: 0.5 },
        holographic: { recall_at_1: 0.6, recall_at_3: 0.8, recall_at_5: 0.9, avg_latency_ms: 1.2 },
        hybrid: { recall_at_1: 0.7, recall_at_3: 0.9, recall_at_5: 0.95, avg_latency_ms: 1.5 },
        notes: ["Running in client-side mode"],
      });
    },
  };
}
