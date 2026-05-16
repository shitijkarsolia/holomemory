import type { MemoryCreate } from "./types";

export interface DemoFact extends MemoryCreate {
  displaySubject: string;
  displayPredicate: string;
  displayObject: string;
}

export const DEMO_FACTS: DemoFact[] = [
  {
    text: "Sarah owns the auth service and maintains the login flow.",
    kind: "fact",
    subject: "Sarah",
    predicate: "owns",
    object: "auth service",
    entities: ["Sarah", "auth service", "login"],
    tags: ["ownership"],
    source: "user",
    trust: 0.9,
    displaySubject: "Sarah",
    displayPredicate: "owns",
    displayObject: "auth service",
  },
  {
    text: "The auth service uses PostgreSQL for session storage.",
    kind: "fact",
    subject: "auth service",
    predicate: "uses",
    object: "PostgreSQL",
    entities: ["auth service", "PostgreSQL"],
    tags: ["tech-stack"],
    source: "user",
    trust: 0.85,
    displaySubject: "auth service",
    displayPredicate: "uses",
    displayObject: "PostgreSQL",
  },
  {
    text: "Jake refactored the payment module last sprint.",
    kind: "fact",
    subject: "Jake",
    predicate: "refactored",
    object: "payment module",
    entities: ["Jake", "payment module"],
    tags: ["recent-change"],
    source: "user",
    trust: 0.9,
    displaySubject: "Jake",
    displayPredicate: "refactored",
    displayObject: "payment module",
  },
  {
    text: "The API gateway was migrated from Express to Fastify in March.",
    kind: "fact",
    subject: "API gateway",
    predicate: "migrated to",
    object: "Fastify",
    entities: ["API gateway", "Express", "Fastify"],
    tags: ["migration", "recent-change"],
    source: "user",
    trust: 0.8,
    displaySubject: "API gateway",
    displayPredicate: "migrated to",
    displayObject: "Fastify",
  },
  {
    text: "An unverified source claims the auth service uses MongoDB.",
    kind: "note",
    subject: "auth service",
    predicate: "uses",
    object: "MongoDB",
    entities: ["auth service", "MongoDB"],
    tags: ["dubious"],
    source: "synthetic",
    trust: 0.2,
    displaySubject: "auth service",
    displayPredicate: "uses",
    displayObject: "MongoDB",
  },
];

export const DEMO_QUERY_INDIRECT = "Who should I ask about login?";
export const DEMO_QUERY_TRUST = "What database does the auth service use?";

export type DemoStep =
  | "idle"
  | "teaching"
  | "encoding"
  | "ready_to_query"
  | "recalling"
  | "duel"
  | "injecting_noise"
  | "contradiction_detected"
  | "summary";

export const NARRATOR_COPY: Record<DemoStep, { title: string; body: string }> = {
  idle: { title: "", body: "" },
  teaching: {
    title: "Encoding memories",
    body: "Each fact is decomposed into subject/predicate/object, then bound into a vector using circular convolution.",
  },
  encoding: {
    title: "Trace stored",
    body: "The vector was superposed into the shared memory field. Multiple facts coexist in the same space.",
  },
  ready_to_query: {
    title: "Ready to probe",
    body: "Ask something indirect. The system builds a probe vector and finds the closest traces by cosine similarity.",
  },
  recalling: {
    title: "Probing memory",
    body: "Matching traces light up based on holographic similarity, keyword overlap, trust, and entity overlap.",
  },
  duel: {
    title: "Recall comparison",
    body: "Same query, two methods. Holographic recall finds associations that keyword search misses.",
  },
  injecting_noise: {
    title: "Disturbing memory",
    body: "Low-trust memories enter the field but appear unstable. The scoring formula suppresses unreliable traces.",
  },
  contradiction_detected: {
    title: "Trust-aware recall",
    body: "The system prefers high-trust memories. Contradictory traces are flagged but don't dominate.",
  },
  summary: { title: "", body: "" },
};
