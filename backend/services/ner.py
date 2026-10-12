import re
from typing import Any, Dict, List

DATE_PATTERNS = [
    r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b",
    r"\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b",
    r"\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b",
]

MONEY_PATTERN = r"(?:₹|Rs\.?|INR|\$|USD|€|EUR)\s?[\d,]+(?:\.\d{2})?"
EMAIL_PATTERN = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"
DURATION_PATTERN = r"\b\d+\s+(?:days?|weeks?|months?|calendar\s+months?|years?)\b"

PHONE_PATTERN = r"(?:\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b|\b[6-9]\d{9}\b)"
NON_PARTY_WORDS = {
    "building", "room", "flat", "society", "ltd", "limited", "co", "op", "floor", "road",
    "street", "mumbai", "pune", "delhi", "nagar", "complex", "agreement", "lease", "contract",
}

SALUTATION_NAME_PATTERN = r"\b(?:Smt\.?|Shri\.?|Mr\.?|Mrs\.?|Ms\.?|Dr\.?)\s+([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){1,3})\b"
NAME_LINE_PATTERN = r"^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}$"
PROPERTY_PATTERN = r"(?:Room|Flat|Apt|Apartment|Unit|सदनिका|गाळा)\s*(?:no\.?|क्र\.?|number)?\s*[:\s-]*\d+[A-Za-z0-9-]*"

PARTY_PATTERNS = [
    # "between John Doe ("Landlord") and Jane Smith ("Tenant")"
    r"between\s+([A-Z][A-Za-z\s\.\,\&]+?)\s*(?:\([^\)]+\))?\s+and\s+([A-Z][A-Za-z\s\.\,\&]+?)(?:\s*\([^\)]+\)|,|\.|\n)",
    # "Party A: Name" or "Landlord: Name"
    r"(?:\bLandlord\b|\bTenant\b|\bEmployer\b|\bEmployee\b|\bClient\b|\bCustomer\b|\bContractor\b|\bVendor\b|\bBorrower\b|\bLender\b|\bOwner\b|\bApplicant\b|\bअर्जदार\b|\bभाडोत्री\b):\s*([A-Za-z\u0900-\u097F\s\.\,]+?)(?:\n|,|\.)",
]


def extract_entities(text: str) -> Dict[str, List[str]]:
    dates = set()
    for pattern in DATE_PATTERNS:
        for match in re.findall(pattern, text, re.I):
            clean = match.strip()
            if len(clean) >= 4:
                dates.add(clean)

    money = set()
    for m in re.findall(MONEY_PATTERN, text, re.I):
        money.add(m.strip())

    emails = set()
    for e in re.findall(EMAIL_PATTERN, text):
        emails.add(e.strip())

    phones = set()
    for p in re.findall(PHONE_PATTERN, text):
        phones.add(p.strip())

    durations = set()
    for d in re.findall(DURATION_PATTERN, text, re.I):
        durations.add(d.strip())

    properties = set()
    for prop in re.findall(PROPERTY_PATTERN, text, re.I):
        properties.add(prop.strip())

    parties = set()
    # 1. Names with salutations (e.g. Smt. Namrata Narendra Lad, Mr. Siddhesh Bhogaonkar)
    for m in re.finditer(r"\b((?:Smt\.?|Shri\.?|Mr\.?|Mrs\.?|Ms\.?|Dr\.?)\s+[A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){1,3})\b", text):
        full_val = m.group(1).strip()
        words = [w.lower().rstrip(".,") for w in full_val.split()]
        if not any(w in NON_PARTY_WORDS for w in words):
            parties.add(full_val)

    # 2. Standalone personal names on their own line (e.g. "Siddhesh Mohan Bhogaonkar")
    for raw_line in text.split("\n"):
        line = raw_line.strip()
        if re.match(NAME_LINE_PATTERN, line):
            words = [w.lower().rstrip(".,") for w in line.split()]
            if not any(w in NON_PARTY_WORDS for w in words) and 3 < len(line) < 50:
                parties.add(line)

    # 3. Traditional contractual party patterns
    for p_pat in PARTY_PATTERNS:
        matches = re.findall(p_pat, text, re.I)
        for match in matches:
            if isinstance(match, tuple):
                for sub in match:
                    cleaned_name = sub.strip()
                    cleaned_name = re.sub(r'^(the\s+|an?\s+)', '', cleaned_name, flags=re.I)
                    cleaned_name = re.sub(r'["\']', '', cleaned_name)
                    words = [w.lower().rstrip(".,") for w in cleaned_name.split()]
                    if 2 < len(cleaned_name) < 60 and not any(w in NON_PARTY_WORDS for w in words):
                        parties.add(cleaned_name)
            elif isinstance(match, str):
                cleaned_name = match.strip()
                cleaned_name = re.sub(r'^(the\s+|an?\s+)', '', cleaned_name, flags=re.I)
                cleaned_name = re.sub(r'["\']', '', cleaned_name)
                words = [w.lower().rstrip(".,") for w in cleaned_name.split()]
                if 2 < len(cleaned_name) < 60 and not any(w in NON_PARTY_WORDS for w in words):
                    parties.add(cleaned_name)

    return {
        "parties": sorted(parties),
        "dates": sorted(dates),
        "money": sorted(money),
        "durations": sorted(durations),
        "emails": sorted(emails),
        "phones": sorted(phones),
        "properties": sorted(properties),
    }
