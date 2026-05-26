"""Experiment runner: benchmarks retrieval modes against synthetic queries."""

import re
import time

from sqlalchemy.orm import Session

from app.memory.retrieval import query_memories
from app.models import Memory
from app.schemas import ExperimentResponse, ModeResult


BENCHMARK_QUERIES = [
    {"query": "What does the user prefer?", "expected_entity": "user"},
    {"query": "What is the project about?", "expected_entity": "project"},
    {"query": "What technology stack is used?", "expected_entity": "stack"},
    {"query": "What UI framework is preferred?", "expected_entity": "ui"},
    {"query": "How does the memory engine work?", "expected_entity": "memory"},
    {"query": "What retrieval modes exist?", "expected_entity": "retrieval"},
    {"query": "What is holographic memory?", "expected_entity": "holographic"},
    {"query": "What database is used?", "expected_entity": "sqlite"},
    {"query": "What are the user preferences?", "expected_entity": "user"},
    {"query": "What is the benchmark comparing?", "expected_entity": "benchmark"},
]


def run_experiment(db: Session, num_queries: int = 10) -> ExperimentResponse:
    memories = db.query(Memory).filter(Memory.status == "active").all()
    if not memories:
        empty = ModeResult(recall_at_1=0, recall_at_3=0, recall_at_5=0, avg_latency_ms=0)
        return ExperimentResponse(
            num_memories=0,
            num_queries=0,
            keyword=empty,
            holographic=empty,
            hybrid=empty,
            notes=["No memories available for benchmarking."],
        )

    queries = BENCHMARK_QUERIES[:num_queries]

    keyword_metrics = _run_mode(db, queries, memories, "keyword")
    holographic_metrics = _run_mode(db, queries, memories, "holographic")
    hybrid_metrics = _run_mode(db, queries, memories, "hybrid")

    notes = [
        "Hybrid combines holographic (45%), keyword (35%), trust (10%), entity overlap (10%).",
        "Trust is centered at 0.5 in the score so neutral trust doesn't add a constant boost.",
        "Holographic retrieval uses algebraic probe vectors — approximate, not exact.",
        "Keyword baseline uses simple token overlap scoring.",
        "Recall@k is measured by word-boundary match on the result's text/entities/tags/subject.",
        f"Tested against {len(memories)} active memories with {len(queries)} queries.",
    ]

    return ExperimentResponse(
        num_memories=len(memories),
        num_queries=len(queries),
        keyword=keyword_metrics,
        holographic=holographic_metrics,
        hybrid=hybrid_metrics,
        notes=notes,
    )


def _run_mode(
    db: Session,
    queries: list[dict],
    memories: list[Memory],
    mode: str,
) -> ModeResult:
    hits_at_1 = 0
    hits_at_3 = 0
    hits_at_5 = 0
    total_latency = 0.0

    for q in queries:
        start = time.perf_counter()
        response = query_memories(db, q["query"], mode=mode, top_k=5)
        elapsed = (time.perf_counter() - start) * 1000
        total_latency += elapsed

        expected = q["expected_entity"].lower()
        # Match on word boundaries — substring matching ('ui' in 'building',
        # 'user' in 'username') previously inflated recall@k by counting
        # spurious overlaps as hits.
        expected_pattern = re.compile(r"\b" + re.escape(expected) + r"\b")

        result_texts = []
        for r in response.results:
            combined = (
                r.memory.text.lower()
                + " ".join(r.memory.entities).lower()
                + " ".join(r.memory.tags).lower()
                + (r.memory.subject or "").lower()
            )
            result_texts.append(combined)

        def _hit(text: str) -> bool:
            return expected_pattern.search(text) is not None

        if result_texts and _hit(result_texts[0]):
            hits_at_1 += 1
        if any(_hit(t) for t in result_texts[:3]):
            hits_at_3 += 1
        if any(_hit(t) for t in result_texts[:5]):
            hits_at_5 += 1

    n = len(queries)
    return ModeResult(
        recall_at_1=round(hits_at_1 / n, 3) if n else 0,
        recall_at_3=round(hits_at_3 / n, 3) if n else 0,
        recall_at_5=round(hits_at_5 / n, 3) if n else 0,
        avg_latency_ms=round(total_latency / n, 2) if n else 0,
    )
