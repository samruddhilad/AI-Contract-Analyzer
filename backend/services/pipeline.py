import hashlib
import logging
import re
import time
from typing import Any, Dict, List, Optional

from services.classifier import classifier
from services.clauses import detect_clauses
from services.document import extract_document
from services.jobs import is_job_cancelled, update_job
from services.ner import extract_entities
from services.preprocess import clean_text, chunk_document_with_sources
from services.retrieval import retrieve_with_sources
from services.slm import generate

logger = logging.getLogger("pipeline")

# In-memory analysis cache (sha256(text) -> result)
_ANALYSIS_CACHE: Dict[str, Dict[str, Any]] = {}


def _hash_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8", errors="ignore")).hexdigest()


def parse_structured_analysis(raw_text: str, is_contract: bool = True) -> Dict[str, str]:
    """Splits single-pass LLM response into distinct structured sections."""
    sections: Dict[str, str] = {
        "overview": "",
        "executive_summary": "",
        "key_points": "",
        "important_details": "",
        "risk_or_insights": "",
    }

    current_key = "executive_summary"
    current_lines: List[str] = []

    for line in raw_text.splitlines():
        line_strip = line.strip()
        lower = line_strip.lower()

        if re.search(r"^#{1,3}\s*(?:document\s+overview|overview\b)", lower):
            if current_lines:
                sections[current_key] = "\n".join(current_lines).strip()
                current_lines = []
            current_key = "overview"
        elif re.search(r"^#{1,3}\s*(?:executive\s+summary|summary\b)", lower):
            if current_lines:
                sections[current_key] = "\n".join(current_lines).strip()
                current_lines = []
            current_key = "executive_summary"
        elif re.search(r"^#{1,3}\s*(?:key\s+points|main\s+points|key\s+obligations)", lower):
            if current_lines:
                sections[current_key] = "\n".join(current_lines).strip()
                current_lines = []
            current_key = "key_points"
        elif re.search(r"^#{1,3}\s*(?:important\s+details|key\s+details|extracted\s+details)", lower):
            if current_lines:
                sections[current_key] = "\n".join(current_lines).strip()
                current_lines = []
            current_key = "important_details"
        elif re.search(r"^#{1,3}\s*(?:risk|attention|document-specific|insights|findings)", lower):
            if current_lines:
                sections[current_key] = "\n".join(current_lines).strip()
                current_lines = []
            current_key = "risk_or_insights"
        else:
            current_lines.append(line)

    if current_lines:
        sections[current_key] = "\n".join(current_lines).strip()

    # Fallback if headings were absent
    if not any(sections.values()):
        sections["executive_summary"] = raw_text.strip()

    return sections


