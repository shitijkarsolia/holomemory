"""FastAPI routes for HoloMemory."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.memory.experiments import run_experiment
from app.memory.retrieval import query_memories
from app.schemas import (
    ExperimentRequest,
    ExperimentResponse,
    MemoryCreate,
    MemoryOut,
    MemoryUpdate,
    QueryRequest,
    QueryResponse,
    StatsResponse,
)
from app.seed import seed_database
from app.services.memory_service import (
    create_memory,
    delete_memory,
    get_memory,
    list_memories,
    update_memory,
)
from app.services.stats_service import get_stats

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok", "service": "holomemory"}


@router.post("/memories", response_model=MemoryOut, status_code=201)
def create_memory_endpoint(data: MemoryCreate, db: Session = Depends(get_db)):
    return create_memory(db, data)


@router.get("/memories", response_model=list[MemoryOut])
def list_memories_endpoint(
    q: str | None = None,
    kind: str | None = None,
    entity: str | None = None,
    tag: str | None = None,
    status: str | None = None,
    min_trust: float | None = None,
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    return list_memories(db, q=q, kind=kind, entity=entity, tag=tag, status=status, min_trust=min_trust, limit=limit, offset=offset)


@router.get("/memories/{memory_id}", response_model=MemoryOut)
def get_memory_endpoint(memory_id: str, db: Session = Depends(get_db)):
    mem = get_memory(db, memory_id)
    if not mem:
        raise HTTPException(status_code=404, detail="Memory not found")
    return mem


@router.patch("/memories/{memory_id}", response_model=MemoryOut)
def update_memory_endpoint(memory_id: str, data: MemoryUpdate, db: Session = Depends(get_db)):
    mem = update_memory(db, memory_id, data)
    if not mem:
        raise HTTPException(status_code=404, detail="Memory not found")
    return mem


@router.delete("/memories/{memory_id}", response_model=MemoryOut)
def delete_memory_endpoint(memory_id: str, db: Session = Depends(get_db)):
    mem = delete_memory(db, memory_id)
    if not mem:
        raise HTTPException(status_code=404, detail="Memory not found")
    return mem


@router.post("/query", response_model=QueryResponse)
def query_endpoint(data: QueryRequest, db: Session = Depends(get_db)):
    return query_memories(db, data.query, mode=data.mode, top_k=data.top_k)


@router.post("/experiments/run", response_model=ExperimentResponse)
def run_experiment_endpoint(data: ExperimentRequest = ExperimentRequest(), db: Session = Depends(get_db)):
    return run_experiment(db, num_queries=data.num_queries)


@router.get("/stats", response_model=StatsResponse)
def stats_endpoint(db: Session = Depends(get_db)):
    return get_stats(db)


@router.post("/seed")
def seed_endpoint(db: Session = Depends(get_db)):
    count = seed_database(db)
    return {"status": "ok", "memories_created": count}
