"""Encodes structured memories into HRR trace vectors."""

import Stemmer
import numpy as np

from app.config import HRR_DIMENSION
from app.memory.hrr import bind, superpose, symbol_vector

_STEMMER = Stemmer.Stemmer("english")
_STEM_CACHE: dict[str, str] = {}


def _stem(token: str) -> str:
    cached = _STEM_CACHE.get(token)
    if cached is not None:
        return cached
    stemmed = _STEMMER.stemWord(token)
    _STEM_CACHE[token] = stemmed
    return stemmed


def encode_memory(
    text: str,
    subject: str | None = None,
    predicate: str | None = None,
    object_: str | None = None,
    entities: list[str] | None = None,
    tags: list[str] | None = None,
) -> np.ndarray:
    """
    Encode a memory into a single trace vector.

    Strategy:
    - Bind role vectors with content vectors for structured fields
    - Superpose all bindings into a single trace
    - Include token-level signals from the text
    """
    traces: list[np.ndarray] = []

    role_subject = symbol_vector("__ROLE_SUBJECT__")
    role_predicate = symbol_vector("__ROLE_PREDICATE__")
    role_object = symbol_vector("__ROLE_OBJECT__")
    role_entity = symbol_vector("__ROLE_ENTITY__")
    role_tag = symbol_vector("__ROLE_TAG__")
    role_token = symbol_vector("__ROLE_TOKEN__")

    if subject:
        traces.append(bind(role_subject, symbol_vector(subject.lower())))

    if predicate:
        traces.append(bind(role_predicate, symbol_vector(predicate.lower())))

    if object_:
        traces.append(bind(role_object, symbol_vector(object_.lower())))

    for entity in (entities or []):
        traces.append(bind(role_entity, symbol_vector(entity.lower())))

    for tag in (tags or []):
        traces.append(bind(role_tag, symbol_vector(tag.lower())))

    tokens = _tokenize(text)
    for token in tokens[:20]:
        traces.append(bind(role_token, symbol_vector(token)))

    if not traces:
        return np.zeros(HRR_DIMENSION)

    return superpose(traces)


def build_query_probe(
    query: str,
    target_role: str | None = None,
) -> np.ndarray:
    """
    Build a probe vector from a query string.

    Extracts tokens and optionally binds with a role vector to target
    specific memory fields.
    """
    tokens = _tokenize(query)
    if not tokens:
        return np.zeros(HRR_DIMENSION)

    probes: list[np.ndarray] = []

    if target_role:
        role_vec = symbol_vector(f"__ROLE_{target_role.upper()}__")
        for token in tokens[:10]:
            probes.append(bind(role_vec, symbol_vector(token)))
    else:
        role_token = symbol_vector("__ROLE_TOKEN__")
        role_entity = symbol_vector("__ROLE_ENTITY__")
        for token in tokens[:10]:
            probes.append(bind(role_token, symbol_vector(token)))
            probes.append(bind(role_entity, symbol_vector(token)))

    return superpose(probes)


STOPWORDS = {
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "to", "of", "in", "for",
    "on", "with", "at", "by", "from", "as", "into", "through", "during",
    "before", "after", "above", "below", "between", "and", "but", "or",
    "nor", "not", "so", "yet", "both", "either", "neither", "each",
    "every", "all", "any", "few", "more", "most", "other", "some",
    "such", "no", "only", "own", "same", "than", "too", "very",
    "just", "because", "if", "when", "where", "how", "what", "which",
    "who", "whom", "this", "that", "these", "those", "it", "its",
}


def _tokenize(text: str) -> list[str]:
    """Lowercase, split on non-alphanumerics, drop stopwords, stem with Snowball English."""
    import re

    words = re.findall(r"[a-z0-9]+", text.lower())
    return [_stem(w) for w in words if w not in STOPWORDS and len(w) > 1]


def _tokenize_with_surface(text: str) -> list[tuple[str, str]]:
    """Same as `_tokenize` but also returns the surface form alongside each stem.

    Used by retrieval code that wants to show the original word in `why` strings
    while still matching on stems internally.
    """
    import re

    words = re.findall(r"[a-z0-9]+", text.lower())
    return [(_stem(w), w) for w in words if w not in STOPWORDS and len(w) > 1]
