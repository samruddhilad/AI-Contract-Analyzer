import re
from typing import Any, Dict, List, Union


def clean_text(text: str) -> str:
    if not text:
        return ""
    text = text.replace("\x00", " ")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def chunk_text(text: str, max_chars: int = 1500, overlap: int = 200) -> List[str]:
    """Splits text into overlapping, coherent paragraphs/chunks."""
    text = clean_text(text)
    if not text:
        return []
    if len(text) <= max_chars:
        return [text]

    paragraphs = [p.strip() for p in text.split("\n") if p.strip()]
    chunks: List[str] = []
    current = ""

    for p in paragraphs:
        candidate = (current + "\n" + p).strip() if current else p
        if len(candidate) <= max_chars:
            current = candidate
        else:
            if current:
                chunks.append(current)
            # Use overlap from previous chunk
            overlap_prefix = current[-overlap:].strip() if current else ""
            current = (overlap_prefix + "\n" + p).strip()
            while len(current) > max_chars:
                chunks.append(current[:max_chars])
                current = current[max_chars - overlap :].strip()

    if current:
        chunks.append(current)

    return chunks


def chunk_document_with_sources(
    doc_data: Union[Dict[str, Any], str],
    max_chars: int = 1400,
    overlap: int = 200,
) -> List[Dict[str, Any]]:
    """Chunks document while preserving source citations (Page / Section / Slide)."""
    if isinstance(doc_data, str):
        raw_chunks = chunk_text(doc_data, max_chars=max_chars, overlap=overlap)
        return [{"chunk_id": i + 1, "text": ch, "source": f"Section {i + 1}"} for i, ch in enumerate(raw_chunks)]

    pages = doc_data.get("pages", [])
    if not pages:
        return chunk_document_with_sources(doc_data.get("text", ""), max_chars, overlap)

    results: List[Dict[str, Any]] = []
    chunk_counter = 1

    for page in pages:
        p_text = clean_text(page.get("text", ""))
        p_source = page.get("source", f"Page {page.get('page', 1)}")
        if not p_text:
            continue

        if len(p_text) <= max_chars:
            results.append({
                "chunk_id": chunk_counter,
                "text": p_text,
                "source": p_source,
                "page": page.get("page", 1),
            })
            chunk_counter += 1
        else:
            sub_chunks = chunk_text(p_text, max_chars=max_chars, overlap=overlap)
            for sub in sub_chunks:
                results.append({
                    "chunk_id": chunk_counter,
                    "text": sub,
                    "source": p_source,
                    "page": page.get("page", 1),
                })
                chunk_counter += 1

    return results
