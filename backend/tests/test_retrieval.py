"""Tests for retrieval strategies."""

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


def _seed():
    client.post("/seed")


def test_keyword_retrieval():
    _seed()
    r = client.post("/query", json={"query": "What does the user prefer?", "mode": "keyword", "top_k": 5})
    assert r.status_code == 200
    data = r.json()
    assert data["mode"] == "keyword"
    assert len(data["results"]) > 0
    for result in data["results"]:
        assert result["components"]["keyword"] > 0


def test_holographic_retrieval():
    _seed()
    r = client.post("/query", json={"query": "What does the user prefer?", "mode": "holographic", "top_k": 5})
    assert r.status_code == 200
    data = r.json()
    assert data["mode"] == "holographic"
    assert len(data["results"]) > 0


def test_hybrid_retrieval():
    _seed()
    r = client.post("/query", json={"query": "What technology stack is used?", "mode": "hybrid", "top_k": 5})
    assert r.status_code == 200
    data = r.json()
    assert data["mode"] == "hybrid"
    assert len(data["results"]) > 0
    first = data["results"][0]
    assert "holographic" in first["components"]
    assert "keyword" in first["components"]
    assert "trust" in first["components"]


def test_query_returns_explanations():
    _seed()
    r = client.post("/query", json={"query": "holographic memory binding", "mode": "hybrid", "top_k": 3})
    data = r.json()
    assert len(data["results"]) > 0
    for result in data["results"]:
        assert isinstance(result["why"], list)


def test_empty_query():
    r = client.post("/query", json={"query": "xyzzy nonexistent gibberish", "mode": "keyword", "top_k": 5})
    assert r.status_code == 200


def test_holographic_prefers_related_memories():
    _seed()
    r = client.post("/query", json={"query": "sqlite database local", "mode": "holographic", "top_k": 5})
    data = r.json()
    if data["results"]:
        texts = [res["memory"]["text"].lower() for res in data["results"][:3]]
        assert any("sqlite" in t or "local" in t for t in texts)


def test_stemming_prefer_matches_prefers():
    """`prefer` in the query should match `prefers` in memory text via Snowball."""
    client.post("/memory/reset")
    client.post("/demo/seed")
    r = client.post(
        "/query",
        json={"query": "What does Maya prefer?", "mode": "hybrid", "top_k": 5},
    )
    data = r.json()
    texts = [res["memory"]["text"] for res in data["results"]]
    cursor_idx = next((i for i, t in enumerate(texts) if "Cursor" in t), -1)
    vim_idx = next((i for i, t in enumerate(texts) if "Vim" in t and "used to" in t), -1)
    assert cursor_idx >= 0, f"Cursor preference missing from results: {texts}"
    assert cursor_idx < vim_idx or vim_idx == -1, (
        f"Current 'Maya now prefers Cursor' (trust 0.9) should outrank stale "
        f"'Maya used to prefer Vim' (trust 0.6). Got: {texts}"
    )


def test_stemming_use_matches_uses():
    """`use` in the query should match `uses` in memory text."""
    client.post("/memory/reset")
    client.post("/demo/seed")
    r = client.post(
        "/query",
        json={"query": "What does Atlas use?", "mode": "hybrid", "top_k": 3},
    )
    data = r.json()
    assert len(data["results"]) > 0
    top_text = data["results"][0]["memory"]["text"]
    assert "Atlas uses" in top_text or "Atlas stores" in top_text, (
        f"Top result for 'What does Atlas use?' should describe Atlas's stack/storage, got: {top_text}"
    )


def test_hybrid_weights_constant_in_sync():
    """HYBRID_WEIGHTS should sum to 1 and be used by retrieval."""
    from app.memory.retrieval import HYBRID_WEIGHTS

    assert abs(sum(HYBRID_WEIGHTS.values()) - 1.0) < 1e-9
    assert set(HYBRID_WEIGHTS.keys()) == {"holographic", "keyword", "trust", "entity"}


def test_dedupe_on_create():
    """Creating the same memory twice should return the same id."""
    client.post("/memory/reset")
    payload = {
        "text": "The auth service uses PostgreSQL for sessions.",
        "subject": "auth service",
        "predicate": "uses",
        "object": "PostgreSQL",
        "trust": 0.85,
    }
    a = client.post("/memories", json=payload).json()
    b = client.post("/memories", json=payload).json()
    assert a["id"] == b["id"], "Duplicate create should be deduplicated"


def test_trust_pair_postgres_beats_mongo():
    """When two memories make competing claims, the higher-trust one outranks the lower."""
    client.post("/memory/reset")
    client.post(
        "/memories",
        json={
            "text": "The auth service uses PostgreSQL for session storage.",
            "subject": "auth service",
            "predicate": "uses",
            "object": "PostgreSQL",
            "entities": ["auth service", "PostgreSQL"],
            "trust": 0.85,
        },
    )
    client.post(
        "/memories",
        json={
            "text": "An unverified source claims the auth service uses MongoDB.",
            "subject": "auth service",
            "predicate": "uses",
            "object": "MongoDB",
            "entities": ["auth service", "MongoDB"],
            "trust": 0.2,
        },
    )
    r = client.post(
        "/query",
        json={
            "query": "What database does the auth service use?",
            "mode": "hybrid",
            "top_k": 5,
        },
    )
    data = r.json()
    texts = [res["memory"]["text"] for res in data["results"]]
    pg_idx = next((i for i, t in enumerate(texts) if "PostgreSQL" in t), -1)
    mongo_idx = next((i for i, t in enumerate(texts) if "MongoDB" in t), -1)
    assert pg_idx >= 0 and mongo_idx >= 0, f"Both memories should be returned: {texts}"
    assert pg_idx < mongo_idx, (
        f"High-trust PostgreSQL fact (trust 0.85) should outrank low-trust "
        f"MongoDB rumor (trust 0.20). Got: {texts}"
    )
