import type { QueryResponse, RetrievalResult } from "../types";
import { buildQueryProbe, tokenize } from "./encoder";
import { cosineSimilarity } from "./hrr";
import { keywordSearch } from "./keyword";
import { MemoryStore } from "./store";

// Weights for the hybrid scoring formula. Kept in one place so the explainer
// UI (BiggestComponent) can use identical weights when deciding which
// component drove a result. Must stay in sync with backend/app/memory/retrieval.py.
//
// Relevance signals (holographic + keyword + entity) get 90% of the weight;
// trust gets 10% and is centered at 0.5 via `trustSignal` so a neutral-trust
// memory contributes 0 from the trust term and only above-neutral trust adds.
export const HYBRID_WEIGHTS = {
  holographic: 0.45,
  keyword: 0.35,
  trust: 0.1,
  entity: 0.1,
} as const;

/** Map raw trust [0,1] to a scoring signal in [0,1] centered at 0.5. */
export function trustSignal(trust: number): number {
  return Math.max(0, (trust - 0.5) * 2);
}

export function queryMemories(
  store: MemoryStore,
  query: string,
  mode: "hybrid" | "holographic" | "keyword" = "hybrid",
  topK: number = 5
): QueryResponse {
  const start = performance.now();
  const active = store.getActiveMemoriesWithVectors();
  const queryTokens = tokenize(query);

  if (active.length === 0 || queryTokens.length === 0) {
    return {
      query,
      mode,
      latency_ms: performance.now() - start,
      results: [],
      debug: {},
    };
  }

  const probe = buildQueryProbe(query);

  const scored: {
    holographic: number;
    keyword: number;
    trust: number;
    entityOverlap: number;
    final: number;
    memIdx: number;
  }[] = [];

  const keywordResults = keywordSearch(
    query,
    active.map((a) => a.memory),
    active.length
  );
  const keywordMap = new Map(keywordResults.map((r) => [r.memoryId, r]));

  for (let i = 0; i < active.length; i++) {
    const { memory, vector } = active[i];

    const holographic = Math.max(0, cosineSimilarity(probe, vector));
    const kw = keywordMap.get(memory.id);
    const keyword = kw ? kw.score : 0;
    const trust = memory.trust;

    const entitySet = new Set<string>();
    for (const e of memory.entities || []) for (const t of tokenize(e)) entitySet.add(t);
    if (memory.subject) for (const t of tokenize(memory.subject)) entitySet.add(t);
    if (memory.object) for (const t of tokenize(memory.object)) entitySet.add(t);
    // Jaccard: |intersection| / |union|. Mirrors backend
    // _compute_entity_overlap. Previously divided by len(query_tokens),
    // which made short queries score artificially high.
    const queryTokenSet = new Set(queryTokens);
    let intersection = 0;
    for (const t of queryTokenSet) if (entitySet.has(t)) intersection++;
    const unionSize = queryTokenSet.size + entitySet.size - intersection;
    const entityOverlap = unionSize > 0 ? intersection / unionSize : 0;

    let final: number;
    if (mode === "holographic") {
      final = holographic;
    } else if (mode === "keyword") {
      final = keyword;
    } else {
      // Trust enters centered at 0.5 (see trustSignal) so it acts as a
      // mild prior rather than a constant boost.
      final =
        HYBRID_WEIGHTS.holographic * holographic +
        HYBRID_WEIGHTS.keyword * keyword +
        HYBRID_WEIGHTS.trust * trustSignal(trust) +
        HYBRID_WEIGHTS.entity * entityOverlap;
    }

    if (final > 0.01) {
      scored.push({ holographic, keyword, trust, entityOverlap, final, memIdx: i });
    }
  }

  scored.sort((a, b) => b.final - a.final);
  const topResults = scored.slice(0, topK);

  const results: RetrievalResult[] = topResults.map((s) => {
    const { memory } = active[s.memIdx];
    const why: string[] = [];

    if (s.holographic > 0.1) why.push(`Vector similarity: ${(s.holographic * 100).toFixed(0)}%`);
    if (s.keyword > 0) {
      const kw = keywordMap.get(memory.id);
      if (kw) why.push(`Keyword match: ${kw.matchedTerms.join(", ")}`);
    }
    if (s.entityOverlap > 0) why.push(`Entity overlap detected`);
    if (memory.trust >= 0.8) why.push(`High trust source (${memory.trust.toFixed(2)})`);
    if (memory.trust < 0.4) why.push(`Low trust — downranked (${memory.trust.toFixed(2)})`);

    return {
      memory,
      score: s.final,
      components: {
        holographic: s.holographic,
        keyword: s.keyword,
        trust: s.trust,
        entity_overlap: s.entityOverlap,
      },
      why,
    };
  });

  return {
    query,
    mode,
    latency_ms: performance.now() - start,
    results,
    debug: { engine: "client-side", memories_searched: active.length },
  };
}
