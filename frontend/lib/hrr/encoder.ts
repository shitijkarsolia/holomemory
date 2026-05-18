import { newStemmer } from "snowball-stemmers";
import { symbolVector, bind, superpose, HRR_DIMENSION } from "./hrr";

export const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "shall", "can", "to", "of", "in", "for",
  "on", "with", "at", "by", "from", "as", "into", "through", "during",
  "before", "after", "above", "below", "between", "and", "but", "or",
  "nor", "not", "so", "yet", "both", "either", "neither", "each",
  "every", "all", "any", "few", "more", "most", "other", "some",
  "such", "no", "only", "own", "same", "than", "too", "very",
  "just", "because", "if", "when", "where", "how", "what", "which",
  "who", "whom", "this", "that", "these", "those", "it", "its",
]);

const STEMMER = newStemmer("english");
const STEM_CACHE = new Map<string, string>();

export function stem(token: string): string {
  const cached = STEM_CACHE.get(token);
  if (cached !== undefined) return cached;
  const out = STEMMER.stem(token);
  STEM_CACHE.set(token, out);
  return out;
}

export function tokenize(text: string): string[] {
  const words = text.toLowerCase().match(/[a-z0-9]+/g) || [];
  const out: string[] = [];
  for (const w of words) {
    if (w.length <= 1) continue;
    if (STOPWORDS.has(w)) continue;
    out.push(stem(w));
  }
  return out;
}

export function tokenizeWithSurface(text: string): { stem: string; surface: string }[] {
  const words = text.toLowerCase().match(/[a-z0-9]+/g) || [];
  const out: { stem: string; surface: string }[] = [];
  for (const w of words) {
    if (w.length <= 1) continue;
    if (STOPWORDS.has(w)) continue;
    out.push({ stem: stem(w), surface: w });
  }
  return out;
}

export function encodeMemory(opts: {
  text: string;
  subject?: string | null;
  predicate?: string | null;
  object?: string | null;
  entities?: string[];
  tags?: string[];
}): Float64Array {
  const traces: Float64Array[] = [];

  const roleSubject = symbolVector("__ROLE_SUBJECT__");
  const rolePredicate = symbolVector("__ROLE_PREDICATE__");
  const roleObject = symbolVector("__ROLE_OBJECT__");
  const roleEntity = symbolVector("__ROLE_ENTITY__");
  const roleTag = symbolVector("__ROLE_TAG__");
  const roleToken = symbolVector("__ROLE_TOKEN__");

  if (opts.subject) {
    traces.push(bind(roleSubject, symbolVector(opts.subject.toLowerCase())));
  }
  if (opts.predicate) {
    traces.push(bind(rolePredicate, symbolVector(opts.predicate.toLowerCase())));
  }
  if (opts.object) {
    traces.push(bind(roleObject, symbolVector(opts.object.toLowerCase())));
  }

  if (opts.entities) {
    for (const entity of opts.entities) {
      traces.push(bind(roleEntity, symbolVector(entity.toLowerCase())));
    }
  }

  if (opts.tags) {
    for (const tag of opts.tags) {
      traces.push(bind(roleTag, symbolVector(tag.toLowerCase())));
    }
  }

  const tokens = tokenize(opts.text).slice(0, 20);
  for (const token of tokens) {
    traces.push(bind(roleToken, symbolVector(token)));
  }

  if (traces.length === 0) return new Float64Array(HRR_DIMENSION);
  return superpose(traces);
}

export function buildQueryProbe(query: string, targetRole?: string): Float64Array {
  const tokens = tokenize(query).slice(0, 10);
  if (tokens.length === 0) return new Float64Array(HRR_DIMENSION);

  const probes: Float64Array[] = [];

  if (targetRole) {
    const roleVec = symbolVector(`__ROLE_${targetRole.toUpperCase()}__`);
    for (const token of tokens) {
      probes.push(bind(roleVec, symbolVector(token)));
    }
  } else {
    const roleToken = symbolVector("__ROLE_TOKEN__");
    const roleEntity = symbolVector("__ROLE_ENTITY__");
    for (const token of tokens) {
      probes.push(bind(roleToken, symbolVector(token)));
      probes.push(bind(roleEntity, symbolVector(token)));
    }
  }

  return superpose(probes);
}
