import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.analyze import router as analyze_router
from routes.ask import router as ask_router
from services.retrieval import get_embedder
from services.slm import warmup_slm

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("LexiGuard AI server starting up. Pre-warming SLM & retrieval models...")
    # Preload models in background thread so startup is non-blocking
    asyncio.create_task(asyncio.to_thread(warmup_slm))
    asyncio.create_task(asyncio.to_thread(get_embedder))
    yield
    logger.info("LexiGuard AI server shutting down.")


app = FastAPI(title="AI Contract Analyzer API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router, prefix="/api")
app.include_router(ask_router, prefix="/api")


@app.get("/")
def root():
    return {
        "message": "AI Contract Analyzer API (LexiGuard AI) is running",
        "docs": "/docs",
        "status": "ready",
    }
