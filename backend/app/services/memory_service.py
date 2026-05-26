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

    existing = _find_duplicate(db, data.text, subject, predicate, obj)
    if existing is not None:
        return existing

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

    # If the user changed `text` without supplying new subject/predicate/
    # object, the stored SPO fields and the re-encoded vector would
    # otherwise disagree (vector reflects new text, SPO reflects old).
    # Re-extract any SPO field that wasn't explicitly provided in the patch.
    if "text" in update_data:
        derived = _extract_spo(MemoryCreate(
            text=memory.text,
            subject=memory.subject if "subject" in update_data else None,
            predicate=memory.predicate if "predicate" in update_data else None,
            object=memory.object if "object" in update_data else None,
        ))
        if "subject" not in update_data:
            memory.subject = derived[0]
        if "predicate" not in update_data:
            memory.predicate = derived[1]
        if "object" not in update_data:
            memory.object = derived[2]

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

    # Register any new symbols introduced by the update so the cleanup
    # vocabulary stays current with the stored vector.
    _register_symbols(db, memory)

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


def get_memory(db: Session, memory_id: str, include_deleted: bool = False) -> Memory | None:
    """Fetch a memory by id.

    By default, soft-deleted memories (status == 'deleted') are NOT returned —
    callers must opt in via include_deleted=True. This prevents the contradiction
    endpoint and GET /memories/{id} from operating on tombstoned rows.
    """
    query = db.query(Memory).filter(Memory.id == memory_id)
    if not include_deleted:
        query = query.filter(Memory.status != "deleted")
    return query.first()


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
    else:
        # Default: hide soft-deleted memories. Callers that genuinely
        # want deleted rows must pass status='deleted' explicitly.
        query = query.filter(Memory.status != "deleted")
    if min_trust is not None:
        query = query.filter(Memory.trust >= min_trust)

    query = query.order_by(Memory.created_at.desc())

    # entity/tag live in JSON columns. SQLAlchemy can't push these into a
    # portable WHERE clause across dialects, so we materialize the filtered
    # rows in Python and *then* paginate. Done in this order — filter first,
    # slice after — pagination is correct. Previously the LIMIT was applied
    # in SQL before this filter ran, which silently truncated results.
    if entity or tag:
        rows = query.all()
        if entity:
            entity_lower = entity.lower()
            rows = [
                m for m in rows
                if entity_lower in [e.lower() for e in (m.entities or [])]
            ]
        if tag:
            tag_lower = tag.lower()
            rows = [
                m for m in rows
                if tag_lower in [t.lower() for t in (m.tags or [])]
            ]
        return rows[offset : offset + limit]

    return query.offset(offset).limit(limit).all()


def get_memory_vector(db: Session, memory_id: str) -> np.ndarray | None:
    vec_record = db.query(MemoryVector).filter(MemoryVector.memory_id == memory_id).first()
    if not vec_record:
        return None
    return np.frombuffer(vec_record.vector, dtype=np.float64)


def get_all_vectors(db: Session) -> dict[str, np.ndarray]:
    records = db.query(MemoryVector).all()
    return {r.memory_id: np.frombuffer(r.vector, dtype=np.float64) for r in records}


def _canonical_key(text: str, subject: str | None, predicate: str | None, obj: str | None) -> str:
    parts = [text or "", subject or "", predicate or "", obj or ""]
    return "␟".join(" ".join(p.lower().split()) for p in parts)


def _find_duplicate(
    db: Session,
    text: str,
    subject: str | None,
    predicate: str | None,
    obj: str | None,
) -> Memory | None:
    key = _canonical_key(text, subject, predicate, obj)
    candidates = (
        db.query(Memory)
        .filter(Memory.status == "active")
        .filter(Memory.text == text)
        .all()
    )
    for m in candidates:
        if _canonical_key(m.text, m.subject, m.predicate, m.object) == key:
            return m
    return None


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
