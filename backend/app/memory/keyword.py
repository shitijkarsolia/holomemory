"""Keyword-based retrieval baseline."""

import re
from dataclasses import dataclass


@dataclass
class KeywordResult:
    memory_id: str
    score: float
    matched_terms: list[str]


def keyword_search(query: str, memories: list[dict], top_k: int = 5) -> list[KeywordResult]:
    """
    Simple token-overlap retrieval.
    Scores each memory by the fraction of query tokens found in its text + entities + tags.
    """
    query_tokens = _tokenize(query)
    if not query_tokens:
        return []

    results = []
    for mem in memories:
        doc_tokens = set(_tokenize(mem["text"]))
        for e in mem.get("entities", []):
            doc_tokens.update(_tokenize(e))
        for t in mem.get("tags", []):
            doc_tokens.add(t.lower())
        if mem.get("subject"):
            doc_tokens.update(_tokenize(mem["subject"]))
        if mem.get("predicate"):
            doc_tokens.update(_tokenize(mem["predicate"]))
        if mem.get("object"):
            doc_tokens.update(_tokenize(mem["object"]))

        matched = [t for t in query_tokens if t in doc_tokens]
        if matched:
            score = len(matched) / len(query_tokens)
            results.append(KeywordResult(
                memory_id=mem["id"],
                score=score,
                matched_terms=matched,
            ))

    results.sort(key=lambda r: r.score, reverse=True)
    return results[:top_k]


def _tokenize(text: str) -> list[str]:
    stopwords = {
        "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
        "have", "has", "had", "do", "does", "did", "will", "would", "could",
        "should", "may", "might", "shall", "can", "to", "of", "in", "for",
        "on", "with", "at", "by", "from", "as", "into", "through", "during",
        "before", "after", "and", "but", "or", "not", "so", "yet",
        "this", "that", "these", "those", "it", "its", "what", "which",
        "who", "whom", "how", "where", "when", "if", "because",
    }
    words = re.findall(r"[a-z0-9]+", text.lower())
    return [w for w in words if w not in stopwords and len(w) > 1]
