from typing import Any, Dict, List

CLAUSE_KEYWORDS: Dict[str, List[str]] = {
    "termination": ["terminate", "termination", "notice period", "end this agreement", "cancel this agreement"],
    "payment": ["payment", "fee", "salary", "compensation", "invoice", "rent", "billing"],
    "confidentiality": ["confidential", "confidentiality", "non-disclosure", "proprietary information"],
    "liability": ["liability", "liable", "damages", "indemnity", "indemnification", "hold harmless"],
    "renewal": ["renewal", "renew", "extension", "renewed automatically"],
    "governing_law": ["governing law", "jurisdiction", "courts of", "venue"],
    "intellectual_property": ["intellectual property", "copyright", "ownership", "work for hire", "patents"],
    "non_compete": ["non-compete", "non compete", "restrictive covenant", "non-solicitation", "non solicitation"],
    "data_privacy": ["personal data", "privacy", "data protection", "processing", "gdpr", "hipaa"],
}


def detect_clauses(text: str, is_contract: bool = True) -> Dict[str, Dict[str, Any]]:
    lower = text.lower()
    output: Dict[str, Dict[str, Any]] = {}
    for name, keywords in CLAUSE_KEYWORDS.items():
        matches = [k for k in keywords if k in lower]
        detected = bool(matches) and (is_contract or name in {"confidentiality", "data_privacy", "intellectual_property"})
        output[name] = {
            "detected": detected,
            "present": detected,
            "matched_terms": matches,
        }
    return output
