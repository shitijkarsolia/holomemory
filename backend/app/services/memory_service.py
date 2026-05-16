"""Memory service: CRUD operations and vector management."""

import uuid
from datetime import datetime, timezone

import numpy as np
from sqlalchemy.orm import Session

from app.memory.encoder import encode_memory
from app.models import Memory, MemoryVector, Symbol
from app.schemas import MemoryCreate, MemoryUpdate


def create_memory(db: Session, data: MemoryCreate) -> Memory:
    subject, predicate, obj = _extract_spo(data)

    memory = Memory(
        id=str(uuid.uuid4()),
        text=data.text,
        kind=data.kind,
        subject=subject,
        predicate=predicate,
        object=obj,
        entities=data.entities,
        tags=data.tags,
        source=data.source,
        trust=data.trust,
        status="active",
    )
    db.add(memory)
    db.flush()

    trace = encode_memory(
        text=memory.text,
        subject=memory.subject,
        predicate=memory.predicate,
        object_=memory.object,
        entities=memory.entities,
        tags=memory.tags,
    )
    vec_record = MemoryVector(
        memory_id=memory.id,
        vector=trace.tobytes(),
        dimension=len(trace),
    )
    db.add(vec_record)

    _register_symbols(db, memory)
    db.commit()
    db.refresh(memory)
    return memory


def update_memory(db: Session, memory_id: str, data: MemoryUpdate) -> Memory | None:
    memory = db.query(Memory).filter(Memory.id == memory_id).first()
    if not memory:
        return None

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(memory, field, value)
    memory.updated_at = datetime.now(timezone.utc)

    trace = encode_memory(
        text=memory.text,
        subject=memory.subject,
        predicate=memory.predicate,
        object_=memory.object,
        entities=memory.entities,
        tags=memory.tags,
    )
    vec_record = db.query(MemoryVector).filter(MemoryVector.memory_id == memory_id).first()
    if vec_record:
        vec_record.vector = trace.tobytes()
    else:
        db.add(MemoryVector(memory_id=memory_id, vector=trace.tobytes(), dimension=len(trace)))

    db.commit()
    db.refresh(memory)
    return memory


def delete_memory(db: Session, memory_id: str) -> Memory | None:
    memory = db.query(Memory).filter(Memory.id == memory_id).first()
    if not memory:
        return None
    memory.status = "deleted"
    memory.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(memory)
    return memory


def get_memory(db: Session, memory_id: str) -> Memory | None:
    return db.query(Memory).filter(Memory.id == memory_id).first()


def list_memories(
    db: Session,
    q: str | None = None,
    kind: str | None = None,
    entity: str | None = None,
    tag: str | None = None,
    status: str | None = None,
    min_trust: float | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[Memory]:
    query = db.query(Memory)

    if q:
        query = query.filter(Memory.text.ilike(f"%{q}%"))
    if kind:
        query = query.filter(Memory.kind == kind)
    if status:
        query = query.filter(Memory.status == status)
    if min_trust is not None:
        query = query.filter(Memory.trust >= min_trust)

    memories = query.order_by(Memory.created_at.desc()).offset(offset).limit(limit).all()

    if entity:
        memories = [m for m in memories if entity.lower() in [e.lower() for e in (m.entities or [])]]
    if tag:
        memories = [m for m in memories if tag.lower() in [t.lower() for t in (m.tags or [])]]

    return memories


def get_memory_vector(db: Session, memory_id: str) -> np.ndarray | None:
    vec_record = db.query(MemoryVector).filter(MemoryVector.memory_id == memory_id).first()
    if not vec_record:
        return None
    return np.frombuffer(vec_record.vector, dtype=np.float64)


def get_all_vectors(db: Session) -> dict[str, np.ndarray]:
    records = db.query(MemoryVector).all()
    return {r.memory_id: np.frombuffer(r.vector, dtype=np.float64) for r in records}


def _extract_spo(data: MemoryCreate) -> tuple[str | None, str | None, str | None]:
    """Extract subject/predicate/object if not provided."""
    if data.subject and data.predicate:
        return data.subject, data.predicate, data.object

    from app.memory.encoder import _tokenize
    tokens = _tokenize(data.text)
    subject = data.subject or (tokens[0] if tokens else None)
    predicate = data.predicate or (tokens[1] if len(tokens) > 1 else None)
    obj = data.object or (tokens[2] if len(tokens) > 2 else None)
    return subject, predicate, obj


def _register_symbols(db: Session, memory: Memory):
    """Register new symbols encountered in a memory."""
    names = set()
    if memory.subject:
        names.add(memory.subject.lower())
    if memory.predicate:
        names.add(memory.predicate.lower())
    if memory.object:
        names.add(memory.object.lower())
    for e in (memory.entities or []):
        names.add(e.lower())
    for t in (memory.tags or []):
        names.add(t.lower())

    existing = {s.name for s in db.query(Symbol).filter(Symbol.name.in_(names)).all()}
    for name in names - existing:
        db.add(Symbol(name=name))
