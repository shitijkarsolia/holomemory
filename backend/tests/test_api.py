"""Tests for API endpoints."""

import pytest
from fastapi.testclient import TestClient

from app.db import Base, engine
from app.main import app


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_create_memory():
    r = client.post("/memories", json={
        "text": "Test memory for API",
        "kind": "note",
        "entities": ["test"],
        "tags": ["api-test"],
        "trust": 0.8,
    })
    assert r.status_code == 201
    data = r.json()
    assert data["text"] == "Test memory for API"
    assert data["status"] == "active"
    assert "id" in data


def test_list_memories():
    client.post("/memories", json={"text": "First memory"})
    client.post("/memories", json={"text": "Second memory"})
    r = client.get("/memories")
    assert r.status_code == 200
    assert len(r.json()) >= 2


def test_get_memory():
    create_r = client.post("/memories", json={"text": "Specific memory"})
    mem_id = create_r.json()["id"]
    r = client.get(f"/memories/{mem_id}")
    assert r.status_code == 200
    assert r.json()["text"] == "Specific memory"


def test_update_memory():
    create_r = client.post("/memories", json={"text": "Original text", "trust": 0.5})
    mem_id = create_r.json()["id"]
    r = client.patch(f"/memories/{mem_id}", json={"trust": 0.9, "status": "stale"})
    assert r.status_code == 200
    assert r.json()["trust"] == 0.9
    assert r.json()["status"] == "stale"


def test_delete_memory():
    create_r = client.post("/memories", json={"text": "To be deleted"})
    mem_id = create_r.json()["id"]
    r = client.delete(f"/memories/{mem_id}")
    assert r.status_code == 200
    assert r.json()["status"] == "deleted"


def test_query_endpoint():
    client.post("/memories", json={
        "text": "The user prefers dark mode interfaces",
        "entities": ["user", "dark mode"],
        "tags": ["preference"],
    })
    r = client.post("/query", json={"query": "What does the user prefer?", "mode": "hybrid", "top_k": 3})
    assert r.status_code == 200
    data = r.json()
    assert data["mode"] == "hybrid"
    assert "latency_ms" in data
    assert isinstance(data["results"], list)


def test_stats_endpoint():
    client.post("/memories", json={"text": "Stats test memory", "trust": 0.9})
    r = client.get("/stats")
    assert r.status_code == 200
    data = r.json()
    assert data["total_memories"] >= 1
    assert "trust_distribution" in data


def test_seed_endpoint():
    r = client.post("/seed")
    assert r.status_code == 200
    assert r.json()["memories_created"] > 0


def test_experiment_endpoint():
    client.post("/seed")
    r = client.post("/experiments/run", json={"num_queries": 3})
    assert r.status_code == 200
    data = r.json()
    assert "keyword" in data
    assert "holographic" in data
    assert "hybrid" in data
    assert data["num_memories"] > 0


def test_filter_by_kind():
    client.post("/memories", json={"text": "A preference", "kind": "preference"})
    client.post("/memories", json={"text": "A fact", "kind": "fact"})
    r = client.get("/memories?kind=preference")
    assert r.status_code == 200
    for mem in r.json():
        assert mem["kind"] == "preference"


def test_404_on_missing_memory():
    r = client.get("/memories/nonexistent-id")
    assert r.status_code == 404
