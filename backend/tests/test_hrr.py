"""Tests for HRR engine operations."""

import numpy as np

from app.memory.hrr import (
    bind,
    cleanup,
    cosine_similarity,
    superpose,
    symbol_vector,
    unbind,
)


def test_symbol_vector_deterministic():
    v1 = symbol_vector("hello")
    v2 = symbol_vector("hello")
    assert np.allclose(v1, v2)


def test_symbol_vector_unit_norm():
    v = symbol_vector("test")
    assert abs(np.linalg.norm(v) - 1.0) < 1e-6


def test_different_symbols_nearly_orthogonal():
    sims = []
    for i in range(50):
        a = symbol_vector(f"symbol_{i}")
        b = symbol_vector(f"symbol_{i + 100}")
        sims.append(abs(cosine_similarity(a, b)))
    avg_sim = np.mean(sims)
    assert avg_sim < 0.1, f"Average similarity {avg_sim} too high for unrelated symbols"


def test_bind_unbind_recovers_target():
    a = symbol_vector("cat")
    b = symbol_vector("animal")
    bound = bind(a, b)
    recovered = unbind(bound, a)
    sim = cosine_similarity(recovered, b)
    assert sim > 0.5, f"Recovery similarity {sim} too low"


def test_bind_is_not_similar_to_inputs():
    a = symbol_vector("red")
    b = symbol_vector("car")
    bound = bind(a, b)
    sim_a = cosine_similarity(bound, a)
    sim_b = cosine_similarity(bound, b)
    assert abs(sim_a) < 0.2
    assert abs(sim_b) < 0.2


def test_superpose_retains_components():
    a = symbol_vector("alpha")
    b = symbol_vector("beta")
    c = symbol_vector("gamma")
    s = superpose([a, b, c])
    sim_a = cosine_similarity(s, a)
    sim_b = cosine_similarity(s, b)
    sim_c = cosine_similarity(s, c)
    assert sim_a > 0.3
    assert sim_b > 0.3
    assert sim_c > 0.3


def test_superposed_trace_retrieval():
    role = symbol_vector("role_subject")
    cat = symbol_vector("cat")
    dog = symbol_vector("dog")

    trace = superpose([bind(role, cat), bind(role, dog)])
    recovered = unbind(trace, role)

    sim_cat = cosine_similarity(recovered, cat)
    sim_dog = cosine_similarity(recovered, dog)
    sim_unrelated = cosine_similarity(recovered, symbol_vector("airplane"))

    assert sim_cat > sim_unrelated
    assert sim_dog > sim_unrelated


def test_cleanup_returns_expected_symbol():
    candidates = {
        "cat": symbol_vector("cat"),
        "dog": symbol_vector("dog"),
        "fish": symbol_vector("fish"),
        "bird": symbol_vector("bird"),
    }
    probe = symbol_vector("cat") + np.random.default_rng(0).standard_normal(1024) * 0.01
    results = cleanup(probe, candidates, top_k=3)
    assert results[0][0] == "cat"
    assert results[0][1] > 0.9


def test_cleanup_after_bind_unbind():
    a = symbol_vector("color")
    b = symbol_vector("blue")
    bound = bind(a, b)
    recovered = unbind(bound, a)

    candidates = {
        "blue": symbol_vector("blue"),
        "red": symbol_vector("red"),
        "green": symbol_vector("green"),
    }
    results = cleanup(recovered, candidates, top_k=3)
    assert results[0][0] == "blue"
