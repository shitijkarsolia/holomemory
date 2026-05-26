"""Holographic and hybrid retrieval strategies."""

import time
from dataclasses import dataclass, field

import numpy as np
from sqlalchemy.orm import Session

from app.memory.encoder import build_query_probe, _tokenize
from app.memory.hrr import cosine_similarity
from app.memory.keyword import keyword_search
from app.models import Memory
from app.schemas import (
    MemoryOut,
    QueryResponse,
    RetrievalResult,
    ScoreComponents,
)
from app.services.memory_service import get_all_vectors, list_memories

# Weights for the hybrid scoring formula. Kept in one place so the explainer
# UI (BiggestComponent) can use identical weights when deciding which
# component drove a result. Must sum to 1 and stay in sync with the
# TypeScript mirror at frontend/lib/hrr/retrieval.ts.
#
# Relevance signals (holographic + keyword + entity) get 90% of the weight;
# trust gets 10% and is *centered around 0.5* in the scoring formula so a
# neutral-trust memory contributes 0 from the trust term, only above-neutral
# trust adds, and below-neutral trust contributes nothing (rather than the
# raw value adding ~0.13 unconditionally as it did before).
HYBRID_WEIGHTS = {
    "holographic": 0.45,
    "keyword": 0.35,
    "trust": 0.10,
    "entity": 0.10,
}


def trust_signal(trust: float) -> float:
    """Map raw trust [0,1] to a scoring signal in [0,1] centered at 0.5.

    trust=0.5 -> 0   (neutral, no contribution)
    trust=1.0 -> 1   (full positive contribution)
    trust<0.5 -> 0   (clamped; low trust shouldn't *subtract*, just not boost)
    """
    return max(0.0, (trust - 0.5) * 2.0)


@dataclass
class _ScoredMemory:
    memory: Memory
    holographic_score: float = 0.0
    keyword_score: float = 0.0
    trust_score: float = 0.0
    entity_overlap: float = 0.0
    final_score: float = 0.0
    reasons: list[str] = field(default_factory=list)


def query_memories(
    db: Session,
    query: str,
    mode: str = "hybrid",
    top_k: int = 5,
) -> QueryResponse:
    start = time.perf_counter()

    memories = list_memories(db, status="active", limit=500)
    if not memories:
        elapsed = (time.perf_counter() - start) * 1000
        return QueryResponse(query=query, mode=mode, latency_ms=elapsed, results=[])

    query_tokens = _tokenize(query)

    if mode == "keyword":
        scored = _keyword_only(memories, query, query_tokens, top_k)
    elif mode == "holographic":
        scored = _holographic_only(db, memories, query, query_tokens, top_k)
    else:
        scored = _hybrid(db, memories, query, query_tokens, top_k)

    elapsed = (time.perf_counter() - start) * 1000

    results = []
    for sm in scored[:top_k]:
        results.append(RetrievalResult(
            memory=MemoryOut.model_validate(sm.memory),
            score=round(sm.final_score, 4),
            components=ScoreComponents(
                holographic=round(sm.holographic_score, 4),
                keyword=round(sm.keyword_score, 4),
                trust=round(sm.trust_score, 4),
                entity_overlap=round(sm.entity_overlap, 4),
            ),
            why=sm.reasons,
        ))

    return QueryResponse(
        query=query,
        mode=mode,
        latency_ms=round(elapsed, 2),
        results=results,
        debug={"query_symbols": query_tokens[:10], "dimension": 1024},
    )


def _keyword_only(
    memories: list[Memory],
    query: str,
    query_tokens: list[str],
    top_k: int,
) -> list[_ScoredMemory]:
    mem_dicts = [_mem_to_dict(m) for m in memories]
    kw_results = keyword_search(query, mem_dicts, top_k=top_k * 2)
    kw_map = {r.memory_id: r for r in kw_results}

    scored = []
    for mem in memories:
        if mem.id not in kw_map:
            continue
        kr = kw_map[mem.id]
        sm = _ScoredMemory(memory=mem)
        sm.keyword_score = kr.score
        sm.trust_score = mem.trust
        sm.final_score = kr.score
        sm.reasons = [f"Matched keywords: {', '.join(kr.matched_terms)}"]
        if mem.trust >= 0.8:
            sm.reasons.append(f"High trust: {mem.trust}")
        scored.append(sm)

    scored.sort(key=lambda s: s.final_score, reverse=True)
    return scored[:top_k]


