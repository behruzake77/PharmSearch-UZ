"""
Apteka Ovozli Qidiruv Tizimi (AVQT) — FastAPI backend entrypoint.

Bu fayl hozircha faqat loyiha skeletini ifodalaydi (BOSQICH 1).
AI (Whisper, RapidFuzz) va qidiruv (GoPharm, Google) logikasi keyingi
bosqichlarda ai/ va search/ modullariga qo'shiladi.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from backend.api.auth import router as auth_router
from backend.api.search import router as search_router
from backend.db.database import Base, SessionLocal, engine
from backend.db import models  # noqa: F401  (jadvallarni Base.metadata ga ro'yxatdan o'tkazish uchun)
from backend.db.seed import seed_initial_data
from backend.ai.speech_to_text import is_model_loaded, preload_model

logger = logging.getLogger(__name__)

# Startup hook
def startup_event() -> None:
    """Startup event handler"""
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # DB seed
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()

    # Whisper modelini startup'da SINXRON yuklash — birinchi ovozli so'rovda
    # kechikish bo'lmasin. Model workspace cache'dan ~2-3s da yuklanadi.
    preload_model()
    logger.info("Application startup complete")


app = FastAPI(
    title="Apteka Ovozli Qidiruv Tizimi (AVQT)",
    description="O'zbekiston aptekalari uchun ovozli dori qidiruv tizimi — backend API",
    version="0.1.0",
)

# Frontend (Next.js) dev serveri bilan ishlash uchun CORS ruxsati.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(search_router)


@app.on_event("startup")
def on_startup() -> None:
    startup_event()


@app.get("/")
async def root():
    return {"message": "AVQT backend ishlayapti"}


@app.get("/api/v1/health")
async def health():
    db_connected = False
    whisper_ready = False
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_connected = True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        db_connected = False

    whisper_ready = is_model_loaded()
    
    return {
        "status": "ok" if db_connected else "degraded",
        "database": "connected" if db_connected else "disconnected",
        "whisper": "loaded" if whisper_ready else "not_loaded",
        "timestamp": None,
    }
