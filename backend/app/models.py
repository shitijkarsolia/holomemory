import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, Integer, LargeBinary, String, Text
from sqlalchemy.dialects.sqlite import JSON

from app.db import Base


def _utcnow():
    return datetime.now(timezone.utc)


def _new_id():
    return str(uuid.uuid4())


class Memory(Base):
    __tablename__ = "memories"

    id = Column(String, primary_key=True, default=_new_id)
    text = Column(Text, nullable=False)
    kind = Column(String, default="note")
    subject = Column(String, nullable=True)
    predicate = Column(String, nullable=True)
    object = Column(String, nullable=True)
    entities = Column(JSON, default=list)
    tags = Column(JSON, default=list)
    source = Column(String, default="api")
    trust = Column(Float, default=0.7)
    status = Column(String, default="active")
    created_at = Column(DateTime, default=_utcnow)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow)


class MemoryVector(Base):
    __tablename__ = "memory_vectors"

    id = Column(Integer, primary_key=True, autoincrement=True)
    memory_id = Column(String, nullable=False, index=True)
    vector = Column(LargeBinary, nullable=False)
    dimension = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=_utcnow)


class Symbol(Base):
    __tablename__ = "symbols"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=_utcnow)


class QueryLog(Base):
    __tablename__ = "query_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    query_text = Column(Text, nullable=False)
    mode = Column(String, nullable=False)
    top_k = Column(Integer, default=5)
    latency_ms = Column(Float, nullable=True)
    result_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=_utcnow)


class ExperimentRun(Base):
    __tablename__ = "experiment_runs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    results = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=_utcnow)
