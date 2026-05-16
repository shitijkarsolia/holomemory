# HRR Primer: Holographic Reduced Representations

## What problem does HRR solve?

Traditional databases store information in discrete fields and retrieve by exact match. Vector databases store embeddings and retrieve by similarity. HRR offers a third approach: encoding structured relationships into fixed-size vectors using algebraic operations, enabling approximate content-addressable retrieval without ML models.

## Core Concepts

### Symbol Vectors

Every concept gets a unique high-dimensional vector (1024 dimensions in HoloMemory). These are generated deterministically from the concept name using a seeded random number generator.

Key properties:
- **Deterministic**: same name always produces same vector
- **Nearly orthogonal**: unrelated symbols have near-zero dot product
- **Unit norm**: all symbol vectors are normalized to length 1

### Binding (Circular Convolution)

Binding creates an association between two concepts. In HoloMemory, we bind role vectors with content vectors:

```
bound = bind(ROLE_SUBJECT, "user")
```

Properties:
- The result is dissimilar to both inputs
- It's approximately invertible (you can recover one input given the other)
- Implemented via FFT: `ifft(fft(a) * fft(b))`

### Superposition (Addition)

Multiple bindings are combined by adding them together:

```
trace = bind(ROLE_SUBJECT, "user") + bind(ROLE_PREDICATE, "prefers") + bind(ROLE_OBJECT, "dark mode")
```

The resulting trace vector stores all associations simultaneously. Information is compressed but approximately recoverable.

### Unbinding (Circular Correlation)

Given a trace and a key, unbinding recovers the associated value:

```
recovered = unbind(trace, ROLE_SUBJECT)  # approximately equals symbol("user")
```

The recovered vector is noisy (because of interference from other superposed bindings) but close enough to identify via cleanup.

### Cleanup Memory

Maps a noisy recovered vector back to the nearest known symbol:

```
candidates = {"user": vec_user, "project": vec_project, ...}
best_match = argmax(cosine_similarity(recovered, candidate) for candidate in candidates)
```

## Why not just use embeddings?

| Aspect | HRR | ML Embeddings |
|--------|-----|---------------|
| Structure | Encodes roles and relations explicitly | Flat semantic similarity |
| Dependencies | NumPy only | Requires trained model |
| Determinism | Same input = same vector always | Model-dependent |
| Explainability | Can unbind to inspect what's encoded | Black box |
| Scale | Prototype (hundreds) | Production (millions) |
| Accuracy | Approximate, algebraic | Learned, statistical |

## Limitations of HRR

- **Capacity**: A single trace can only store ~sqrt(dimension) bindings before interference dominates
- **Approximation**: Retrieval is inherently noisy — cleanup may fail for heavily superposed traces
- **No semantics**: Symbol vectors are random — "cat" and "kitten" are as dissimilar as "cat" and "airplane"
- **Fixed dimension**: All information compressed to same size regardless of complexity

## Further Reading

- Plate, T. (2003). Holographic Reduced Representations. CSLI Publications.
- Kanerva, P. (2009). Hyperdimensional Computing. Cognitive Computation.
- Gayler, R. (2003). Vector Symbolic Architectures. AAAI Spring Symposium.
