# API

GET `/` - health check

POST `/api/analyze`
multipart field `file`: PDF, DOCX or TXT

POST `/api/ask`
```json
{
  "contract_text": "contract text",
  "question": "Can I terminate early?"
}
```