def _holographic_only(
    db: Session,
    memories: list[Memory],
    query: str,
    query_tokens: list[str],
    top_k: int,
) -> list[_ScoredMemory]:
    vectors = get_all_vectors(db)
    probe = build_query_probe(query)

    scored = []
    for mem in memories:
        vec = vectors.get(mem.id)
        if vec is None:
            continue
        sim = cosine_similarity(probe, vec)
        sm = _ScoredMemory(memory=mem)
        sm.holographic_score = max(0.0, sim)
        sm.trust_score = mem.trust
        sm.final_score = max(0.0, sim)
        if sim > 0.1:
            sm.reasons.append(f"High holographic similarity: {sim:.3f}")
        _add_entity_reasons(sm, mem, query_tokens)
        scored.append(sm)

    scored.sort(key=lambda s: s.final_score, reverse=True)
    return scored[:top_k]


def _hybrid(
    db: Session,
    memories: list[Memory],
    query: str,
    query_tokens: list[str],
    top_k: int,
) -> list[_ScoredMemory]:
    vectors = get_all_vectors(db)
    probe = build_query_probe(query)

    mem_dicts = [_mem_to_dict(m) for m in memories]
    kw_results = keyword_search(query, mem_dicts, top_k=len(memories))
    kw_map = {r.memory_id: r for r in kw_results}

    scored = []
    for mem in memories:
        sm = _ScoredMemory(memory=mem)

        vec = vectors.get(mem.id)
        if vec is not None:
            sim = cosine_similarity(probe, vec)
            sm.holographic_score = max(0.0, sim)

        kr = kw_map.get(mem.id)
        if kr:
            sm.keyword_score = kr.score
            sm.reasons.append(f"Matched keywords: {', '.join(kr.matched_terms)}")

        sm.trust_score = mem.trust

        entity_overlap = _compute_entity_overlap(mem, query_tokens)
        sm.entity_overlap = entity_overlap

        # Trust enters the score *centered* at 0.5 so it functions as a
        # mild prior, not a constant ~0.135 boost that lets high-trust
        # noise outrank a real holographic match. The raw mem.trust is
        # still surfaced via sm.trust_score for the UI.
        sm.final_score = (
            HYBRID_WEIGHTS["holographic"] * sm.holographic_score
            + HYBRID_WEIGHTS["keyword"] * sm.keyword_score
            + HYBRID_WEIGHTS["trust"] * trust_signal(mem.trust)
            + HYBRID_WEIGHTS["entity"] * sm.entity_overlap
        )

        if sm.holographic_score > 0.1:
            sm.reasons.append(f"Holographic similarity: {sm.holographic_score:.3f}")
        if sm.trust_score >= 0.8:
            sm.reasons.append(f"Trust score: {sm.trust_score}")
        if entity_overlap > 0:
            sm.reasons.append(f"Entity overlap: {entity_overlap:.2f}")

        scored.append(sm)

    scored.sort(key=lambda s: s.final_score, reverse=True)
    return scored[:top_k]


def _compute_entity_overlap(mem: Memory, query_tokens: list[str]) -> float:
    """Jaccard overlap between query tokens and memory entity tokens.

    Was `overlap / len(query_tokens)` (query-relative recall), which made
    short queries score artificially high — a 2-token query with both
    matching scored 1.0, a 10-token query with the same absolute overlap
    scored 0.2. Jaccard normalizes by the union, giving a score that is
    comparable across queries of different lengths.
    """
    mem_entities: set[str] = set()
    for e in (mem.entities or []):
        mem_entities.update(_tokenize(e))
    if mem.subject:
        mem_entities.update(_tokenize(mem.subject))
    if mem.object:
        mem_entities.update(_tokenize(mem.object))

    if not mem_entities or not query_tokens:
        return 0.0

    query_set = set(query_tokens)
    overlap = len(query_set & mem_entities)
    union = len(query_set | mem_entities)
    return overlap / union if union else 0.0


def _add_entity_reasons(sm: _ScoredMemory, mem: Memory, query_tokens: list[str]):
    entities: set[str] = set()
    for e in (mem.entities or []):
        entities.update(_tokenize(e))
    matched = [t for t in query_tokens if t in entities]
    if matched:
        sm.reasons.append(f"Matched entities: {', '.join(matched)}")


def _mem_to_dict(mem: Memory) -> dict:
    return {
        "id": mem.id,
        "text": mem.text,
        "entities": mem.entities or [],
        "tags": mem.tags or [],
        "subject": mem.subject,
        "predicate": mem.predicate,
        "object": mem.object,
    }
