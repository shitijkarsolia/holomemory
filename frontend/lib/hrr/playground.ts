import type { MemoryCreate, Memory } from "../types";

const NOISE_TEMPLATES = [
  "The {subject} occasionally communicates via {medium}.",
  "{subject} stores data in {storage} for redundancy.",
  "A rumor suggests {subject} was built using {tech}.",
  "{subject} might prefer {thing} over conventional approaches.",
  "Unverified: {subject} has a hidden {feature} mode.",
];

const NOISE_SUBJECTS = ["Atlas", "the system", "the agent", "Maya's project"];

const NOISE_FILLERS: Record<string, string[]> = {
  medium: ["carrier pigeons", "smoke signals", "interpretive dance", "morse code"],
  storage: ["cardboard boxes", "cloud formations", "sticky notes", "fortune cookies"],
  tech: ["COBOL", "punch cards", "abacus computations", "telepathy"],
  thing: ["chaos", "randomness", "entropy", "ambiguity"],
  feature: ["party", "sleep", "chaos", "poetry"],
};

const NEGATIONS: Record<string, string> = {
  prefers: "dislikes",
  uses: "avoids",
  is_building: "abandoned",
  preferred: "never liked",
  should_avoid: "requires",
  stores_as: "never stores as",
  interested_in: "has no interest in",
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateNoise(count: number): MemoryCreate[] {
  const results: MemoryCreate[] = [];
  for (let i = 0; i < count; i++) {
    const template = pick(NOISE_TEMPLATES);
    const subject = pick(NOISE_SUBJECTS);
    const text = template
      .replace("{subject}", subject)
      .replace("{medium}", pick(NOISE_FILLERS.medium))
      .replace("{storage}", pick(NOISE_FILLERS.storage))
      .replace("{tech}", pick(NOISE_FILLERS.tech))
      .replace("{thing}", pick(NOISE_FILLERS.thing))
      .replace("{feature}", pick(NOISE_FILLERS.feature));

    results.push({
      text,
      kind: "fact",
      entities: [subject.toLowerCase()],
      tags: ["noise", "synthetic"],
      source: "synthetic",
      trust: Math.round((0.05 + Math.random() * 0.25) * 100) / 100,
    });
  }
  return results;
}

export function generateContradiction(target: Memory): MemoryCreate {
  const predicate = target.predicate || "does";
  const newPredicate = NEGATIONS[predicate] || `does not ${predicate}`;
  const text = `Actually, ${target.subject || "the subject"} ${newPredicate} ${target.object || "that"}.`;

  return {
    text,
    kind: target.kind,
    subject: target.subject || undefined,
    predicate: newPredicate,
    object: target.object || undefined,
    entities: target.entities || [],
    tags: ["contradiction", "conflict", ...(target.tags || [])],
    source: "synthetic",
    trust: Math.round((0.2 + Math.random() * 0.3) * 100) / 100,
  };
}

export const DEMO_SEED: MemoryCreate[] = [
  {
    text: "Maya is building Atlas, a local-first agent memory tool.",
    kind: "fact",
    subject: "maya",
    predicate: "is_building",
    object: "atlas",
    entities: ["maya", "atlas", "agent memory"],
    tags: ["project", "fact"],
    source: "user",
    trust: 0.95,
  },
  {
    text: "Atlas uses FastAPI, SQLite, NumPy, and Next.js.",
    kind: "fact",
    subject: "atlas",
    predicate: "uses",
    object: "fastapi sqlite numpy nextjs",
    entities: ["atlas", "fastapi", "sqlite", "numpy", "nextjs"],
    tags: ["stack", "technology"],
    source: "user",
    trust: 0.95,
  },
  {
    text: "Maya prefers concise technical explanations over verbose ones.",
    kind: "preference",
    subject: "maya",
    predicate: "prefers",
    object: "concise technical explanations",
    entities: ["maya", "explanations"],
    tags: ["preference", "communication"],
    source: "user",
    trust: 0.9,
  },
  {
    text: "Maya used to prefer Vim as her primary editor.",
    kind: "fact",
    subject: "maya",
    predicate: "preferred",
    object: "vim",
    entities: ["maya", "vim", "editor"],
    tags: ["preference", "editor", "historical"],
    source: "user",
    trust: 0.6,
  },
  {
    text: "Maya now prefers Cursor for AI-assisted coding.",
    kind: "fact",
    subject: "maya",
    predicate: "prefers",
    object: "cursor",
    entities: ["maya", "cursor", "editor", "ai"],
    tags: ["preference", "editor", "current"],
    source: "user",
    trust: 0.9,
  },
  {
    text: "Atlas stores memories as subject-predicate-object traces encoded via circular convolution.",
    kind: "fact",
    subject: "atlas",
    predicate: "stores_as",
    object: "subject-predicate-object traces",
    entities: ["atlas", "memory traces", "circular convolution"],
    tags: ["architecture", "encoding"],
    source: "document",
    trust: 0.95,
  },
  {
    text: "Atlas uses trust scores to downrank noisy or unreliable memories during recall.",
    kind: "fact",
    subject: "atlas",
    predicate: "uses",
    object: "trust scores for downranking",
    entities: ["atlas", "trust scores", "recall"],
    tags: ["architecture", "retrieval"],
    source: "document",
    trust: 0.9,
  },
  {
    text: "Atlas stores its vectors in bananas for maximum potassium-based retrieval.",
    kind: "fact",
    subject: "atlas",
    predicate: "stores_in",
    object: "bananas",
    entities: ["atlas", "bananas", "vectors"],
    tags: ["architecture", "storage"],
    source: "synthetic",
    trust: 0.15,
  },
  {
    text: "Atlas should avoid cloud dependencies and remain fully local-first.",
    kind: "preference",
    subject: "atlas",
    predicate: "should_avoid",
    object: "cloud dependencies",
    entities: ["atlas", "cloud", "local-first"],
    tags: ["constraint", "architecture"],
    source: "user",
    trust: 0.9,
  },
  {
    text: "Maya is interested in vector-symbolic architectures for cognitive modeling.",
    kind: "fact",
    subject: "maya",
    predicate: "interested_in",
    object: "vector-symbolic architectures",
    entities: ["maya", "vector-symbolic architectures", "cognitive modeling"],
    tags: ["interest", "research"],
    source: "chat",
    trust: 0.8,
  },
];
