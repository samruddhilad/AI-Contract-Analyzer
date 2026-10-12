import re
from pathlib import Path
from typing import Any, Dict

import joblib

MODEL_PATH = Path("models_cache/contract_classifier.joblib")

CONTRACT_TYPES_RULES = [
    (
        "Residential Lease Agreement",
        r"(?:residential\s+lease|lease\s+agreement|tenancy\s+agreement|landlord\s+and\s+tenant|premises\s+located\s+at|rent\s+agreement|rent\s+letter|leave\s+and\s+license|मासिक\s+भाडे|भाडे\s*करार|भाडे\s*तत्त्वावर|भाडोत्री|भाडेपट्टा)",
    ),
    (
        "Commercial Lease Agreement",
        r"\b(?:commercial\s+lease|business\s+premises|lessor\s+and\s+lessee|rentable\s+square\s+feet)\b",
    ),
    (
        "Non-Disclosure Agreement (NDA)",
        r"\b(?:non-disclosure\s+agreement|confidentiality\s+agreement|proprietary\s+information\s+agreement|receiving\s+party\s+and\s+disclosing\s+party)\b",
    ),
    (
        "Employment Agreement",
        r"\b(?:employment\s+agreement|employment\s+contract|offer\s+of\s+employment|employee\s+and\s+employer|job\s+title|salary\s+and\s+benefits)\b",
    ),
    (
        "Master Services Agreement (MSA)",
        r"\b(?:master\s+services\s+agreement|service\s+agreement|statement\s+of\s+work|client\s+and\s+service\s+provider|deliverables\s+and\s+milestones)\b",
    ),
    (
        "Consulting Agreement",
        r"\b(?:consulting\s+agreement|independent\s+contractor|consultant\s+services|retainer\s+fee)\b",
    ),
    (
        "Vendor & Supplier Contract",
        r"\b(?:vendor\s+agreement|supply\s+agreement|procurement\s+contract|purchase\s+order\s+terms)\b",
    ),
    (
        "Loan & Financing Agreement",
        r"\b(?:loan\s+agreement|promissory\s+note|borrower\s+and\s+lender|principal\s+amount|interest\s+rate|maturity\s+date)\b",
    ),
    (
        "Partnership Agreement",
        r"\b(?:partnership\s+agreement|joint\s+venture|general\s+partner|limited\s+partner|profit\s+sharing)\b",
    ),
]

NON_CONTRACT_CATEGORIES = [
    (
        "Financial Report & Spreadsheet",
        "financial",
        r"\b(?:balance\s+sheet|income\s+statement|cash\s+flow|revenue|fiscal\s+year|q1|q2|q3|q4|ebitda|assets\s+and\s+liabilities|operating\s+expenses|invoice\s+number|amount\s+due|subtotal|total\s+tax)\b",
    ),
    (
        "Technical Specification & Architecture",
        "technical",
        r"\b(?:technical\s+specification|system\s+architecture|api\s+documentation|software\s+requirements|database\s+schema|endpoint|microservices|infrastructure|tech\s+stack)\b",
    ),
    (
        "Presentation & Slide Deck",
        "presentation",
        r"\b(?:agenda|slide\s+\d+|presentation|key\s+takeaways|executive\s+summary\s+overview|q&a\s+session|pitch\s+deck)\b",
    ),
    (
        "Policy & Compliance Document",
        "policy",
        r"\b(?:privacy\s+policy|terms\s+of\s+service|terms\s+of\s+use|acceptable\s+use|compliance\s+guidelines|data\s+protection\s+policy|code\s+of\s+conduct|gdpr|hipaa)\b",
    ),
]

GENERAL_CONTRACT_INDICATORS = [
    "agreement",
    "parties",
    "governing law",
    "termination",
    "confidentiality",
    "liability",
    "indemnification",
    "in witness whereof",
    "hereby agree",
    "terms and conditions",
]


class DocumentClassifier:
    def __init__(self):
        self.vectorizer = None
        self.model = None
        if MODEL_PATH.exists():
            try:
                bundle = joblib.load(MODEL_PATH)
                self.vectorizer = bundle.get("vectorizer")
                self.model = bundle.get("model")
            except Exception:
                pass

    def predict(self, text: str, filename: str = "") -> Dict[str, Any]:
        lower = text.lower()[:8000]
        fname_lower = filename.lower()

        # 1. Check ML model if available
        ml_type = None
        ml_conf = 0.0
        if self.model and self.vectorizer:
            try:
                x = self.vectorizer.transform([text[:4000]])
                pred = self.model.predict(x)[0]
                conf = float(max(self.model.predict_proba(x)[0]))
                if conf >= 0.55:
                    ml_type = str(pred)
                    ml_conf = round(conf, 4)
            except Exception:
                pass

        # 2. Check Specific Legal Contract Rules (Text & Filename)
        combined_probe = f"{fname_lower} {lower}"
        for title, pattern in CONTRACT_TYPES_RULES:
            if re.search(pattern, combined_probe, re.I):
                return {
                    "contract_type": title,
                    "category": "contract",
                    "is_contract": True,
                    "confidence": max(0.92, ml_conf),
                    "status": "ok",
                }

        # 3. Check Non-Contract Categories
        for title, cat, pattern in NON_CONTRACT_CATEGORIES:
            matches = len(re.findall(pattern, lower, re.I))
            if matches >= 3 or (cat == "financial" and (fname_lower.endswith(".csv") or fname_lower.endswith(".xlsx"))):
                return {
                    "contract_type": title,
                    "category": cat,
                    "is_contract": False,
                    "confidence": 0.88,
                    "status": "ok",
                }

        # 4. Check General Contract Signals
        contract_hits = sum(1 for kw in GENERAL_CONTRACT_INDICATORS if kw in lower)
        if contract_hits >= 3:
            return {
                "contract_type": ml_type or "Commercial Legal Agreement",
                "category": "contract",
                "is_contract": True,
                "confidence": max(0.85, ml_conf) if ml_type else 0.80,
                "status": "ok",
            }

        # 5. Check Slide / Presentation indicators (e.g. PPTX)
        if fname_lower.endswith(".pptx") or "--- [slide" in lower:
            return {
                "contract_type": "Presentation Slide Deck",
                "category": "presentation",
                "is_contract": False,
                "confidence": 0.90,
                "status": "ok",
            }

        # 6. Default General Business / Technical Document
        return {
            "contract_type": "General Business Document",
            "category": "general",
            "is_contract": False,
            "confidence": 0.70,
            "status": "ok",
        }


classifier = DocumentClassifier()
