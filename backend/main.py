"""
Apteka Ovozli Qidiruv Tizimi (AVQT) — FastAPI backend entrypoint.

Bu fayl hozircha faqat loyiha skeletini ifodalaydi (BOSQICH 1).
AI (Whisper, RapidFuzz) va qidiruv (GoPharm, Google) logikasi keyingi
bosqichlarda ai/ va search/ modullariga qo'shiladi.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.auth import router as auth_router
from sqlalchemy import text

from backend.db.database import Base, SessionLocal, engine
from backend.db import models  # noqa: F401  (jadvallarni Base.metadata ga ro'yxatdan o'tkazish uchun)
from backend.db.seed import seed_initial_data
from backend.ai.speech_to_text import is_model_loaded

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


@app.on_event("startup")
def on_startup() -> None:
    # Jadvallar Alembic migratsiyalari orqali yaratiladi; bu yerda faqat
    # boshlang'ich admin/apteka yozuvi (agar hali bo'lmasa) yaratiladi.
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()


@app.get("/")
async def root():
    return {"message": "AVQT backend ishlayapti"}


@app.get("/api/v1/health")
async def health():
    db_connected = False
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_connected = True
    except Exception:
        db_connected = False

    return {"status": "ok", "whisper_loaded": is_model_loaded(), "db_connected": db_connected}
