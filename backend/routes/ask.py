import asyncio
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from services.pipeline import answer_question

router = APIRouter(tags=["Questions"])


class ChatMessagePayload(BaseModel):
    sender: str
    text: str


class AskRequest(BaseModel):
    contract_text: str = Field(min_length=1, max_length=500000)
    question: str = Field(min_length=1, max_length=2000)
    conversation_history: Optional[List[ChatMessagePayload]] = None
    file_id: Optional[str] = None


@router.post("/ask")
async def handle_ask_question(payload: AskRequest):
    try:
        history_dicts = None
        if payload.conversation_history:
            history_dicts = [{"sender": m.sender, "text": m.text} for m in payload.conversation_history]

        result = await asyncio.to_thread(
            answer_question,
            payload.contract_text,
            payload.question,
            conversation_history=history_dicts,
        )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
