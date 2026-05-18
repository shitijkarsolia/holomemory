import type { Memory, MemoryCreate, MemoryUpdate, FieldEdge, FieldResponse } from "../types";
import { encodeMemory } from "./encoder";

function canonicalKey(
  text: string,
  subject: string | null,
  predicate: string | null,
  object: string | null,
): string {
  const norm = (s: string | null) => (s || "").toLowerCase().split(/\s+/).filter(Boolean).join(" ");
  return [norm(text), norm(subject), norm(predicate), norm(object)].join("␟");
}

export class MemoryStore {
  private memories = new Map<string, Memory>();
  private vectors = new Map<string, Float64Array>();
  private byCanonicalKey = new Map<string, string>();

  create(data: MemoryCreate): Memory {
    const entities = data.entities || [];
    const tags = data.tags || [];
    const subject = data.subject || null;
    const predicate = data.predicate || null;
    const object = data.object || null;

    const key = canonicalKey(data.text, subject, predicate, object);
    const existingId = this.byCanonicalKey.get(key);
    if (existingId) {
      const existing = this.memories.get(existingId);
      if (existing && existing.status === "active") return existing;
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const memory: Memory = {
      id,
      text: data.text,
      kind: data.kind || "fact",
      subject,
      predicate,
      object,
      entities,
      tags,
      source: data.source || "user",
      trust: data.trust ?? 0.7,
      status: "active",
      created_at: now,
      updated_at: now,
    };

    const vector = encodeMemory({
      text: data.text,
      subject,
      predicate,
      object,
      entities,
      tags,
    });

    this.memories.set(id, memory);
    this.vectors.set(id, vector);
    this.byCanonicalKey.set(key, id);
    return memory;
  }

  get(id: string): Memory | null {
    return this.memories.get(id) || null;
  }

  list(params?: Record<string, string>): Memory[] {
    let results = Array.from(this.memories.values());
    if (params?.status) {
      results = results.filter((m) => m.status === params.status);
    } else {
      results = results.filter((m) => m.status === "active");
    }
    if (params?.kind) {
      results = results.filter((m) => m.kind === params.kind);
    }
    const limit = params?.limit ? parseInt(params.limit, 10) : 500;
    return results.slice(0, limit);
  }

  update(id: string, data: MemoryUpdate): Memory | null {
    const mem = this.memories.get(id);
    if (!mem) return null;

    const updated: Memory = { ...mem, updated_at: new Date().toISOString() };
    if (data.text !== undefined) updated.text = data.text;
    if (data.kind !== undefined) updated.kind = data.kind;
    if (data.subject !== undefined) updated.subject = data.subject || null;
    if (data.predicate !== undefined) updated.predicate = data.predicate || null;
    if (data.object !== undefined) updated.object = data.object || null;
    if (data.entities !== undefined) updated.entities = data.entities;
    if (data.tags !== undefined) updated.tags = data.tags;
    if (data.trust !== undefined) updated.trust = data.trust;
    if (data.status !== undefined) updated.status = data.status;

    const vector = encodeMemory({
      text: updated.text,
      subject: updated.subject,
      predicate: updated.predicate,
      object: updated.object,
      entities: updated.entities,
      tags: updated.tags,
    });

    this.memories.set(id, updated);
    this.vectors.set(id, vector);
    for (const [k, v] of this.byCanonicalKey) if (v === id) this.byCanonicalKey.delete(k);
    this.byCanonicalKey.set(
      canonicalKey(updated.text, updated.subject, updated.predicate, updated.object),
      id,
    );
    return updated;
  }

  delete(id: string): Memory | null {
    const mem = this.memories.get(id);
    if (!mem) return null;
    const deleted = { ...mem, status: "deleted", updated_at: new Date().toISOString() };
    this.memories.set(id, deleted);
    return deleted;
  }

  getVector(id: string): Float64Array | null {
    return this.vectors.get(id) || null;
  }

  getActiveMemoriesWithVectors(): { memory: Memory; vector: Float64Array }[] {
    const results: { memory: Memory; vector: Float64Array }[] = [];
    for (const [id, mem] of this.memories) {
      if (mem.status !== "active") continue;
      const vec = this.vectors.get(id);
      if (vec) results.push({ memory: mem, vector: vec });
    }
    return results;
  }

  getField(): FieldResponse {
    const active = this.list();
    const edges: FieldEdge[] = [];

    for (let i = 0; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        const a = active[i];
        const b = active[j];
        const aEntities = new Set((a.entities || []).map((e) => e.toLowerCase()));
        const bEntities = (b.entities || []).map((e) => e.toLowerCase());
        const shared = bEntities.filter((e) => aEntities.has(e));
        if (shared.length > 0) {
          edges.push({ source_id: a.id, target_id: b.id, shared_entities: shared });
        }
      }
    }

    return { memories: active, edges };
  }

  reset(): void {
    this.memories.clear();
    this.vectors.clear();
    this.byCanonicalKey.clear();
  }

  stats() {
    const all = Array.from(this.memories.values());
    const active = all.filter((m) => m.status === "active");
    const trustSum = active.reduce((s, m) => s + m.trust, 0);
    const kinds: Record<string, number> = {};
    const tagCounts: Record<string, number> = {};
    const entityCounts: Record<string, number> = {};

    for (const m of active) {
      kinds[m.kind] = (kinds[m.kind] || 0) + 1;
      for (const t of m.tags) tagCounts[t] = (tagCounts[t] || 0) + 1;
      for (const e of m.entities) entityCounts[e] = (entityCounts[e] || 0) + 1;
    }

    return {
      total_memories: all.length,
      active_memories: active.length,
      stale_count: all.filter((m) => m.status === "stale").length,
      superseded_count: all.filter((m) => m.status === "superseded").length,
      deleted_count: all.filter((m) => m.status === "deleted").length,
      average_trust: active.length > 0 ? trustSum / active.length : 0,
      trust_distribution: { high: active.filter((m) => m.trust >= 0.8).length, medium: active.filter((m) => m.trust >= 0.5 && m.trust < 0.8).length, low: active.filter((m) => m.trust < 0.5).length },
      memory_kinds: kinds,
      tag_counts: tagCounts,
      entity_counts: entityCounts,
    };
  }
}
