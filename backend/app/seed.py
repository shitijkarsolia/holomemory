"""Seed data for demo purposes."""

from sqlalchemy.orm import Session

from app.schemas import MemoryCreate
from app.services.memory_service import create_memory

SEED_MEMORIES = [
    MemoryCreate(
        text="The user is building HoloMemory as a portfolio project.",
        kind="fact",
        subject="user",
        predicate="is_building",
        object="holomemory portfolio project",
        entities=["user", "holomemory", "portfolio"],
        tags=["project", "portfolio", "agent-memory"],
        source="seed",
        trust=0.95,
    ),
    MemoryCreate(
        text="The project uses FastAPI, SQLite, NumPy, and Next.js.",
        kind="fact",
        subject="project",
        predicate="uses",
        object="fastapi sqlite numpy nextjs",
        entities=["project", "fastapi", "sqlite", "numpy", "nextjs"],
        tags=["stack", "technology", "architecture"],
        source="seed",
        trust=0.95,
    ),
    MemoryCreate(
        text="The user does not want Streamlit for the UI.",
        kind="preference",
        subject="user",
        predicate="rejects",
        object="streamlit",
        entities=["user", "streamlit", "ui"],
        tags=["preference", "ui", "anti-pattern"],
        source="seed",
        trust=0.9,
    ),
    MemoryCreate(
        text="The UI should feel like a polished developer tool, similar to Linear or Raycast.",
        kind="preference",
        subject="ui",
        predicate="should_feel_like",
        object="polished developer tool",
        entities=["ui", "linear", "raycast", "developer tool"],
        tags=["preference", "design", "ux"],
        source="seed",
        trust=0.9,
    ),
    MemoryCreate(
        text="The memory engine uses HRR-style binding and superposition for encoding.",
        kind="fact",
        subject="memory engine",
        predicate="uses",
        object="hrr binding superposition",
        entities=["memory engine", "hrr", "binding", "superposition"],
        tags=["architecture", "hrr", "encoding"],
        source="seed",
        trust=0.95,
    ),
    MemoryCreate(
        text="The benchmark compares keyword, holographic, and hybrid retrieval modes.",
        kind="fact",
        subject="benchmark",
        predicate="compares",
        object="keyword holographic hybrid retrieval",
        entities=["benchmark", "keyword", "holographic", "hybrid", "retrieval"],
        tags=["evaluation", "benchmark", "retrieval"],
        source="seed",
        trust=0.9,
    ),
    MemoryCreate(
        text="The user prefers detailed explanations with clear intuition over terse summaries.",
        kind="preference",
        subject="user",
        predicate="prefers",
        object="detailed explanations with intuition",
        entities=["user", "explanations", "communication"],
        tags=["preference", "communication", "style"],
        source="seed",
        trust=0.85,
    ),
    MemoryCreate(
        text="Circular convolution via FFT is used for binding two concept vectors together.",
        kind="note",
        subject="binding",
        predicate="implemented_via",
        object="circular convolution fft",
        entities=["binding", "circular convolution", "fft"],
        tags=["implementation", "hrr", "math"],
        source="seed",
        trust=0.9,
    ),
    MemoryCreate(
        text="Cleanup memory maps noisy recovered vectors back to known symbols using cosine similarity.",
        kind="note",
        subject="cleanup memory",
        predicate="maps_to",
        object="known symbols via cosine similarity",
        entities=["cleanup memory", "cosine similarity", "symbols"],
        tags=["implementation", "hrr", "retrieval"],
        source="seed",
        trust=0.9,
    ),
    MemoryCreate(
        text="The project should work locally with SQLite and not require external paid services.",
        kind="preference",
        subject="project",
        predicate="requires",
        object="local-first sqlite no paid services",
        entities=["project", "sqlite", "local-first"],
        tags=["architecture", "constraint", "local-first"],
        source="seed",
        trust=0.95,
    ),
    MemoryCreate(
        text="Symbol vectors are deterministic: the same string always produces the same vector.",
        kind="fact",
        subject="symbol vectors",
        predicate="are",
        object="deterministic",
        entities=["symbol vectors", "determinism"],
        tags=["hrr", "property", "implementation"],
        source="seed",
        trust=0.95,
    ),
    MemoryCreate(
        text="The user wants the project to demonstrate AI infrastructure thinking, not just be a chatbot wrapper.",
        kind="preference",
        subject="user",
        predicate="wants",
        object="ai infrastructure demonstration",
        entities=["user", "ai infrastructure", "portfolio"],
        tags=["portfolio", "positioning", "goal"],
        source="seed",
        trust=0.9,
    ),
    MemoryCreate(
        text="Older note: The project may use Streamlit for quick demo.",
        kind="note",
        subject="project",
        predicate="may_use",
        object="streamlit",
        entities=["project", "streamlit"],
        tags=["ui", "deprecated"],
        source="seed",
        trust=0.3,
    ),
    MemoryCreate(
        text="Each memory stores both a human-readable record and a high-dimensional vector trace.",
        kind="fact",
        subject="memory",
        predicate="stores",
        object="human-readable record and vector trace",
        entities=["memory", "vector trace", "record"],
        tags=["architecture", "storage", "dual-representation"],
        source="seed",
        trust=0.9,
    ),
    MemoryCreate(
        text="Hybrid retrieval combines holographic score, keyword score, trust, and entity overlap.",
        kind="fact",
        subject="hybrid retrieval",
        predicate="combines",
        object="holographic keyword trust entity scores",
        entities=["hybrid retrieval", "holographic", "keyword", "trust"],
        tags=["retrieval", "algorithm", "scoring"],
        source="seed",
        trust=0.9,
    ),
]


def seed_database(db: Session) -> int:
    """Seed the database with demo memories. Returns count of memories created."""
    count = 0
    for mem_data in SEED_MEMORIES:
        create_memory(db, mem_data)
        count += 1

    # Mark the superseded one
    from app.models import Memory
    superseded = db.query(Memory).filter(Memory.text.ilike("%streamlit for quick demo%")).first()
    if superseded:
        superseded.status = "superseded"
        db.commit()

    return count