def analyze_file(path: str, filename: str = "", job_id: Optional[str] = None) -> Dict[str, Any]:
    t_start = time.time()

    if job_id and is_job_cancelled(job_id):
        raise RuntimeError("Analysis job was cancelled by user.")

    if job_id:
        update_job(job_id, stage="Extracting text and document structure...", progress=15)

    doc_data = extract_document(path)
    text = clean_text(doc_data["text"])
    if not text:
        raise ValueError("No readable text was extracted from the document.")

    # Check cache for exact document text
    text_hash = _hash_text(text)
    if text_hash in _ANALYSIS_CACHE:
        logger.info("Serving analysis from cache for %s", filename or path)
        cached = dict(_ANALYSIS_CACHE[text_hash])
        cached["from_cache"] = True
        return cached

    if job_id and is_job_cancelled(job_id):
        raise RuntimeError("Analysis job was cancelled by user.")

    if job_id:
        update_job(job_id, stage="Detecting document type & extracting entities...", progress=35)

    t_extract = time.time()
    classification = classifier.predict(text, filename=filename or path)
    is_contract = classification.get("is_contract", True)
    entities = extract_entities(text)
    clauses = detect_clauses(text, is_contract=is_contract)
    chunks_with_sources = chunk_document_with_sources(doc_data)

    if job_id and is_job_cancelled(job_id):
        raise RuntimeError("Analysis job was cancelled by user.")

    if job_id:
        update_job(job_id, stage="Running LexiGuard AI reasoning with Qwen2.5-1.5B...", progress=55)

    t_nlp = time.time()

    # Limit context excerpt to fit comfortably within prompt budget (up to 6 chunks)
    selected_chunks = chunks_with_sources[:6]
    context_text = "\n\n".join(f"[{c['source']}]:\n{c['text']}" for c in selected_chunks)

    # Prompt specified for relational and multi-lingual document understanding
    system_prompt = (
        "You are LexiGuard AI, an expert document-understanding and legal intelligence assistant. "
        "Explain the purpose, obligations, and key relationships in the supplied document in clear, professional English. "
        "The document may be written in English, Marathi, Hindi, or a mix of languages — analyze the content accurately "
        "regardless of language and formulate the key relationships (e.g. who is the applicant/owner/landlord, who is the tenant/counterparty, "
        "the exact property/unit, term dates, phone numbers, rules, and conditions). "
        "Use only information supported by the extracted text. Never hallucinate or invent missing details. "
        "Identify uncertainty and extraction limitations honestly. Produce concise, structured output."
    )

    if is_contract:
        analysis_prompt = f"""Document Type: {classification['contract_type']}
Filename: {filename or 'Uploaded Document'}

Document Excerpt:
{context_text}

Provide structured analysis with these exact headings:
### Executive Summary
[Concise explanation of the document purpose and the core relationship: who is agreeing to what with whom, for which property or subject, in simple, clear English]

### Key Points & Obligations
[Important terms, core obligations, duration dates (start to end), rent/fee terms, and rules/conditions such as permissions, damage liability, or restrictions]

### Important Details
- Parties & Roles: [Specify each person/entity and their role, e.g. Owner/Applicant vs Tenant/Counterparty]
- Property / Location: [Room/Flat number, building, society, or premises]
- Dates & Duration: [Tenure dates, application date, duration]
- Financial Terms: [Rent amount, deposit, or note if numerical amount is unstated]
- Contact Information: [Phone/mobile numbers, email addresses]
- Action Items & Conditions: [Permissions, police verification, liability for damages]

### Risk & Attention Points
[Review potentially unfavorable, strict, or high-attention provisions such as damage compensation liability, elevator usage limits, termination notice, or unstated terms]
"""
    else:
        analysis_prompt = f"""Document Type: {classification['contract_type']} (Non-Contract Document)
Filename: {filename or 'Uploaded Document'}

Document Excerpt:
{context_text}

Provide structured analysis with these exact headings:
### Executive Summary
[Concise explanation of what the document is about, who authored or filed it, and why it exists in simple English]

### Key Points
[Important facts, findings, decisions, conclusions, core takeaways, and relational details between parties/entities]

### Important Details
- Key Names & Roles:
- Important Dates & Milestones:
- Property / Reference Details:
- Contact Information:
- Numerical Data & Amounts:
- Action Items & Next Steps:

### Document-Specific Insights
[Relevant insights, observations, or limitations based on this specific document type]
"""

    raw_ai_analysis = generate(analysis_prompt, system=system_prompt, max_new_tokens=340)
    parsed = parse_structured_analysis(raw_ai_analysis, is_contract=is_contract)

    # Construct unified summary body for SummaryCard
    summary_parts = []
    if parsed["executive_summary"]:
        summary_parts.append(parsed["executive_summary"])
    if parsed["key_points"]:
        summary_parts.append("\n**Key Points & Terms:**\n" + parsed["key_points"])
    if parsed["important_details"]:
        summary_parts.append("\n**Important Details:**\n" + parsed["important_details"])
    final_summary = "\n\n".join(summary_parts).strip() or raw_ai_analysis

    # Construct risk/insights body for RiskCard
    final_risk_analysis = parsed["risk_or_insights"]
    if not final_risk_analysis:
        if is_contract:
            final_risk_analysis = "Standard contract provisions detected. Review payment schedules and termination notice requirements."
        else:
            final_risk_analysis = "Non-contract document. General informational and operational review recommended."

    t_done = time.time()
    source_refs = sorted(list({c.get("source", "Document") for c in selected_chunks}))

    result = {
        "contract_type": {
            "contract_type": classification["contract_type"],
            "confidence": classification["confidence"],
        },
        "is_contract": is_contract,
        "category": classification.get("category", "general"),
        "entities": entities,
        "clauses": clauses,
        "chunk_count": len(chunks_with_sources),
        "summary": final_summary,
        "risk_analysis": final_risk_analysis,
        "document_overview": parsed["overview"] or parsed["executive_summary"],
        "executive_summary": parsed["executive_summary"],
        "key_points": parsed["key_points"],
        "important_details": parsed["important_details"],
        "document_specific_analysis": final_risk_analysis,
        "source_references": source_refs,
        "limitations": doc_data.get("metadata", {}).get("limitation_note", ""),
        "clean_text": text,
        "metrics": {
            "extract_sec": round(t_extract - t_start, 3),
            "nlp_sec": round(t_nlp - t_extract, 3),
            "inference_sec": round(t_done - t_nlp, 3),
            "total_sec": round(t_done - t_start, 3),
        },
    }

    # Store in memory cache
    _ANALYSIS_CACHE[text_hash] = result
    if len(_ANALYSIS_CACHE) > 30:
        oldest = next(iter(_ANALYSIS_CACHE))
        del _ANALYSIS_CACHE[oldest]

    return result


