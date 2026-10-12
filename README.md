# AI-Powered Multi-Contract Analyzer

Starter implementation for the college project:
AI-Powered Multi-Contract Analyzer Using Small Language Model for Mobile Deployment.

Pipeline:
Mobile (Expo) -> FastAPI -> document extraction -> NLP -> retrieval -> Qwen2.5-1.5B-Instruct SLM -> results.

## Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload
```

Swagger: http://127.0.0.1:8000/docs

## Mobile
```bash
cd mobile
npm install
npx expo start
```

For a real phone, edit `mobile/src/config.ts` and replace 127.0.0.1 with your computer LAN IP.

## Firebase
Enable Authentication, Firestore and Storage in your Firebase project, then place the web config in `mobile/src/firebaseConfig.ts`.

Do not put Firebase Admin service-account private keys in the mobile app.

## Dataset
Add UTF-8 `.txt` contracts to the 10 category folders under `dataset/`, then run `backend/training/train_classifier.py`.

The SLM is configured as `Qwen/Qwen2.5-1.5B-Instruct` and is loaded when generation is first required.

Academic prototype only; model output is not legal advice.
