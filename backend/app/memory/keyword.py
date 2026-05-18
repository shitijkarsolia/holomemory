"""Keyword-based retrieval baseline."""

from dataclasses import dataclass

from app.memory.encoder import _tokenize, _tokenize_with_surface


@dataclass
class KeywordResult:
    memory_id: str
    score: float
    matched_terms: list[str]


def keyword_search(query: str, memories: list[dict], top_k: int = 5) -> list[KeywordResult]:
    """Token-overlap retrieval over stemmed tokens; matched_terms reports surface forms."""
    query_pairs = _tokenize_with_surface(query)
    if not query_pairs:
        return []

    query_stems = [stem for stem, _ in query_pairs]
    surface_by_stem = {stem: surface for stem, surface in query_pairs}

    results = []
    for mem in memories:
        doc_tokens: set[str] = set(_tokenize(mem["text"]))
        for e in mem.get("entities", []) or []:
            doc_tokens.update(_tokenize(e))
        for t in mem.get("tags", []) or []:
            doc_tokens.update(_tokenize(t))
        if mem.get("subject"):
            doc_tokens.update(_tokenize(mem["subject"]))
        if mem.get("predicate"):
            doc_tokens.update(_tokenize(mem["predicate"]))
        if mem.get("object"):
            doc_tokens.update(_tokenize(mem["object"]))

        matched_stems = [s for s in query_stems if s in doc_tokens]
        if matched_stems:
            score = len(matched_stems) / len(query_stems)
            surface_matched = [surface_by_stem[s] for s in matched_stems]
            results.append(KeywordResult(
                memory_id=mem["id"],
                score=score,
                matched_terms=surface_matched,
            ))

    results.sort(key=lambda r: r.score, reverse=True)
    return results[:top_k]
