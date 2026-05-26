"""Playground-specific API routes for the interactive demo."""

import random
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.demo_seed import MAYA_ATLAS_SCENARIO
from app.memory.retrieval import query_memories
from app.models import Memory, MemoryVector, Symbol
from app.schemas import (
    ContradictionRequest,
    DuelRequest,
    DuelResponse,
    FieldEdge,
    FieldResponse,
    MemoryOut,
    NoiseRequest,
)
from app.services.memory_service import create_memory, get_memory

playground_router = APIRouter()

NOISE_TEMPLATES = [
    "The {subject} occasionally communicates via {medium}.",
    "{subject} stores data in {storage} for redundancy.",
    "A rumor suggests {subject} was built using {tech}.",
    "{subject} might prefer {thing} over conventional approaches.",
    "Unverified: {subject} has a hidden {feature} mode.",
]

NOISE_SUBJECTS = ["Atlas", "the system", "the agent", "Maya's project"]
NOISE_FILLERS = {
    "medium": ["carrier pigeons", "smoke signals", "interpretive dance", "morse code"],
    "storage": ["cardboard boxes", "cloud formations", "sticky notes", "fortune cookies"],
    "tech": ["COBOL", "punch cards", "abacus computations", "telepathy"],
    "thing": ["chaos", "randomness", "entropy", "ambiguity"],
    "feature": ["party", "sleep", "chaos", "poetry"],
}


@playground_router.post("/demo/seed")
def demo_seed(db: Session = Depends(get_db)):
    """Idempotently re-seed the curated Maya/Atlas demo scenario.

    Only memories with source='demo' are removed before re-seeding —
    user-created memories are preserved. (Previously this called
    `_hard_reset`, which silently destroyed all user data.)
    """
    _delete_demo_memories(db)
    created = []
    for mem_data in MAYA_ATLAS_SCENARIO:
        mem = create_memory(db, mem_data)
        created.append(MemoryOut.model_validate(mem))
    return {"status": "ok", "memories_created": len(created), "memories": created}


@playground_router.post("/memory/duel", response_model=DuelResponse)
def memory_duel(data: DuelRequest, db: Session = Depends(get_db)):
    holographic = query_memories(db, data.query, mode="holographic", top_k=data.top_k)
    keyword = query_memories(db, data.query, mode="keyword", top_k=data.top_k)
    return DuelResponse(query=data.query, holographic=holographic, keyword=keyword)


@playground_router.post("/memory/noise")
def add_noise(data: NoiseRequest, db: Session = Depends(get_db)):
    from app.schemas import MemoryCreate

    created = []
    for _ in range(data.count):
        template = random.choice(NOISE_TEMPLATES)
        subject = random.choice(NOISE_SUBJECTS)
        filled = template.format(
            subject=subject,
            medium=random.choice(NOISE_FILLERS["medium"]),
            storage=random.choice(NOISE_FILLERS["storage"]),
            tech=random.choice(NOISE_FILLERS["tech"]),
            thing=random.choice(NOISE_FILLERS["thing"]),
            feature=random.choice(NOISE_FILLERS["feature"]),
        )
        mem = create_memory(db, MemoryCreate(
            text=filled,
            kind="fact",
            entities=[subject.lower()],
            tags=["noise", "synthetic"],
            source="synthetic",
            trust=round(random.uniform(0.05, 0.3), 2),
        ))
        created.append(MemoryOut.model_validate(mem))
    return {"status": "ok", "memories_created": len(created), "memories": created}


@playground_router.post("/memory/contradiction")
def add_contradiction(data: ContradictionRequest, db: Session = Depends(get_db)):
    from app.schemas import MemoryCreate

    target = get_memory(db, data.memory_id)
    if not target:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Memory not found")

    negations = {
        "prefers": "dislikes",
        "uses": "avoids",
        "is_building": "abandoned",
        "preferred": "never liked",
        "should_avoid": "requires",
        "stores_as": "never stores as",
        "interested_in": "has no interest in",
    }
    new_predicate = negations.get(target.predicate, f"does not {target.predicate}")
    contradiction_text = f"Actually, {target.subject or 'the subject'} {new_predicate} {target.object or 'that'}."

    mem = create_memory(db, MemoryCreate(
        text=contradiction_text,
        kind=target.kind,
        subject=target.subject,
        predicate=new_predicate,
        object=target.object,
        entities=target.entities or [],
        tags=["contradiction", "conflict"] + (target.tags or []),
        source="synthetic",
        trust=round(random.uniform(0.2, 0.5), 2),
    ))
    return {"status": "ok", "original_id": data.memory_id, "contradiction": MemoryOut.model_validate(mem)}


@playground_router.post("/memory/reset")
def reset_memories(db: Session = Depends(get_db)):
    _hard_reset(db)
    return {"status": "ok"}


@playground_router.get("/memory/field", response_model=FieldResponse)
def get_field(db: Session = Depends(get_db)):
    memories = db.query(Memory).filter(Memory.status == "active").all()
    memory_outs = [MemoryOut.model_validate(m) for m in memories]

    edges: list[FieldEdge] = []
    for i, m1 in enumerate(memories):
        e1 = set(e.lower() for e in (m1.entities or []))
        for j in range(i + 1, len(memories)):
            m2 = memories[j]
            e2 = set(e.lower() for e in (m2.entities or []))
            shared = e1 & e2
            if shared:
                edges.append(FieldEdge(
                    source_id=m1.id,
                    target_id=m2.id,
                    shared_entities=list(shared),
                ))

    return FieldResponse(memories=memory_outs, edges=edges)


def _hard_reset(db: Session):
    db.query(MemoryVector).delete()
    db.query(Symbol).delete()
    db.query(Memory).delete()
    db.commit()


def _delete_demo_memories(db: Session):
    """Delete only memories tagged with source='demo' and their vectors.

    Used by /demo/seed so re-seeding the demo scenario is idempotent
    without destroying user-created memories.
    """
    demo_ids = [m.id for m in db.query(Memory.id).filter(Memory.source == "demo").all()]
    if not demo_ids:
        return
    db.query(MemoryVector).filter(MemoryVector.memory_id.in_(demo_ids)).delete(
        synchronize_session=False
    )
    db.query(Memory).filter(Memory.id.in_(demo_ids)).delete(synchronize_session=False)
    db.commit()
