"""Stats service for memory analytics."""

from sqlalchemy.orm import Session

from app.models import Memory
from app.schemas import StatsResponse


def get_stats(db: Session) -> StatsResponse:
    memories = db.query(Memory).all()

    total = len(memories)
    active = sum(1 for m in memories if m.status == "active")
    stale = sum(1 for m in memories if m.status == "stale")
    superseded = sum(1 for m in memories if m.status == "superseded")
    deleted = sum(1 for m in memories if m.status == "deleted")

    trusts = [m.trust for m in memories if m.status == "active"]
    avg_trust = round(sum(trusts) / len(trusts), 3) if trusts else 0.0

    trust_dist = {"0.0-0.2": 0, "0.2-0.4": 0, "0.4-0.6": 0, "0.6-0.8": 0, "0.8-1.0": 0}
    for t in trusts:
        if t < 0.2:
            trust_dist["0.0-0.2"] += 1
        elif t < 0.4:
            trust_dist["0.2-0.4"] += 1
        elif t < 0.6:
            trust_dist["0.4-0.6"] += 1
        elif t < 0.8:
            trust_dist["0.6-0.8"] += 1
        else:
            trust_dist["0.8-1.0"] += 1

    kinds: dict[str, int] = {}
    for m in memories:
        kinds[m.kind] = kinds.get(m.kind, 0) + 1

    tags: dict[str, int] = {}
    for m in memories:
        for tag in (m.tags or []):
            tags[tag] = tags.get(tag, 0) + 1

    entities: dict[str, int] = {}
    for m in memories:
        for e in (m.entities or []):
            entities[e] = entities.get(e, 0) + 1

    return StatsResponse(
        total_memories=total,
        active_memories=active,
        stale_count=stale,
        superseded_count=superseded,
        deleted_count=deleted,
        average_trust=avg_trust,
        trust_distribution=trust_dist,
        memory_kinds=kinds,
        tag_counts=tags,
        entity_counts=entities,
    )
