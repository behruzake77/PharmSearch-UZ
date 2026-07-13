"""
Apteka Ovozli Qidiruv Tizimi (AVQT) — FastAPI backend entrypoint.

Bu fayl hozircha faqat loyiha skeletini ifodalaydi (BOSQICH 1).
AI (Whisper, RapidFuzz) va qidiruv (GoPharm, Google) logikasi keyingi
bosqichlarda ai/ va search/ modullariga qo'shiladi.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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


@app.get("/")
async def root():
    return {"message": "AVQT backend ishlayapti"}


@app.get("/api/v1/health")
async def health():
    # Hozircha soddalashtirilgan holat — Whisper va DB tekshiruvlari
    # keyingi bosqichlarda (BOSQICH 4, BOSQICH 2) qo'shiladi.
    return {"status": "ok", "whisper_loaded": False, "db_connected": False}
