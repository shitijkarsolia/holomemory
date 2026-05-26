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

/**
 * Extra seed loaded by the playground hero on top of the curated 5-fact
 * Maya/Atlas demo (`api.demo.seed`). Lives here rather than inline in the
 * hero component so the UI file stays about UI and the data file holds the
 * data.
 */
export const EXTRA_SEED: MemoryCreate[] = [
  // Ownership facts
  { text: "Sarah owns the auth service and reviews every login PR.", kind: "fact", subject: "Sarah", predicate: "owns", object: "auth service", entities: ["Sarah", "auth service"], tags: ["ownership"], source: "user", trust: 0.92 },
  { text: "Jake owns the payments module after last sprint's refactor.", kind: "fact", subject: "Jake", predicate: "owns", object: "payments module", entities: ["Jake", "payments module"], tags: ["ownership"], source: "user", trust: 0.9 },
  { text: "Priya owns the search infrastructure across both products.", kind: "fact", subject: "Priya", predicate: "owns", object: "search infrastructure", entities: ["Priya", "search infrastructure"], tags: ["ownership"], source: "user", trust: 0.9 },
  { text: "Carlos owns the deployment pipeline and the on-call rotation.", kind: "fact", subject: "Carlos", predicate: "owns", object: "deployment pipeline", entities: ["Carlos", "deployment pipeline", "on-call"], tags: ["ownership"], source: "user", trust: 0.9 },
  { text: "Nora owns the analytics service and the dashboard tooling.", kind: "fact", subject: "Nora", predicate: "owns", object: "analytics service", entities: ["Nora", "analytics service"], tags: ["ownership"], source: "user", trust: 0.88 },

  // Tech stack
  { text: "The Atlas project uses FastAPI and SQLite for its prototype.", kind: "fact", subject: "Atlas project", predicate: "uses", object: "FastAPI", entities: ["Atlas project", "FastAPI", "SQLite"], tags: ["tech-stack"], source: "user", trust: 0.9 },
  { text: "The Helios service runs on Python 3.11 with asyncio everywhere.", kind: "fact", subject: "Helios service", predicate: "runs on", object: "Python 3.11", entities: ["Helios service", "Python 3.11", "asyncio"], tags: ["tech-stack"], source: "user", trust: 0.88 },
  { text: "The Forge build system migrated from Webpack to Vite in March.", kind: "fact", subject: "Forge", predicate: "migrated to", object: "Vite", entities: ["Forge", "Webpack", "Vite"], tags: ["migration", "tech-stack"], source: "user", trust: 0.85 },
  { text: "The Citadel project uses Postgres with read replicas in three regions.", kind: "fact", subject: "Citadel", predicate: "uses", object: "Postgres", entities: ["Citadel", "Postgres"], tags: ["tech-stack"], source: "user", trust: 0.9 },
  { text: "The Comet event bus runs Kafka with twelve partitions per topic.", kind: "fact", subject: "Comet", predicate: "uses", object: "Kafka", entities: ["Comet", "Kafka"], tags: ["tech-stack"], source: "user", trust: 0.86 },
  { text: "The Ember frontend uses Next.js and Tailwind.", kind: "fact", subject: "Ember frontend", predicate: "uses", object: "Next.js", entities: ["Ember frontend", "Next.js", "Tailwind"], tags: ["tech-stack"], source: "user", trust: 0.88 },

  // Preferences
  { text: "Maya prefers concise technical answers and dislikes filler text.", kind: "preference", subject: "Maya", predicate: "prefers", object: "concise answers", entities: ["Maya"], tags: ["preference"], source: "user", trust: 0.85 },
  { text: "Maya uses Cursor as her primary editor since April.", kind: "preference", subject: "Maya", predicate: "uses", object: "Cursor", entities: ["Maya", "Cursor"], tags: ["preference"], source: "user", trust: 0.9 },
  { text: "Jake prefers tests written with pytest, not unittest.", kind: "preference", subject: "Jake", predicate: "prefers", object: "pytest", entities: ["Jake", "pytest"], tags: ["preference"], source: "user", trust: 0.82 },
  { text: "Carlos prefers async-first APIs over blocking ones.", kind: "preference", subject: "Carlos", predicate: "prefers", object: "async APIs", entities: ["Carlos"], tags: ["preference"], source: "user", trust: 0.84 },
  { text: "Priya prefers writing design docs before any code is committed.", kind: "preference", subject: "Priya", predicate: "prefers", object: "design docs", entities: ["Priya"], tags: ["preference"], source: "user", trust: 0.86 },

  // Recent changes
  { text: "The login flow now uses passkeys as the default factor.", kind: "fact", subject: "login flow", predicate: "uses", object: "passkeys", entities: ["login flow", "passkeys"], tags: ["recent-change"], source: "user", trust: 0.88 },
  { text: "Payments switched the fraud check vendor from Stripe Radar to in-house.", kind: "fact", subject: "payments", predicate: "switched to", object: "in-house fraud check", entities: ["payments", "Stripe Radar"], tags: ["recent-change"], source: "user", trust: 0.82 },
  { text: "Analytics added a new cohort retention dashboard last week.", kind: "fact", subject: "analytics", predicate: "added", object: "cohort retention dashboard", entities: ["analytics", "dashboard"], tags: ["recent-change"], source: "user", trust: 0.86 },
  { text: "The deployment pipeline now runs canary releases for every service.", kind: "fact", subject: "deployment pipeline", predicate: "runs", object: "canary releases", entities: ["deployment pipeline", "canary"], tags: ["recent-change"], source: "user", trust: 0.9 },

  // Constraints
  { text: "Atlas must respond in under 200ms for the home feed.", kind: "constraint", subject: "Atlas", predicate: "responds in", object: "<200ms", entities: ["Atlas"], tags: ["constraint", "performance"], source: "user", trust: 0.9 },
  { text: "Helios must run on a single VM with 8GB of RAM.", kind: "constraint", subject: "Helios", predicate: "runs on", object: "single VM", entities: ["Helios"], tags: ["constraint"], source: "user", trust: 0.88 },
  { text: "All services must emit OpenTelemetry traces with the team's standard tags.", kind: "constraint", subject: "services", predicate: "emit", object: "OpenTelemetry", entities: ["OpenTelemetry"], tags: ["constraint", "observability"], source: "user", trust: 0.9 },

  // Cross-project facts
  { text: "Atlas and Helios share the same auth service.", kind: "fact", subject: "Atlas", predicate: "shares", object: "auth service", entities: ["Atlas", "Helios", "auth service"], tags: ["cross-project"], source: "user", trust: 0.86 },
  { text: "Forge bundles the Ember frontend before deploying to Citadel.", kind: "fact", subject: "Forge", predicate: "bundles", object: "Ember frontend", entities: ["Forge", "Ember frontend", "Citadel"], tags: ["cross-project"], source: "user", trust: 0.82 },

  // Lower-trust / contradictory candidates
  { text: "An unverified source claims the analytics service uses Redshift, not Postgres.", kind: "note", subject: "analytics service", predicate: "uses", object: "Redshift", entities: ["analytics service", "Redshift"], tags: ["dubious"], source: "synthetic", trust: 0.22 },
  { text: "Someone in chat said Jake handles auth now, but no PR confirms it.", kind: "note", subject: "Jake", predicate: "owns", object: "auth", entities: ["Jake", "auth"], tags: ["dubious"], source: "chat", trust: 0.25 },
  { text: "Outdated note: Maya used to prefer Vim.", kind: "note", subject: "Maya", predicate: "preferred", object: "Vim", entities: ["Maya", "Vim"], tags: ["outdated"], source: "document", trust: 0.35 },
  { text: "Rumor: the Citadel project will move off Postgres next quarter.", kind: "note", subject: "Citadel", predicate: "may migrate from", object: "Postgres", entities: ["Citadel", "Postgres"], tags: ["dubious", "speculation"], source: "chat", trust: 0.3 },
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
