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
