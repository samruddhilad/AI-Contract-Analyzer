from pathlib import Path
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

DATASET = Path("../../dataset")
OUT = Path("../models_cache")
OUT.mkdir(exist_ok=True)

def main():
    texts, labels = [], []
    for folder in DATASET.iterdir():
        if not folder.is_dir():
            continue
        for f in folder.glob("*.txt"):
            t = f.read_text(encoding="utf-8", errors="ignore").strip()
            if t:
                texts.append(t)
                labels.append(folder.name)

    if len(set(labels)) < 2:
        print("Note: Insufficient TXT training samples in dataset/. Using built-in rule-based classifier.")
        return

    vectorizer = TfidfVectorizer(lowercase=True, ngram_range=(1, 2), max_features=30000)
    X = vectorizer.fit_transform(texts)

    Xtr, Xte, ytr, yte = train_test_split(
        X, labels, test_size=0.2, random_state=42, stratify=labels
    )

    model = LogisticRegression(max_iter=2000, class_weight="balanced")
    model.fit(Xtr, ytr)
    print(classification_report(yte, model.predict(Xte)))

    joblib.dump({"vectorizer": vectorizer, "model": model}, OUT / "contract_classifier.joblib")
    print("Saved", OUT / "contract_classifier.joblib")

if __name__ == "__main__":
    main()
