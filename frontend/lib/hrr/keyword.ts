import { tokenize, tokenizeWithSurface } from "./encoder";

export interface KeywordResult {
  memoryId: string;
  score: number;
  matchedTerms: string[];
}

interface MemoryDoc {
  id: string;
  text: string;
  subject?: string | null;
  predicate?: string | null;
  object?: string | null;
  entities?: string[];
  tags?: string[];
}

export function keywordSearch(query: string, memories: MemoryDoc[], topK: number = 5): KeywordResult[] {
  const queryPairs = tokenizeWithSurface(query);
  if (queryPairs.length === 0) return [];

  const queryStems = queryPairs.map((p) => p.stem);
  const surfaceByStem = new Map(queryPairs.map((p) => [p.stem, p.surface]));

  const results: KeywordResult[] = [];

  for (const mem of memories) {
    const docTokens = new Set<string>();
    for (const t of tokenize(mem.text)) docTokens.add(t);
    if (mem.subject) for (const t of tokenize(mem.subject)) docTokens.add(t);
    if (mem.predicate) for (const t of tokenize(mem.predicate)) docTokens.add(t);
    if (mem.object) for (const t of tokenize(mem.object)) docTokens.add(t);
    if (mem.entities) for (const e of mem.entities) for (const t of tokenize(e)) docTokens.add(t);
    if (mem.tags) for (const t of mem.tags) for (const tt of tokenize(t)) docTokens.add(tt);

    const matchedStems = queryStems.filter((s) => docTokens.has(s));
    if (matchedStems.length > 0) {
      results.push({
        memoryId: mem.id,
        score: matchedStems.length / queryStems.length,
        matchedTerms: matchedStems.map((s) => surfaceByStem.get(s) ?? s),
      });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, topK);
}
