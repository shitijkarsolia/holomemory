"""
HRR (Holographic Reduced Representations) engine.

Implements vector-symbolic operations for encoding and retrieving memories:
- Symbol vectors: deterministic high-dimensional vectors from string names
- Binding: circular convolution (associates two concepts)
- Unbinding: circular correlation (recovers one concept given the other)
- Superposition: vector addition (combines multiple associations)
- Cleanup: cosine similarity ranking against known symbols
"""

import hashlib
import math

import numpy as np

from app.config import HRR_DIMENSION, HRR_SEED


# ----- PRNG --------------------------------------------------------------
# Textbook splitmix64. Both `symbol_vector` here and `symbolVector` on the
# frontend feed the same 64-bit seed (first 8 bytes of SHA-256 of
# "{HRR_SEED}:{name}") through this PRNG and the same Box-Muller
# transform, so the two implementations produce identical 1024-d vectors
# for any symbol. Previously used a 32-bit murmur-finalizer stream with
# only 4 bytes of seed, which had a non-negligible birthday-collision
# probability at large symbol vocabularies. The parity check at
# scripts/parity_check.mjs verifies bit-identical output on every run.
#
# We do NOT use numpy.random.default_rng for symbol vectors because
# NumPy's PCG64 + Ziggurat-based standard_normal cannot be replicated
# exactly in JS without extreme effort, which would make the parity
# check practically impossible to keep honest.

_MASK64 = (1 << 64) - 1
_MASK32 = 0xFFFFFFFF
_C1 = 0x9E3779B97F4A7C15
_C2 = 0xBF58476D1CE4E5B9
_C3 = 0x94D049BB133111EB


def _splitmix64(seed: int):
    """Iterator returning u32 values; matches TS `splitmix64(seed)`."""
    state = seed & _MASK64

    def next_u32() -> int:
        nonlocal state
        state = (state + _C1) & _MASK64
        z = state
        z = ((z ^ (z >> 30)) * _C2) & _MASK64
        z = ((z ^ (z >> 27)) * _C3) & _MASK64
        z = (z ^ (z >> 31)) & _MASK64
        # Upper 32 bits — splitmix64's lower bits are weaker.
        return (z >> 32) & _MASK32

    return next_u32


def _seeded_normals(seed: int, count: int) -> np.ndarray:
    """Box-Muller normals driven by `_splitmix64`; matches TS `seededNormals`."""
    rng = _splitmix64(seed)
    out = np.zeros(count, dtype=np.float64)
    i = 0
    while i < count:
        u1 = (rng() + 1) / 4294967297.0
        u2 = (rng() + 1) / 4294967297.0
        r = math.sqrt(-2.0 * math.log(u1))
        theta = 2.0 * math.pi * u2
        out[i] = r * math.cos(theta)
        if i + 1 < count:
            out[i + 1] = r * math.sin(theta)
        i += 2
    return out


def symbol_vector(name: str, dimension: int = HRR_DIMENSION, seed: int = HRR_SEED) -> np.ndarray:
    """Generate a deterministic unit vector for a symbol name.

    Uses a custom splitmix64 + Box-Muller pipeline (rather than numpy's
    default_rng) so that the TypeScript reimplementation can produce
    bit-identical vectors. See `_splitmix64` above and the parity check
    at `scripts/parity_check.mjs`.
    """
    hash_bytes = hashlib.sha256(f"{seed}:{name}".encode()).digest()
    local_seed = int.from_bytes(hash_bytes[:8], "big")
    vec = _seeded_normals(local_seed, dimension)
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec /= norm
    return vec


def bind(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    """Bind two vectors via circular convolution (FFT-based)."""
    return np.real(np.fft.ifft(np.fft.fft(a) * np.fft.fft(b)))


def unbind(bound: np.ndarray, key: np.ndarray) -> np.ndarray:
    """Unbind by circular correlation — approximate inverse of bind."""
    return np.real(np.fft.ifft(np.fft.fft(bound) * np.conj(np.fft.fft(key))))


def superpose(vectors: list[np.ndarray]) -> np.ndarray:
    """Superpose vectors by addition and normalization."""
    if not vectors:
        return np.zeros(HRR_DIMENSION)
    result = np.sum(vectors, axis=0)
    norm = np.linalg.norm(result)
    if norm > 0:
        result /= norm
    return result


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Cosine similarity between two vectors."""
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))


def cleanup(probe: np.ndarray, candidates: dict[str, np.ndarray], top_k: int = 5) -> list[tuple[str, float]]:
    """Rank candidate symbols by similarity to probe vector."""
    scores = []
    for name, vec in candidates.items():
        sim = cosine_similarity(probe, vec)
        scores.append((name, sim))
    scores.sort(key=lambda x: x[1], reverse=True)
    return scores[:top_k]
