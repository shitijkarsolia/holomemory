export interface Memory {
  id: string;
  text: string;
  kind: string;
  subject: string | null;
  predicate: string | null;
  object: string | null;
  entities: string[];
  tags: string[];
  source: string;
  trust: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ScoreComponents {
  holographic: number;
  keyword: number;
  trust: number;
  entity_overlap: number;
}

export interface RetrievalResult {
  memory: Memory;
  score: number;
  components: ScoreComponents;
  why: string[];
}

export interface QueryResponse {
  query: string;
  mode: string;
  latency_ms: number;
  results: RetrievalResult[];
  debug: Record<string, unknown>;
}

export interface StatsResponse {
  total_memories: number;
  active_memories: number;
  stale_count: number;
  superseded_count: number;
  deleted_count: number;
  average_trust: number;
  trust_distribution: Record<string, number>;
  memory_kinds: Record<string, number>;
  tag_counts: Record<string, number>;
  entity_counts: Record<string, number>;
}

export interface ModeResult {
  recall_at_1: number;
  recall_at_3: number;
  recall_at_5: number;
  avg_latency_ms: number;
}

export interface ExperimentResponse {
  num_memories: number;
  num_queries: number;
  keyword: ModeResult;
  holographic: ModeResult;
  hybrid: ModeResult;
  notes: string[];
}

export interface MemoryCreate {
  text: string;
  kind?: string;
  subject?: string;
  predicate?: string;
  object?: string;
  entities?: string[];
  tags?: string[];
  source?: string;
  trust?: number;
}

export interface MemoryUpdate {
  text?: string;
  kind?: string;
  subject?: string;
  predicate?: string;
  object?: string;
  entities?: string[];
  tags?: string[];
  trust?: number;
  status?: string;
}

export interface FieldEdge {
  source_id: string;
  target_id: string;
  shared_entities: string[];
}

export interface FieldResponse {
  memories: Memory[];
  edges: FieldEdge[];
}