def answer_question(
    contract_text: str,
    question: str,
    conversation_history: Optional[List[Dict[str, str]]] = None,
) -> Dict[str, Any]:
    """Answers document grounded questions using retrieved passages and conversation history."""
    clean_q = question.strip()
    if not clean_q:
        raise ValueError("Question cannot be empty.")

    # System prompt supporting relational and multilingual document Q&A
    system_prompt = (
        "You are LexiGuard AI, a precise document-grounded question-answering assistant. "
        "The document may be in English, Marathi, Hindi, or multilingual — interpret facts accurately and answer in clear English. "
        "Answer the user's specific question using the relevant supplied document passages "
        "and conversation context. Give the direct answer first, then explain it clearly. Form explicit relations between facts "
        "(such as identifying who is the owner/applicant, who is the tenant, the specific property, dates, phone numbers, or amounts). "
        "Cite page numbers or sections when available. If the answer is genuinely not mentioned or supported in the document, "
        "state that this information is not specified in the supplied document. Never fabricate facts, quotations, or citations."
    )

    clean_q_lower = clean_q.lower()
    relevant_chunks, subject_present = retrieve_with_sources(contract_text, clean_q, top_k=4)

    # For concise documents (<= 5000 chars, ~1-2 pages), include the full document context
    if len(contract_text) <= 5000:
        all_chunks = chunk_document_with_sources(contract_text)
        if all_chunks:
            relevant_chunks = all_chunks[:5]

    is_generic_query = any(w in clean_q_lower for w in [
        "name", "who", "party", "parties", "tenant", "landlord", "owner", "applicant",
        "flat", "room", "rent", "date", "term", "phone", "contact", "summary", "what", "where", "explain"
    ])

    # If the document is large (>5000 chars) and the query is an unrelated missing topic
    if len(contract_text) > 5000 and not subject_present and not is_generic_query and (not relevant_chunks or relevant_chunks[0]["score"] < 0.20):
        return {
            "question": clean_q,
            "answer": (
                "This information is not specified in the supplied document. "
                "The provided text contains no provisions, details, or mentions regarding this question."
            ),
            "retrieved_sections": [],
        }

    formatted_passages = [f"[{r['source']}]:\n{r['text']}" for r in relevant_chunks]
    passages_block = "\n\n---\n\n".join(formatted_passages)

    # Format recent conversation context
    history_block = ""
    if conversation_history:
        recent = conversation_history[-4:]
        lines = []
        for msg in recent:
            role = "User" if msg.get("sender") == "user" else "Assistant"
            lines.append(f"{role}: {msg.get('text', '')}")
        if lines:
            history_block = "Previous Conversation Context:\n" + "\n".join(lines) + "\n\n"

    user_prompt = f"""{history_block}Relevant Document Passages:
{passages_block}

User Question:
{clean_q}

Instructions:
1. Provide the direct answer first in 1-2 concise sentences.
2. Formulate explicit facts (who is applicant/owner, who is tenant, room number, dates, phone, etc.).
3. Cite the page or section if mentioned (e.g. [Page 1]).
4. If the document has no facts on this, state that the information is not specified.

Direct Answer:"""

    answer_text = generate(user_prompt, system=system_prompt, max_new_tokens=90)

    return {
        "question": clean_q,
        "answer": answer_text,
        "retrieved_sections": [f"[{r['source']}]: {r['text'][:300]}" for r in relevant_chunks],
    }
