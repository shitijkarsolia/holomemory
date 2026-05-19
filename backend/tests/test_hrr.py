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


# --- Tests backing the HRR Lab interactives ---


def _encode_chain(s: str, p: str, o: str) -> np.ndarray:
    return bind(symbol_vector(s), bind(symbol_vector(p), symbol_vector(o)))


def test_chain_binding_recovers_object_under_superposition():
    """Many facts in one trace; chained unbind recovers the target object."""
    facts = [
        ("maya", "prefer", "cursor"),
        ("atlas", "uses", "fastapi"),
        ("sarah", "owns", "auth"),
        ("jake", "refactored", "payments"),
    ]
    trace = superpose([_encode_chain(s, p, o) for s, p, o in facts])
    probe = unbind(unbind(trace, symbol_vector("maya")), symbol_vector("prefer"))
    vocab = {o: symbol_vector(o) for _, _, o in facts}
    vocab.update({n: symbol_vector(n) for n in ("vim", "redis", "tokyo")})
    top = cleanup(probe, vocab, top_k=1)[0]
    assert top[0] == "cursor", f"Expected 'cursor', got {top}"
    assert top[1] > 0.3, f"Confidence {top[1]} too low — should be well above noise floor"


def _role_encode(s: str, v: str, o: str) -> np.ndarray:
    R_S, R_V, R_O = (
        symbol_vector("__R_SUBJ__"),
        symbol_vector("__R_VERB__"),
        symbol_vector("__R_OBJ__"),
    )
    return superpose(
        [
            bind(R_S, symbol_vector(s)),
            bind(R_V, symbol_vector(v)),
            bind(R_O, symbol_vector(o)),
        ]
    )


def test_role_filler_distinguishes_subject_from_object():
    """Two memories with identical token bags but swapped subject/object are
    indistinguishable to a bag-of-words scorer; role-filler HRR pulls the
    correct token from each role."""
    A = _role_encode("maya", "manage", "auth")
    B = _role_encode("auth", "manage", "maya")
    R_S = symbol_vector("__R_SUBJ__")
    R_O = symbol_vector("__R_OBJ__")
    vocab = {n: symbol_vector(n) for n in ("maya", "auth", "manage", "sarah", "atlas")}

    assert cleanup(unbind(A, R_S), vocab, 1)[0][0] == "maya"
    assert cleanup(unbind(B, R_S), vocab, 1)[0][0] == "auth"
    assert cleanup(unbind(A, R_O), vocab, 1)[0][0] == "auth"
    assert cleanup(unbind(B, R_O), vocab, 1)[0][0] == "maya"


def test_capacity_in_one_vector():
    """One 1024-d trace holds many (key, value) pairs; recall stays high while
    the count is well below the dimensionality, then degrades smoothly."""
    rng = np.random.default_rng(0)
    pool = [f"val_{i}" for i in range(400)]

    def accuracy(n: int) -> float:
        # Sample unique values so cleanup has unambiguous targets.
        values = list(rng.choice(pool, size=n, replace=False))
        keys = [f"__cap_key_{i}_{rng.integers(0, 10**9)}__" for i in range(n)]
        trace = superpose(
            [bind(symbol_vector(k), symbol_vector(v)) for k, v in zip(keys, values)]
        )
        vocab = {v: symbol_vector(v) for v in values}
        # add 30 distractors
        for v in rng.choice(pool, size=30):
            if v not in vocab:
                vocab[v] = symbol_vector(v + "_distractor")
        hits = sum(
            1
            for k, v in zip(keys, values)
            if cleanup(unbind(trace, symbol_vector(k)), vocab, 1)[0][0] == v
        )
        return hits / n

    assert accuracy(10) == 1.0
    assert accuracy(25) >= 0.95
    assert accuracy(150) < accuracy(25), "capacity should degrade past the comfort zone"


def test_noise_graceful_degradation():
    """At 50% mixed Gaussian noise, chained unbind still recovers the correct
    object — confidence drops smoothly, not cliff-edge."""
    rng = np.random.default_rng(1)
    facts = [
        ("maya", "prefer", "cursor"),
        ("atlas", "uses", "fastapi"),
        ("sarah", "owns", "auth"),
    ]
    trace = superpose([_encode_chain(s, p, o) for s, p, o in facts])
    vocab = {o: symbol_vector(o) for _, _, o in facts}
    vocab.update({n: symbol_vector(n) for n in ("vim", "redis", "tokyo", "postgres")})

    def attempt(level: float) -> tuple[str, float]:
        noise = rng.standard_normal(trace.shape)
        noise /= np.linalg.norm(noise)
        corrupted = (1 - level) * trace + level * noise
        corrupted /= np.linalg.norm(corrupted)
        probe = unbind(
            unbind(corrupted, symbol_vector("maya")), symbol_vector("prefer")
        )
        top = cleanup(probe, vocab, 1)[0]
        return top[0], top[1]

    clean = attempt(0.0)
    half = attempt(0.5)
    assert clean[0] == "cursor"
    assert half[0] == "cursor", f"Lost target at 50% noise: {half}"
    assert clean[1] > half[1], "confidence should drop with noise"
    assert half[1] > 0.15, "confidence still meaningfully above noise floor at 50%"
