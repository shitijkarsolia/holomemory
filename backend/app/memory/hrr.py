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

import numpy as np

from app.config import HRR_DIMENSION, HRR_SEED


def symbol_vector(name: str, dimension: int = HRR_DIMENSION, seed: int = HRR_SEED) -> np.ndarray:
    """Generate a deterministic unit vector for a symbol name."""
    hash_bytes = hashlib.sha256(f"{seed}:{name}".encode()).digest()
    local_seed = int.from_bytes(hash_bytes[:4], "big")
    rng = np.random.default_rng(local_seed)
    vec = rng.standard_normal(dimension)
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
