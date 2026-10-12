import hashlib
import re
from functools import lru_cache
from typing import Any, Dict, List, Tuple

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from services.preprocess import chunk_document_with_sources, chunk_text

# In-memory document index cache (max 20 active documents)
_DOCUMENT_INDEX_CACHE: Dict[str, Dict[str, Any]] = {}


@lru_cache(maxsize=1)
def get_embedder() -> SentenceTransformer:
    return SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")


def _get_document_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8", errors="ignore")).hexdigest()[:16]


def get_or_build_index(text: str) -> Dict[str, Any]:
    doc_hash = _get_document_hash(text)
    if doc_hash in _DOCUMENT_INDEX_CACHE:
        return _DOCUMENT_INDEX_CACHE[doc_hash]

    chunks_with_sources = chunk_document_with_sources(text)
    if not chunks_with_sources:
        chunks_with_sources = [{"chunk_id": 1, "text": text, "source": "Document"}]

    chunk_texts = [c["text"] for c in chunks_with_sources]
    model = get_embedder()
    vectors = model.encode(chunk_texts, convert_to_numpy=True, normalize_embeddings=True).astype("float32")

    dimension = vectors.shape[1]
    index = faiss.IndexFlatIP(dimension)
    index.add(vectors)

    cache_item = {
        "chunks": chunks_with_sources,
        "index": index,
        "texts": chunk_texts,
    }

    # Evict oldest if cache gets too large
    if len(_DOCUMENT_INDEX_CACHE) > 20:
        oldest_key = next(iter(_DOCUMENT_INDEX_CACHE))
        del _DOCUMENT_INDEX_CACHE[oldest_key]

    _DOCUMENT_INDEX_CACHE[doc_hash] = cache_item
    return cache_item


def retrieve_with_sources(
    text: str, question: str, top_k: int = 3
) -> Tuple[List[Dict[str, Any]], bool]:
    """Retrieves most relevant chunks with citations and checks for subject presence."""
    if not text.strip() or not question.strip():
        return [], False

    index_data = get_or_build_index(text)
    chunks = index_data["chunks"]
    faiss_index = index_data["index"]

    model = get_embedder()
    q_vec = model.encode([question], convert_to_numpy=True, normalize_embeddings=True).astype("float32")

    k = min(top_k, len(chunks))
    scores, indices = faiss_index.search(q_vec, k)

    results: List[Dict[str, Any]] = []
    max_score = 0.0

    # Stopwords to filter for keyword relevance
    stopwords = {
        "what", "is", "the", "are", "of", "and", "in", "to", "for", "a", "an",
        "does", "can", "how", "why", "who", "when", "where", "there", "any", "about",
    }
    q_words = [w.lower() for w in re.findall(r"\b[A-Za-z0-9_]{3,}\b", question) if w.lower() not in stopwords]

    for score, idx in zip(scores[0], indices[0]):
        if 0 <= idx < len(chunks):
            chunk_obj = chunks[idx]
            chunk_text_lower = chunk_obj["text"].lower()

            kw_matches = sum(1 for w in q_words if w in chunk_text_lower)
            combined_score = float(score) + (0.15 * min(kw_matches, 3))

            results.append({
                "text": chunk_obj["text"],
                "source": chunk_obj.get("source", "Document"),
                "score": round(float(combined_score), 4),
                "kw_matches": kw_matches,
            })
            if combined_score > max_score:
                max_score = combined_score

    # Sort by score descending
    results.sort(key=lambda x: x["score"], reverse=True)

    # Check overall keyword presence across the document
    text_lower = text.lower()
    subject_present = any(w in text_lower for w in q_words) or max_score >= 0.40

    return results, subject_present


def retrieve(text: str, question: str, top_k: int = 3) -> List[str]:
    """Backward-compatible retrieval returning list of formatted excerpt strings."""
    results, _ = retrieve_with_sources(text, question, top_k=top_k)
    return [f"[{r['source']}]: {r['text']}" for r in results]
