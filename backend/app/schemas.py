from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class MemoryCreate(BaseModel):
    text: str
    kind: str = "note"
    subject: str | None = None
    predicate: str | None = None
    object: str | None = None
    entities: list[str] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)
    source: str = "api"
    trust: float = 0.7


class MemoryUpdate(BaseModel):
    text: str | None = None
    kind: str | None = None
    subject: str | None = None
    predicate: str | None = None
    object: str | None = None
    entities: list[str] | None = None
    tags: list[str] | None = None
    trust: float | None = None
    status: str | None = None


class MemoryOut(BaseModel):
    id: str
    text: str
    kind: str
    subject: str | None
    predicate: str | None
    object: str | None
    entities: list[str]
    tags: list[str]
    source: str
    trust: float
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class QueryRequest(BaseModel):
    query: str
    mode: str = "hybrid"
    top_k: int = 5


class ScoreComponents(BaseModel):
    holographic: float = 0.0
    keyword: float = 0.0
    trust: float = 0.0
    entity_overlap: float = 0.0


class RetrievalResult(BaseModel):
    memory: MemoryOut
    score: float
    components: ScoreComponents
    why: list[str]


class QueryResponse(BaseModel):
    query: str
    mode: str
    latency_ms: float
    results: list[RetrievalResult]
    debug: dict[str, Any] = Field(default_factory=dict)


class StatsResponse(BaseModel):
    total_memories: int
    active_memories: int
    stale_count: int
    superseded_count: int
    deleted_count: int
    average_trust: float
    trust_distribution: dict[str, int]
    memory_kinds: dict[str, int]
    tag_counts: dict[str, int]
    entity_counts: dict[str, int]


class DuelRequest(BaseModel):
    query: str
    top_k: int = 5


class DuelResponse(BaseModel):
    query: str
    holographic: QueryResponse
    keyword: QueryResponse


class NoiseRequest(BaseModel):
    count: int = 5


class ContradictionRequest(BaseModel):
    memory_id: str


class FieldEdge(BaseModel):
    source_id: str
    target_id: str
    shared_entities: list[str]


class FieldResponse(BaseModel):
    memories: list[MemoryOut]
    edges: list[FieldEdge]


class ExperimentRequest(BaseModel):
    num_queries: int = 10


class ModeResult(BaseModel):
    recall_at_1: float
    recall_at_3: float
    recall_at_5: float
    avg_latency_ms: float


class ExperimentResponse(BaseModel):
    num_memories: int
    num_queries: int
    keyword: ModeResult
    holographic: ModeResult
    hybrid: ModeResult
    notes: list[str]
