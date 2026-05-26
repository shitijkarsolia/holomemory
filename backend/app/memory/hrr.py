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
# A small 32-bit murmur-finalizer-style stream PRNG. Its only job is to
# produce a deterministic stream of u32 values that *bit-matches* the
# TypeScript implementation at frontend/lib/hrr/prng.ts. Both
# `symbol_vector` here and `symbolVector` on the frontend feed the
# same 32-bit seed (first 4 bytes of SHA-256 of "{HRR_SEED}:{name}")
# through this PRNG and the same Box-Muller transform, so the two
# implementations produce identical 1024-d vectors for any symbol.
#
# We do NOT use numpy.random.default_rng for symbol vectors because
# NumPy's PCG64 + Ziggurat-based standard_normal cannot be replicated
# exactly in JS without bigints, which would make the parity check
# practically impossible to keep honest.

_U32 = 0xFFFFFFFF


def _splitmix32(seed: int):
    """Iterator returning u32 values; matches TS `splitmix64(seed)`."""
    state = seed & _U32

    def next_u32() -> int:
        nonlocal state
        state = (state + 0x9E3779B9) & _U32
        z = state
        z = ((z ^ (z >> 16)) * 0x85EBCA6B) & _U32
        z = ((z ^ (z >> 13)) * 0xC2B2AE35) & _U32
        z = (z ^ (z >> 16)) & _U32
        return z

    return next_u32


def _seeded_normals(seed: int, count: int) -> np.ndarray:
    """Box-Muller normals driven by `_splitmix32`; matches TS `seededNormals`."""
    rng = _splitmix32(seed)
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

    Uses a custom splitmix32 + Box-Muller pipeline (rather than numpy's
    default_rng) so that the TypeScript reimplementation can produce
    bit-identical vectors. See `_splitmix32` above and the parity check
    at `scripts/parity_check.mjs`.
    """
    hash_bytes = hashlib.sha256(f"{seed}:{name}".encode()).digest()
    local_seed = int.from_bytes(hash_bytes[:4], "big")
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
