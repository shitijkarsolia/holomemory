import { tokenize } from "./encoder";

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
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const results: KeywordResult[] = [];

  for (const mem of memories) {
    const docTokens = new Set<string>();
    for (const t of tokenize(mem.text)) docTokens.add(t);
    if (mem.subject) docTokens.add(mem.subject.toLowerCase());
    if (mem.predicate) docTokens.add(mem.predicate.toLowerCase());
    if (mem.object) for (const t of mem.object.toLowerCase().split(/\s+/)) docTokens.add(t);
    if (mem.entities) for (const e of mem.entities) docTokens.add(e.toLowerCase());
    if (mem.tags) for (const t of mem.tags) docTokens.add(t.toLowerCase());

    const matched = queryTokens.filter((t) => docTokens.has(t));
    if (matched.length > 0) {
      results.push({
        memoryId: mem.id,
        score: matched.length / queryTokens.length,
        matchedTerms: matched,
      });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, topK);
}
